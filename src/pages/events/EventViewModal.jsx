import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, Pencil, Trash2 } from "lucide-react";
import Button from "../../components/Button";
import SelectMusicModal from "./components/SelectMusicModal";
import { eventService } from "../../services/index.js";
import { Event } from "../../domain/Event.js";

/*
 * ♻️ REFACTORING — Extract Method (componente MusicInfo)
 * Antes: o card de música (título + artista) aparecia na lista de músicas do
 * evento e de novo na lista de sugestões, com o mesmo markup.
 * Benefícios: - Duplicação  + Consistência visual
 */
function MusicInfo({ music }) {
    return (
        <>
            <p className="text-lg font-medium">{music.title}</p>
            <p className="text-gray-400 text-sm">{music.artist}</p>
        </>
    );
}

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
                eventService.listMusics(event.id),
                eventService.listSuggestions(event.id)
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

    /*
     * ♻️ REFACTORING — Extract Method (runAndRefresh)
     * Antes: handleAccept, handleReject e handleRemoveMusic tinham a MESMA
     * estrutura: try { await api; toast.success; await loadData(); onUpdated() }
     * catch { toast.error }. Só mudavam a chamada e as mensagens.
     * Agora: a estrutura comum virou um método; cada handler passa só o que varia.
     * Benefícios:
     *   - Duplicação (3 try/catch → 1)
     *   + Consistência (todo handler recarrega e notifica igual)
     *   + Legibilidade (cada handler cabe em uma linha)
     */
    async function runAndRefresh(action, successMessage, errorMessage, changes) {
        try {
            await action();
            toast.success(successMessage);
            await loadData();
            onUpdated?.(changes);
        } catch (err) {
            console.error(err);
            toast.error(errorMessage);
        }
    }

    const handleAccept = (id) =>
        runAndRefresh(() => eventService.acceptSuggestion(id), "Sugestão aceita!", "Erro ao aceitar sugestão.");

    const handleReject = (id) =>
        runAndRefresh(() => eventService.deleteSuggestion(id), "Sugestão removida.", "Erro ao remover sugestão.");

    const handleRemoveMusic = (musicId) =>
        runAndRefresh(
            () => eventService.removeMusic(event.id, musicId),
            "Música removida!",
            "Erro ao remover música.",
            { chosenMusicsCount: musics.length - 1 }
        );

    async function handleSuggestionAdded() {
        try {
            const updated = await eventService.listSuggestions(event.id);
            setSuggestions(updated);
            onUpdated?.({ suggestionsCount: updated.length });
        } catch (err) {
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

                        {/*
                          ♻️ REFACTORING — Move Method (formatação → Event.formattedRange)
                          Antes: dois `new Date(...).toLocaleString("pt-BR")` inline.
                          Benefícios: - Duplicação  + Consistência
                        */}
                        <p className="text-gray-400">{Event.from(event).formattedRange}</p>

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

                <Button
                    className="w-full bg-[#2d2d34] hover:bg-[#3a3a42] mb-8 flex items-center justify-center gap-2"
                    onClick={() => onEscalation?.(event)}
                >
                    <Users size={18} />
                    {isAdmin ? "Gerenciar Escalação" : "Visualizar Escalação"}
                </Button>

                {/* MÚSICAS */}
                <h2 className="text-2xl font-semibold mb-3">Músicas do Evento</h2>

                {loading ? (
                    <p className="text-gray-400 mb-4">Carregando...</p>
                ) : musics.length === 0 ? (
                    <p className="text-gray-500 mb-4">Nenhuma música adicionada.</p>
                ) : (
                    <div className="space-y-3 mb-6">
                        {musics.map(m => (
                            <div
                                key={m.id}
                                className="p-4 bg-[#111118] border border-[#2a2a30] rounded-xl flex justify-between items-center"
                            >
                                <div>
                                    <MusicInfo music={m} />
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

                {/*
                  ♻️ REFACTORING — Extract Variable (botão adicionar x sugerir)
                  Antes: dois blocos {isAdmin && ...} e {!isAdmin && ...} quase iguais.
                  Agora: um botão só, com o que varia decidido por isAdmin.
                  Benefícios: - Duplicação  + Legibilidade
                */}
                <Button
                    className={`w-full mb-8 ${isAdmin ? "bg-[#7c5fff] hover:bg-[#6a4ee8]" : "bg-[#4c4cff] hover:bg-[#3a3ad9]"}`}
                    onClick={() => (isAdmin ? setOpenAddModal(true) : setOpenSuggestModal(true))}
                >
                    {isAdmin ? "+ Adicionar Música" : "+ Sugerir Música"}
                </Button>

                {/* SUGESTÕES */}
                <h2 className="text-2xl font-semibold mb-3">Sugestões enviadas</h2>

                {suggestions.length === 0 ? (
                    <p className="text-gray-500 mb-4">Nenhuma sugestão enviada.</p>
                ) : (
                    <div className="space-y-4 mb-6">
                        {suggestions.map(s => (
                            <div key={s.id} className="p-4 bg-[#111118] border border-[#2a2a30] rounded-xl">
                                <MusicInfo music={s.music} />

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

                <div className="flex justify-start mt-2">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </div>
            </div>

            {/*
              ♻️ REFACTORING — Change Function Declaration (prop onResetSearch removida)
              Antes: os dois SelectMusicModal recebiam `onResetSearch={true}`,
              uma prop que o componente nunca declarou nem leu.
              Benefícios: - Ruído na interface do componente  + Legibilidade
            */}
            <SelectMusicModal
                open={openAddModal}
                eventId={event.id}
                onClose={() => setOpenAddModal(false)}
                onAdded={() => {
                    loadData();
                    onUpdated?.();
                }}
                isSuggestion={false}
            />

            <SelectMusicModal
                open={openSuggestModal}
                eventId={event.id}
                onClose={() => setOpenSuggestModal(false)}
                onAdded={handleSuggestionAdded}
                isSuggestion={true}
            />
        </div>
    );
}
