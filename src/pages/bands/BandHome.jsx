import { useEffect, useMemo, useState } from "react";
import { getBandById, getBandMembers } from "../../services/bandApi";
import { getBandMusics } from "../../services/musicApi";
import { getBandEvents } from "../../services/eventApi";

export default function BandHome() {
    const bandId = localStorage.getItem("bandId");
    const role = localStorage.getItem("bandRole");
    const userId = localStorage.getItem("userId");

    const isAdmin = role === "ADMIN";

    const [band, setBand] = useState(null);
    const [membersCount, setMembersCount] = useState(0);
    const [musicsCount, setMusicsCount] = useState(0);
    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);

    // =================================================
    // LOAD INICIAL
    // =================================================
    useEffect(() => {
        if (!bandId) return;

        async function load() {
            try {
                setLoading(true);

                const bandResp = await getBandById(bandId);
                setBand(bandResp);

                const members = await getBandMembers(bandId);
                setMembersCount(members.length);

                const musics = await getBandMusics(bandId);
                setMusicsCount(musics.length);

                const eventsResp = await getBandEvents(bandId);
                setEvents(eventsResp);

            } catch (err) {
                console.error("Erro ao carregar BandHome:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [bandId]);

    // =================================================
    // PRÓXIMO EVENTO
    // =================================================
    const nextEvent = useMemo(() => {
        const now = new Date();
        return events
            .filter(e => new Date(e.startingTime) > now)
            .sort((a, b) => new Date(a.startingTime) - new Date(b.startingTime))[0];
    }, [events]);

    // =================================================
    // STATUS DA ESCALA
    // =================================================
    let scaleStatus = null;
    let missingRoles = 0;

    if (nextEvent) {
        if (!nextEvent.escalationsCount || nextEvent.escalationsCount === 0) {
            scaleStatus = "none";
        } else if (
            nextEvent.lineupId &&
            nextEvent.lineupRolesCount &&
            nextEvent.escalationsCount < nextEvent.lineupRolesCount
        ) {
            scaleStatus = "incomplete";
            missingRoles =
                nextEvent.lineupRolesCount -
                nextEvent.escalationsCount;
        } else {
            scaleStatus = "complete";
        }
    }

    // =================================================
    // EVENTOS DO USUÁRIO (MEMBER)
    // =================================================
    const userEvents = useMemo(() => {
        if (isAdmin) return [];

        return events.filter(e =>
            e.escalations?.some(
                es => String(es.user?.id) === String(userId)
            )
        );
    }, [events, isAdmin, userId]);

    // =================================================
    // LOADING
    // =================================================
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

    if (!band) {
        return <p className="text-gray-400">Banda não encontrada.</p>;
    }

    // =================================================
    // RENDER
    // =================================================
    return (
        <div className="space-y-8">
            {/* HEADER */}
            <h1 className="text-3xl font-bold">
                {band.name}
            </h1>

            {/* VISÃO GERAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Músicas" value={musicsCount} />
                <StatCard label="Integrantes" value={membersCount} />
                <StatCard
                    label="Eventos futuros"
                    value={
                        events.filter(
                            e => new Date(e.startingTime) > new Date()
                        ).length
                    }
                />
            </div>

            {/* CONTEXTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Próximo evento */}
                <div className="bg-[#1f1f26] border border-[#2a2a30] rounded-xl p-4">
                    <p className="text-sm text-indigo-400 mb-1">
                        Próximo evento
                    </p>

                    {nextEvent ? (
                        <>
                            <p className="font-semibold">
                                {nextEvent.name}
                            </p>
                            <p className="text-sm text-gray-400">
                                {new Date(
                                    nextEvent.startingTime
                                ).toLocaleString("pt-BR")}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">
                            Nenhum evento futuro.
                        </p>
                    )}
                </div>

                {/* Status da escala */}
                <div className="bg-[#1f1f26] border border-[#2a2a30] rounded-xl p-4">
                    <p className="text-sm text-indigo-400 mb-1">
                        Escalação
                    </p>

                    {!nextEvent && (
                        <p className="text-sm text-gray-400">—</p>
                    )}

                    {nextEvent && scaleStatus === "complete" && (
                        <p className="text-green-400 font-medium">
                            ✅ Escala completa
                        </p>
                    )}

                    {nextEvent && scaleStatus === "incomplete" && (
                        <>
                            <p className="text-yellow-400 font-medium">
                                ⚠️ Escala incompleta
                            </p>
                            {isAdmin && (
                                <p className="text-sm text-gray-400">
                                    {missingRoles} papéis pendentes
                                </p>
                            )}
                        </>
                    )}

                    {nextEvent && scaleStatus === "none" && (
                        <p className="text-red-400 font-medium">
                            ❌ Nenhuma escala
                        </p>
                    )}
                </div>
            </div>

            {/* EVENTOS DO USUÁRIO (MEMBER) */}
            {!isAdmin && (
                <div className="bg-[#1f1f26] border border-[#2a2a30] rounded-xl p-4">
                    <p className="text-sm text-indigo-400 mb-2">
                        Você está escalado em
                    </p>

                    {userEvents.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                            {userEvents.map(e => {
                                const esc = e.escalations.find(
                                    es =>
                                        String(es.user?.id) ===
                                        String(userId)
                                );

                                return (
                                    <li key={e.id}>
                                        • {e.name} —{" "}
                                        <span className="text-gray-400">
                                            {esc?.role?.name || "—"}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">
                            Você não está escalado em eventos futuros.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// =================================================
// COMPONENTE AUXILIAR
// =================================================
function StatCard({ label, value }) {
    return (
        <div className="bg-[#1f1f26] border border-[#2a2a30] rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
