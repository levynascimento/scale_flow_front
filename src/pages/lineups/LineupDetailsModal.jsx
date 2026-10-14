import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Pencil, Trash2 } from "lucide-react";
import { lineupService } from "../../services/index.js";

export default function LineupDetailsModal({ open, onClose, lineupId, onEdit, onDelete }) {
    const [lineup, setLineup] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !lineupId) return;

        async function load() {
            try {
                setLoading(true);
                setLineup(await lineupService.getById(lineupId));
            } catch {
                toast.error("Erro ao carregar formação");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [open, lineupId]);

    if (!open) return null;

    /*
     * ♻️ REFACTORING — Inline Variable (roles)
     * Antes: `const roles = lineup?.roles ?? []` existia só para proteger o
     * acesso. Como Lineup.from() já garante `roles` como array, a variável
     * intermediária deixou de ser necessária.
     * Benefícios: + Legibilidade  - Programação defensiva espalhada
     */
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-6 w-[90%] max-w-lg shadow-xl animate-scaleIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-gray-100 font-semibold">Detalhes da Formação</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                {loading || !lineup ? (
                    <p className="text-gray-400 text-sm">Carregando...</p>
                ) : (
                    <>
                        <div className="mb-4">
                            <p className="text-gray-400 text-sm">Nome da formação</p>
                            <p className="text-gray-100 font-medium text-lg">{lineup.name}</p>
                        </div>

                        <p className="text-gray-300 text-sm mb-2">Papéis</p>

                        {lineup.roleCount === 0 ? (
                            <p className="text-gray-500 text-sm">Nenhum papel cadastrado.</p>
                        ) : (
                            <div className="space-y-3">
                                {lineup.roles.map((item) => (
                                    <div key={item.id} className="bg-[#242428] border border-[#33333a] p-3 rounded-lg">
                                        <p className="text-gray-200 font-medium">{item.role?.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-5 gap-2">
                            <button
                                onClick={() => onDelete?.(lineup)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                            >
                                <Trash2 size={16} />
                                Excluir
                            </button>

                            <div className="flex gap-2 ml-auto">
                                <button
                                    onClick={() => onEdit?.(lineup)}
                                    className="flex items-center gap-2 px-4 py-2 bg-sf-primary hover:bg-sf-primary-600 text-white rounded-lg text-sm"
                                >
                                    <Pencil size={16} />
                                    Editar
                                </button>

                                <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white text-sm">
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
