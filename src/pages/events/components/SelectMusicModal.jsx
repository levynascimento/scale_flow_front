// src_frontend/features/events/components/SelectMusicModal.jsx

import { useEffect, useState } from "react";
import Button from "../../../components/Button.jsx";
import { getBandMusics } from "../../../services/musicApi.js";
import { addMusicToEvent, createSuggestion } from "../../../services/eventApi.js";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

export default function SelectMusicModal({
                                             open,
                                             eventId,
                                             onClose,
                                             onAdded,
                                             isSuggestion = false,
                                         }) {
    const { id: bandId } = useParams();

    const [musics, setMusics] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // quando FECHAR o modal, limpamos o estado de busca
        if (!open) {
            setSearch("");
            return;
        }

        // quando ABRIR o modal, carregamos as músicas
        async function loadMusics() {
            try {
                setLoading(true);
                const data = await getBandMusics(bandId);
                setMusics(data);
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

    const filteredMusics = musics.filter((m) =>
        `${m.title} ${m.artist}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    async function handleClick(musicId) {
        try {
            if (isSuggestion) {
                // membro sugerindo música
                await createSuggestion(eventId, musicId);
                toast.success("Sugestão enviada!");
            } else {
                // admin adicionando música ao evento
                await addMusicToEvent(eventId, musicId);
                toast.success("Música adicionada ao evento!");
            }

            // avisa o pai pra recarregar dados
            onAdded?.();

            // limpa o campo de busca para a PRÓXIMA vez
            setSearch("");

            // fecha o modal
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao processar música.");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]">
            <div className="bg-[#1b1b1f] border border-[#2a2a30] rounded-2xl p-6 w-[95%] max-w-lg">
                <h2 className="text-xl font-semibold text-[#c4b5ff] mb-4">
                    {isSuggestion ? "Sugerir música" : "Escolher música"}
                </h2>

                {/* Campo de busca */}
                <input
                    type="text"
                    placeholder="Buscar por título ou artista..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a30] text-gray-200 placeholder-gray-500"
                />

                {/* Lista de músicas */}
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {loading ? (
                        <p className="text-gray-400 text-sm">Carregando músicas...</p>
                    ) : filteredMusics.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            Nenhuma música encontrada.
                        </p>
                    ) : (
                        filteredMusics.map((music) => (
                            <div
                                key={music.id}
                                className="flex justify-between items-center bg-[#111118] border border-[#2a2a30] p-3 rounded-lg"
                            >
                                <div>
                                    <p className="text-gray-200 font-medium">
                                        {music.title}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {music.artist}
                                    </p>
                                </div>

                                <Button
                                    className="bg-[#7c5fff] hover:bg-[#6a4ee8]"
                                    onClick={() => handleClick(music.id)}
                                >
                                    {isSuggestion ? "Sugerir" : "Adicionar"}
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearch(""); // garante limpeza ao fechar manualmente
                            onClose();
                        }}
                    >
                        Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
}
