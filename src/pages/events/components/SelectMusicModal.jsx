import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../../components/Button.jsx";
import { eventService, musicService } from "../../../services/index.js";
import { Music } from "../../../domain/Music.js";

/*
 * ♻️ REFACTORING — Extract Class (MODES)
 * Antes: o componente perguntava `isSuggestion ? ... : ...` em 4 pontos
 * diferentes (título, rótulo do botão, mensagem de sucesso e qual API chamar).
 * Agora: cada modo é um objeto com seus textos e sua ação.
 * Benefícios:
 *   - Condicionais repetidas (4 ternários → 1 escolha)
 *   + Coesão (tudo de um modo fica junto)
 *   + Extensibilidade
 */
const MODES = {
    suggest: {
        title: "Sugerir música",
        buttonLabel: "Sugerir",
        successMessage: "Sugestão enviada!",
        submit: (eventId, musicId) => eventService.suggestMusic(eventId, musicId)
    },
    add: {
        title: "Escolher música",
        buttonLabel: "Adicionar",
        successMessage: "Música adicionada ao evento!",
        submit: (eventId, musicId) => eventService.addMusic(eventId, musicId)
    }
};

export default function SelectMusicModal({ open, eventId, onClose, onAdded, isSuggestion = false }) {
    const { id: bandId } = useParams();

    const [musics, setMusics] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const mode = isSuggestion ? MODES.suggest : MODES.add;

    useEffect(() => {
        if (!open) {
            setSearch("");
            return;
        }

        async function loadMusics() {
            try {
                setLoading(true);
                setMusics(await musicService.listByBand(bandId));
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar músicas.");
            } finally {
                setLoading(false);
            }
        }

        loadMusics();
    }, [open, bandId]);

    if (!open) return null;

    /*
     * ♻️ REFACTORING — Move Method (filtro de busca → Music.matches)
     * Benefícios: + Coesão  + Reuso  + Testabilidade
     */
    const filteredMusics = musics.filter(m => Music.matches(m, search));

    /*
     * ♻️ REFACTORING — Extract Method (close)
     * Antes: `setSearch(""); onClose();` aparecia no handleClick e no botão
     * Fechar, cada um com seu comentário explicando a mesma coisa.
     * Benefícios: - Duplicação  + Legibilidade
     */
    function close() {
        setSearch("");
        onClose();
    }

    async function handleClick(musicId) {
        try {
            await mode.submit(eventId, musicId);
            toast.success(mode.successMessage);
            onAdded?.();
            close();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao processar música.");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]">
            <div className="bg-[#1b1b1f] border border-[#2a2a30] rounded-2xl p-6 w-[95%] max-w-lg">
                <h2 className="text-xl font-semibold text-[#c4b5ff] mb-4">{mode.title}</h2>

                <input
                    type="text"
                    placeholder="Buscar por título ou artista..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a30] text-gray-200 placeholder-gray-500"
                />

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {loading ? (
                        <p className="text-gray-400 text-sm">Carregando músicas...</p>
                    ) : filteredMusics.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhuma música encontrada.</p>
                    ) : (
                        filteredMusics.map((music) => (
                            <div
                                key={music.id}
                                className="flex justify-between items-center bg-[#111118] border border-[#2a2a30] p-3 rounded-lg"
                            >
                                <div>
                                    <p className="text-gray-200 font-medium">{music.title}</p>
                                    <p className="text-gray-400 text-sm">{music.artist}</p>
                                </div>

                                <Button className="bg-[#7c5fff] hover:bg-[#6a4ee8]" onClick={() => handleClick(music.id)}>
                                    {mode.buttonLabel}
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={close}>Fechar</Button>
                </div>
            </div>
        </div>
    );
}
