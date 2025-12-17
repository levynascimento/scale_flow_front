import { useEffect, useState } from "react";
import Button from "../../components/Button";
import {
    getEventMusics,
    getEventSuggestions,
    acceptSuggestion,
    deleteSuggestion,
    removeMusicFromEvent
} from "../../services/eventApi";
import SelectMusicModal from "./components/SelectMusicModal";
import toast from "react-hot-toast";
import { Users, Pencil, Trash2 } from "lucide-react";

export default function EventViewModal({
                                           open,
                                           event,
                                           onClose,
                                           isAdmin,
                                           onUpdated,
                                           onEscalation,
                                           onEdit,
                                           onDelete
                                       }) {
    const [musics, setMusics] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openSuggestModal, setOpenSuggestModal] = useState(false);

    async function loadData() {
        if (!event) return;

        try {
            const [evMusics, evSuggestions] = await Promise.all([
                getEventMusics(event.id),
                getEventSuggestions(event.id)
            ]);

            setMusics(evMusics);
            setSuggestions(evSuggestions);

        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            setLoading(true);
            loadData();
        }
    }, [open]);

    if (!open || !event) return null;

    async function handleAccept(id) {
        try {
            await acceptSuggestion(id);
            toast.success("Sugestão aceita!");
            await loadData();
            onUpdated?.();
        } catch {
            toast.error("Erro ao aceitar sugestão.");
        }
    }

    async function handleReject(id) {
        try {
            await deleteSuggestion(id);
            toast.success("Sugestão removida.");
            await loadData();
            onUpdated?.();
        } catch {
            toast.error("Erro ao remover sugestão.");
        }
    }

    async function handleSuggestionAdded() {
        try {
            const updated = await getEventSuggestions(event.id);
            setSuggestions(updated);
            onUpdated?.({ suggestionsCount: updated.length });
        } catch {}
    }

    async function handleRemoveMusic(musicId) {
        try {
            await removeMusicFromEvent(event.id, musicId);
            toast.success("Música removida!");

            await loadData();

            onUpdated?.({
                chosenMusicsCount: musics.length - 1
            });
        } catch (err) {
            toast.error("Erro ao remover música.");
            console.error(err);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-start overflow-y-auto z-[9999] py-10">
            <div className="bg-[#1a1a1e] border border-[#2a2a30] rounded-2xl p-8 w-[90%] max-w-3xl text-gray-200 shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">{event.name}</h1>

                        <p className="text-gray-400">
                            {new Date(event.startingTime).toLocaleString("pt-BR")}
                            {" → "}
                            {new Date(event.endingTime).toLocaleString("pt-BR")}
                        </p>

                        {event.lineupName && (
                            <p className="text-gray-300 mt-1">
                                Formação: <strong>{event.lineupName}</strong>
                            </p>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2">

                            {/* EDITAR — FECHA O MODAL */}
                            <Button
                                className="bg-[#7c5fff] hover:bg-[#6a4ee8] px-4 py-2 flex items-center gap-2"
                                onClick={() => {
                                    onClose?.();
                                    onEdit?.(event);
                                }}
                            >
                                <Pencil size={16} />
                                Editar
                            </Button>

                            {/* EXCLUIR — NÃO FECHA O MODAL */}
                            <Button
                                className="bg-red-600/80 hover:bg-red-600 px-4 py-2 flex items-center gap-2"
                                onClick={() => onDelete?.(event)}
                            >
                                <Trash2 size={16} />
                                Excluir
                            </Button>

                        </div>
                    )}
                </div>

                {/* BADGES */}
                <div className="flex gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-black/20 border border-black/40 text-sm">
                        Escalações: {event.escalationsCount ?? 0}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/20 border border-black/40 text-sm">
                        Sugestões: {suggestions.length}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/20 border border-black/40 text-sm">
                        Músicas escolhidas: {musics.length}
                    </span>
                </div>

                {/* GERENCIAR ESCALAÇÃO */}
                <Button
                    className="w-full bg-[#2d2d34] hover:bg-[#3a3a42] mb-8 flex items-center justify-center gap-2"
                    onClick={() => onEscalation?.(event)}
                >
                    <Users size={18} />
                    {isAdmin ? "Gerenciar Escalação" : "Visualizar Escalação"}
                </Button>

                {/* MÚSICAS */}
                <h2 className="text-2xl font-semibold mb-3">Músicas do Evento</h2>

                {musics.length === 0 ? (
                    <p className="text-gray-500 mb-4">Nenhuma música adicionada.</p>
                ) : (
                    <div className="space-y-3 mb-6">
                        {musics.map(m => (
                            <div
                                key={m.id}
                                className="p-4 bg-[#111118] border border-[#2a2a30] rounded-xl flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-lg font-medium">{m.title}</p>
                                    <p className="text-gray-400 text-sm">{m.artist}</p>
                                </div>

                                {isAdmin && (
                                    <button
                                        className="text-red-400 hover:text-red-300 text-sm px-3 py-1"
                                        onClick={() => handleRemoveMusic(m.id)}
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* BOTÃO ADICIONAR MÚSICA (ADMIN) */}
                {isAdmin && (
                    <Button
                        className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] mb-8"
                        onClick={() => setOpenAddModal(true)}
                    >
                        + Adicionar Música
                    </Button>
                )}

                {/* BOTÃO SUGERIR MÚSICA (MEMBER) */}
                {!isAdmin && (
                    <Button
                        className="w-full bg-[#4c4cff] hover:bg-[#3a3ad9] mb-8"
                        onClick={() => setOpenSuggestModal(true)}
                    >
                        + Sugerir Música
                    </Button>
                )}

                {/* SUGESTÕES */}
                <h2 className="text-2xl font-semibold mb-3">Sugestões enviadas</h2>

                {suggestions.length === 0 ? (
                    <p className="text-gray-500 mb-4">Nenhuma sugestão enviada.</p>
                ) : (
                    <div className="space-y-4 mb-6">
                        {suggestions.map(s => (
                            <div
                                key={s.id}
                                className="p-4 bg-[#111118] border border-[#2a2a30] rounded-xl"
                            >
                                <p className="text-lg font-medium">{s.music.title}</p>
                                <p className="text-gray-400 text-sm">{s.music.artist}</p>

                                <p className="text-gray-500 text-xs mt-1">
                                    Sugerido por: {s.authorName || "Integrante"}
                                </p>

                                {isAdmin && (
                                    <div className="flex gap-3 mt-3">
                                        <Button
                                            className="bg-emerald-600/80 hover:bg-emerald-500 text-white"
                                            onClick={() => handleAccept(s.id)}
                                        >
                                            Aceitar
                                        </Button>

                                        <Button
                                            className="bg-rose-600/80 hover:bg-rose-500 text-white"
                                            onClick={() => handleReject(s.id)}
                                        >
                                            Rejeitar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* FECHAR */}
                <div className="flex justify-start mt-2">
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                </div>
            </div>

            {/* MODAIS DE ADIÇÃO / SUGESTÃO */}
            <SelectMusicModal
                open={openAddModal}
                eventId={event.id}
                onClose={() => setOpenAddModal(false)}
                onAdded={() => {
                    loadData();
                    onUpdated?.();
                }}
                isSuggestion={false}
                onResetSearch={true}
            />

            <SelectMusicModal
                open={openSuggestModal}
                eventId={event.id}
                onClose={() => setOpenSuggestModal(false)}
                onAdded={handleSuggestionAdded}
                isSuggestion={true}
                onResetSearch={true}
            />
        </div>
    );
}
