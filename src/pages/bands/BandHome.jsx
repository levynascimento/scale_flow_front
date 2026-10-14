import { useEffect, useMemo, useState } from "react";
import EventViewModal from "../events/EventViewModal.jsx";
import EventEscalationModal from "../events/EventEscalationModal.jsx";
import { bandService, eventService, musicService, roleService, userService } from "../../services/index.js";
import { bandSession } from "../../core/session/BandSession.js";
import { DateFormatter } from "../../core/format/DateFormatter.js";
import { Event } from "../../domain/Event.js";

/*
 * ♻️ REFACTORING — Extract Method (loadDashboard)
 * Antes: o useEffect tinha 6 `await` em sequência (uma requisição esperando
 * a outra) e 6 setState misturados com as chamadas. Além disso,
 * getBandMembers() e getBandIntegrants() buscavam o MESMO endpoint
 * (/bands/{id}/integrants) duas vezes.
 * Agora: uma função nomeada busca tudo em paralelo (Promise.all) e devolve
 * um objeto com o resultado.
 * Benefícios:
 *   + Legibilidade
 *   - Duplicação (uma requisição repetida a menos)
 *   + Desempenho (requisições em paralelo)
 *   + Coesão (busca de dados separada da atualização de estado)
 */
async function loadDashboard(bandId) {
    const [band, members, musics, events, roles, currentUser] = await Promise.all([
        bandService.getById(bandId),
        bandService.listMembers(bandId),
        musicService.listByBand(bandId),
        eventService.listAll(bandId),
        roleService.list(),
        // se /users falhar, o painel continua funcionando sem o bloco "escalado em"
        userService.getCurrent().catch(() => null)
    ]);
    return { band, members, musics, events, roles, currentUser };
}

export default function BandHome() {
    const bandId = bandSession.bandId;
    const isAdmin = bandSession.isAdmin;

    const [dashboard, setDashboard] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openEscalation, setOpenEscalation] = useState(false);
    const [escalationEvent, setEscalationEvent] = useState(null);

    /*
     * ♻️ REFACTORING — Inline Variable (membersCount, musicsCount, allIntegrants, allRoles)
     * Antes: 6 estados separados guardavam pedaços do mesmo carregamento,
     * incluindo membersCount/musicsCount, que eram só `lista.length`.
     * Agora: um único estado `dashboard` e os contadores são lidos na hora.
     * Benefícios:
     *   - Estado redundante
     *   + Consistência (impossível o contador divergir da lista)
     *   + Legibilidade
     */
    useEffect(() => {
        if (!bandId) return;

        async function load() {
            try {
                setLoading(true);
                const data = await loadDashboard(bandId);
                setDashboard(data);
                setEvents(data.events);
            } catch (err) {
                console.error("Erro ao carregar BandHome:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [bandId]);

    /*
     * ♻️ REFACTORING — Extract Method (reloadEvents)
     * Antes: `getBandEvents(bandId).then(setEvents)` repetido nos dois modais.
     * Benefícios:
     *   - Duplicação
     *   + Legibilidade
     */
    function reloadEvents() {
        eventService.listAll(bandId).then(setEvents);
    }

    /*
     * ♻️ REFACTORING — Move Method (Event.nextUpcoming)
     * Antes: filter + sort + [0] com `new Date(...)` inline no useMemo.
     * Benefícios: + Legibilidade  + Reuso  + Coesão
     */
    const nextEvent = useMemo(() => Event.nextUpcoming(events), [events]);

    /*
     * ♻️ REFACTORING — Extract Variable (upcomingCount)
     * Antes: `events.filter(e => new Date(e.startingTime) > new Date()).length`
     * escrito direto dentro da prop do StatCard.
     * Benefícios: + Legibilidade  - Lógica no JSX
     */
    const upcomingCount = events.filter(e => e.isUpcoming()).length;

    /*
     * Correção encontrada durante o refactoring: o código lia
     * localStorage.getItem("userId"), mas nenhuma tela grava essa chave.
     * O bloco "Você está escalado em" ficava sempre vazio. Agora o id vem de
     * GET /users (usuário logado), carregado junto com o resto.
     */
    const userId = dashboard?.currentUser?.id;

    /*
     * ♻️ REFACTORING — Move Method (Event.isUserEscalated / escalationOf)
     * Antes: a busca `e.escalations?.some(es => String(es.user?.id) === ...)`
     * aparecia aqui e de novo, como `.find(...)`, dentro do JSX.
     * Benefícios: - Duplicação  + Coesão  - Feature Envy
     */
    const userEvents = useMemo(() => {
        if (isAdmin || !userId) return [];
        return events.filter(e => e.isUserEscalated(userId));
    }, [events, isAdmin, userId]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-64 bg-[#1f1f26] rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-24 bg-[#1f1f26] rounded-xl animate-pulse" />
                    <div className="h-24 bg-[#1f1f26] rounded-xl animate-pulse" />
                    <div className="h-24 bg-[#1f1f26] rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (!dashboard?.band) {
        return <p className="text-gray-400">Banda não encontrada.</p>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{dashboard.band.name}</h1>

            {/* VISÃO GERAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Músicas" value={dashboard.musics.length} />
                <StatCard label="Integrantes" value={dashboard.members.length} />
                <StatCard label="Eventos futuros" value={upcomingCount} />
            </div>

            {/* CONTEXTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() => nextEvent && setSelectedEvent(nextEvent)}
                    className={`
                        bg-[#1f1f26] border border-[#2a2a30] rounded-xl p-4
                        ${nextEvent ? "cursor-pointer hover:border-indigo-500 transition-colors" : ""}
                    `}
                >
                    <p className="text-sm text-indigo-400 mb-1">Próximo evento</p>

                    {nextEvent ? (
                        <>
                            <p className="font-semibold">{nextEvent.name}</p>
                            <p className="text-sm text-gray-400">{DateFormatter.full(nextEvent.startingTime)}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">Nenhum evento futuro.</p>
                    )}
                </div>
            </div>

            {/* EVENTOS DO USUÁRIO */}
            {!isAdmin && (
                <div className="bg-[#1f1f26] border border-[#2a2a30] rounded-xl p-4">
                    <p className="text-sm text-indigo-400 mb-2">Você está escalado em</p>

                    {userEvents.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                            {userEvents.map(e => (
                                <li key={e.id}>
                                    • {e.name} —{" "}
                                    <span className="text-gray-400">
                                        {e.escalationOf(userId)?.role?.name || "—"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">
                            Você não está escalado em eventos futuros.
                        </p>
                    )}
                </div>
            )}

            <EventViewModal
                open={!!selectedEvent}
                event={selectedEvent}
                isAdmin={isAdmin}
                onClose={() => setSelectedEvent(null)}
                onEdit={() => setSelectedEvent(null)}
                onDelete={() => setSelectedEvent(null)}
                onEscalation={(ev) => {
                    setEscalationEvent(ev);
                    setOpenEscalation(true);
                }}
                onUpdated={reloadEvents}
            />

            <EventEscalationModal
                open={openEscalation}
                event={escalationEvent}
                onClose={() => setOpenEscalation(false)}
                allIntegrants={dashboard.members}
                allRoles={dashboard.roles}
                editable={isAdmin}
                onUpdated={reloadEvents}
            />
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-[#1f1f26] border border-[#2a2a30] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
