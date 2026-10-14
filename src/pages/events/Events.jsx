import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { bandService, eventService, lineupService, roleService } from '../../services/index.js';
import { bandSession } from '../../core/session/BandSession.js';
import { EventFilter } from '../../domain/EventFilter.js';

import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

import EventCard from "./components/EventCard.jsx";
import EventFormModal from './EventFormModal.jsx';
import EventViewModal from './EventViewModal.jsx';
import EventFilterBar from './EventFilterBar.jsx';
import EventEscalationModal from "./EventEscalationModal.jsx";

export default function Events() {
    const isAdmin = bandSession.isAdmin;
    const { id: bandId } = useParams();

    /*
     * ♻️ REFACTORING — Inline Variable (today)
     * Antes: `const today = new Date().toISOString().slice(0, 10)` era
     * calculado a cada render e nunca usado.
     * Benefícios: - Código morto  + Legibilidade
     */

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);

    /*
     * ♻️ REFACTORING — Change Function Declaration (filter: string → EventFilter)
     * Antes: o estado era a string "now" e cada parte do código interpretava.
     * Agora: o estado guarda o objeto EventFilter, que sabe endpoint e ordem.
     * Benefícios: + Coesão  - Magic strings  + Segurança (sem typo em "futrue")
     */
    const [filter, setFilter] = useState(EventFilter.NOW);

    const [openEscalation, setOpenEscalation] = useState(false);
    const [escalationEvent, setEscalationEvent] = useState(null);

    const [allIntegrants, setAllIntegrants] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [lineups, setLineups] = useState([]);

    function updateEventInList(eventId, changes) {
        setEvents(prev => prev.map(ev => (ev.id === eventId ? ev.with(changes) : ev)));
    }

    /*
     * ♻️ REFACTORING — Extract Method + Move Method (loadEvents)
     * Antes: loadEvents tinha 60 linhas: um if/else de 4 ramos para escolher
     * a função da API e um if/else de 3 ramos com uma função de comparação
     * de 20 linhas para ordenar.
     * Agora: `eventService.listByFilter(bandId, filter)`, e o filtro já sabe
     * qual endpoint chamar e como ordenar.
     * Benefícios:
     *   - Complexidade ciclomática (de ~10 caminhos para 1)
     *   + Coesão (a regra de cada filtro mora no EventFilter)
     *   - Acoplamento (o componente não conhece as 4 URLs)
     *   + Testabilidade (ordenação testável sem React)
     */
    async function loadEvents() {
        try {
            setLoading(true);
            setEvents(await eventService.listByFilter(bandId, filter));
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar eventos.");
        } finally {
            setLoading(false);
        }
    }

    /*
     * ♻️ REFACTORING — Inline Method (run)
     * Antes:
     *   async function run() { await loadEvents(); }
     *   if (bandId) run();
     * `run` só repassava a chamada para loadEvents, sem acrescentar nada.
     * Benefícios: - Indireção desnecessária  + Legibilidade
     */
    useEffect(() => {
        if (bandId) loadEvents();
    }, [bandId, filter]);

    /*
     * ♻️ REFACTORING — Extract Method + paralelização (loadAux)
     * Antes: 3 `await` em sequência para dados independentes.
     * Benefícios: + Desempenho (Promise.all)  + Legibilidade
     */
    useEffect(() => {
        async function loadAux() {
            try {
                const [integrants, roles, bandLineups] = await Promise.all([
                    bandService.listMembers(bandId),
                    roleService.list(),
                    lineupService.listByBand(bandId)
                ]);
                setAllIntegrants(integrants);
                setAllRoles(roles);
                setLineups(bandLineups);
            } catch (err) {
                console.error("Erro ao carregar integrants/roles/lineups:", err);
            }
        }

        if (bandId) loadAux();
    }, [bandId]);

    async function handleOpenDetails(eventId) {
        try {
            setSelectedEvent(await eventService.getById(eventId));
        } catch {
            toast.error("Erro ao carregar detalhes do evento.");
        }
    }

    function handleOpenCreate() {
        setEditingEvent(null);
        setFormOpen(true);
    }

    function handleOpenEdit() {
        if (!selectedEvent) return;
        setEditingEvent(selectedEvent);
        setFormOpen(true);
    }

    /*
     * ♻️ REFACTORING — Extract Method (closeForm)
     * Antes: `setFormOpen(false); setEditingEvent(null);` repetido no submit e
     * no onClose do modal.
     * Benefícios: - Duplicação  + Legibilidade
     */
    function closeForm() {
        setFormOpen(false);
        setEditingEvent(null);
    }

    /*
     * ♻️ REFACTORING — Extract Method (saveEvent)
     * Antes: o if/else de criar vs editar ficava no meio do try/catch, junto
     * com toast e limpeza de estado.
     * Benefícios: + Legibilidade  + Coesão
     */
    async function saveEvent(formData) {
        if (editingEvent) {
            await eventService.update(editingEvent.id, formData);
            return "Evento atualizado!";
        }
        await eventService.create(bandId, formData);
        return "Evento criado!";
    }

    async function handleSubmitForm(formData) {
        try {
            toast.success(await saveEvent(formData));
            closeForm();
            setSelectedEvent(null);
            await loadEvents();
        } catch {
            toast.error("Erro ao salvar evento.");
        }
    }

    async function handleConfirmDelete() {
        try {
            await eventService.delete(eventToDelete.id);
            toast.success("Evento excluído!");
            setEventToDelete(null);
            setSelectedEvent(null);
            await loadEvents();
        } catch {
            toast.error("Erro ao excluir evento.");
        }
    }

    function handleOpenEscalation(ev) {
        setEscalationEvent(ev);
        setOpenEscalation(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[#c4b5ff]">Eventos</h1>
                    <p className="text-sm text-gray-400 mt-1">Gerencie e filtre os eventos da banda</p>
                </div>

                <Button onClick={handleOpenCreate}>Novo evento</Button>
            </div>

            <EventFilterBar current={filter} onChange={setFilter} />

            {loading ? (
                <p className="text-gray-400 text-sm">Carregando eventos…</p>
            ) : events.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum evento encontrado.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {events.map(ev => (
                        <EventCard key={ev.id} event={ev} onClick={() => handleOpenDetails(ev.id)} />
                    ))}
                </div>
            )}

            <EventViewModal
                open={!!selectedEvent}
                event={selectedEvent}
                isAdmin={isAdmin}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleOpenEdit}
                onDelete={() => setEventToDelete(selectedEvent)}
                onEscalation={handleOpenEscalation}
                onUpdated={(changes) => {
                    if (selectedEvent) updateEventInList(selectedEvent.id, changes);
                    loadEvents();
                }}
            />

            <EventFormModal
                open={formOpen}
                event={editingEvent}
                lineups={lineups}
                onClose={closeForm}
                onSubmit={handleSubmitForm}
            />

            <ConfirmDialog
                open={!!eventToDelete}
                title="Excluir evento"
                message={eventToDelete ? `Deseja excluir o evento "${eventToDelete.name}"?` : ""}
                onConfirm={handleConfirmDelete}
                onCancel={() => setEventToDelete(null)}
            />

            <EventEscalationModal
                open={openEscalation}
                event={escalationEvent}
                onClose={() => setOpenEscalation(false)}
                allIntegrants={allIntegrants}
                allRoles={allRoles}
                onUpdated={loadEvents}
                editable={isAdmin}
            />
        </div>
    );
}
