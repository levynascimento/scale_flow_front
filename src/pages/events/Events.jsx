// src_frontend/pages/events/Events.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
    getBandEvents,
    getBandEventsToday,
    getBandEventsFuture,
    getBandEventsPast,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from '../../services/eventApi.js';

import { getBandIntegrants } from '../../services/integrantsApi.js';
import { getRoles } from '../../services/rolesApi.js';
import { getLineups } from '../../services/lineupApi.js'; // ⭐ importa formações

import Button from '../../components/Button.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

import EventCard from "./components/EventCard.jsx";
import EventFormModal from './EventFormModal.jsx';
import EventViewModal from './EventViewModal.jsx';
import EventFilterBar from './EventFilterBar.jsx';
import EventEscalationModal from "./EventEscalationModal.jsx";

export default function Events() {
    const role = localStorage.getItem("bandRole");
    const isAdmin = role === "ADMIN";

    const { id: bandId } = useParams();

    const today = new Date().toISOString().slice(0, 10);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [filter, setFilter] = useState("now");

    // ⭐ Escalação
    const [openEscalation, setOpenEscalation] = useState(false);
    const [escalationEvent, setEscalationEvent] = useState(null);

    const [allIntegrants, setAllIntegrants] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [lineups, setLineups] = useState([]); // ⭐ formações da banda

    /** Atualiza apenas 1 evento da lista */
    function updateEventInList(eventId, newData) {
        setEvents(prev =>
            prev.map(ev =>
                ev.id === eventId ? { ...ev, ...newData } : ev
            )
        );
    }

    // -----------------------------------------------------
    // LOAD EVENTS
    // -----------------------------------------------------
    async function loadEvents() {
        try {
            setLoading(true);

            let data = [];

            if (filter === "now") {
                data = await getBandEventsToday(bandId);
            } else if (filter === "future") {
                data = await getBandEventsFuture(bandId);
            } else if (filter === "past") {
                data = await getBandEventsPast(bandId);
            } else {
                data = await getBandEvents(bandId);
            }

            const now = new Date();

            if (filter === "past") {
                data.sort((a, b) => new Date(b.startingTime) - new Date(a.startingTime));
            } else if (filter === "future" || filter === "now") {
                data.sort((a, b) => new Date(a.startingTime) - new Date(b.startingTime));
            } else {
                data.sort((a, b) => {
                    const aStart = new Date(a.startingTime);
                    const bStart = new Date(b.startingTime);

                    const aEnded = new Date(a.endingTime) < now;
                    const bEnded = new Date(b.endingTime) < now;

                    const aIsToday = aStart <= now && new Date(a.endingTime) >= now;
                    const bIsToday = bStart <= now && new Date(b.endingTime) >= now;

                    if (aIsToday && !bIsToday) return -1;
                    if (!aIsToday && bIsToday) return 1;

                    if (!aEnded && bEnded) return -1;
                    if (aEnded && !bEnded) return 1;

                    if (!aEnded && !bEnded) return aStart - bStart;

                    return bStart - aStart;
                });
            }

            setEvents(data);

        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar eventos.");
        } finally {
            setLoading(false);
        }
    }

    // Rodar ao carregar / trocar filtro
    useEffect(() => {
        async function run() {
            await loadEvents();
        }
        if (bandId) run();
    }, [bandId, filter]);

    // -----------------------------------------------------
    // LOAD INTEGRANTS + ROLES + LINEUPS
    // -----------------------------------------------------
    useEffect(() => {
        async function loadAux() {
            try {
                const integrants = await getBandIntegrants(bandId);
                const roles = await getRoles();
                const bandLineups = await getLineups(bandId); // ⭐ busca formações

                setAllIntegrants(integrants);
                setAllRoles(roles);
                setLineups(bandLineups);

            } catch (err) {
                console.error("Erro ao carregar integrants/roles/lineups:", err);
            }
        }

        if (bandId) loadAux();
    }, [bandId]);

    // -----------------------------------------------------
    // VIEW DETAILS
    // -----------------------------------------------------
    async function handleOpenDetails(eventId) {
        try {
            const data = await getEventById(eventId);
            setSelectedEvent(data);
        } catch {
            toast.error("Erro ao carregar detalhes do evento.");
        }
    }

    // -----------------------------------------------------
    // CREATE / EDIT EVENT
    // -----------------------------------------------------
    function handleOpenCreate() {
        setEditingEvent(null);
        setFormOpen(true);
    }

    function handleOpenEdit() {
        if (!selectedEvent) return;
        setEditingEvent(selectedEvent);
        setFormOpen(true);
    }

    async function handleSubmitForm(formData) {
        try {
            if (editingEvent) {
                await updateEvent(editingEvent.id, formData);
                toast.success("Evento atualizado!");
            } else {
                await createEvent(bandId, formData);
                toast.success("Evento criado!");
            }

            setFormOpen(false);
            setEditingEvent(null);
            setSelectedEvent(null);

            await loadEvents();

        } catch {
            toast.error("Erro ao salvar evento.");
        }
    }

    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------
    async function handleConfirmDelete() {
        try {
            await deleteEvent(eventToDelete.id);
            toast.success("Evento excluído!");

            setEventToDelete(null);
            setSelectedEvent(null);

            await loadEvents();

        } catch {
            toast.error("Erro ao excluir evento.");
        }
    }

    // -----------------------------------------------------
    // ESCALAÇÃO
    // -----------------------------------------------------
    function handleOpenEscalation(ev) {
        setEscalationEvent(ev);
        setOpenEscalation(true);
    }

    // -----------------------------------------------------
    // RENDER
    // -----------------------------------------------------
    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[#c4b5ff]">Eventos</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Gerencie e filtre os eventos da banda
                    </p>
                </div>

                <Button onClick={handleOpenCreate}>
                    Novo evento
                </Button>
            </div>

            <EventFilterBar current={filter} onChange={setFilter} />

            {loading ? (
                <p className="text-gray-400 text-sm">Carregando eventos…</p>
            ) : events.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum evento encontrado.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {events.map(ev => (
                        <EventCard
                            key={ev.id}
                            event={ev}
                            onClick={() => handleOpenDetails(ev.id)}
                        />
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
                    if (selectedEvent) {
                        updateEventInList(selectedEvent.id, changes);
                    }
                    loadEvents();
                }}
            />

            <EventFormModal
                open={formOpen}
                event={editingEvent}
                lineups={lineups} // ⭐ passa formações para o modal
                onClose={() => {
                    setFormOpen(false);
                    setEditingEvent(null);
                }}
                onSubmit={handleSubmitForm}
            />

            <ConfirmDialog
                open={!!eventToDelete}
                title="Excluir evento"
                message={eventToDelete ? `Deseja excluir o evento "${eventToDelete.name}"?` : ""}
                onConfirm={handleConfirmDelete}
                onCancel={() => setEventToDelete(null)}
            />

            {/* ⭐ ESCALAÇÃO */}
            <EventEscalationModal
                open={openEscalation}
                event={escalationEvent}
                onClose={() => setOpenEscalation(false)}
                allIntegrants={allIntegrants}
                allRoles={allRoles}
                onUpdated={() => loadEvents()}
                editable={isAdmin}
            />

        </div>
    );
}
