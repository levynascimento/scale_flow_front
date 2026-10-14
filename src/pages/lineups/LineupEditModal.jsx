import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Trash2, Plus } from "lucide-react";
import { lineupService, roleService } from "../../services/index.js";
import { LineupDraft } from "../../domain/LineupDraft.js";
import { useAnimatedClose } from "../../hooks/useAnimatedClose.js";

export default function LineupEditModal({ open, onClose, lineupId, onUpdated }) {
    const [name, setName] = useState("");
    const [roles, setRoles] = useState([]);

    /*
     * ♻️ REFACTORING — Extract Class (items + draftItems → LineupDraft)
     * Antes: dois estados paralelos (o original e o rascunho) que o
     * componente precisava manter sincronizados à mão.
     * Agora: um objeto LineupDraft guarda os dois e sabe calcular a diferença.
     * Benefícios: + Coesão  + Encapsulamento  + Testabilidade  - Complexidade
     */
    const [draft, setDraft] = useState(LineupDraft.of([]));
    const [newRole, setNewRole] = useState("");
    const [loading, setLoading] = useState(true);

    const { close, animationClass } = useAnimatedClose(onClose);

    useEffect(() => {
        if (!open || !lineupId) return;

        async function load() {
            try {
                setLoading(true);
                const [lineup, rolesData] = await Promise.all([
                    lineupService.getById(lineupId),
                    roleService.list(),
                ]);
                setName(lineup.name);
                setDraft(LineupDraft.of(lineup.roles));
                setRoles(rolesData);
            } catch {
                toast.error("Erro ao carregar formação");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [open, lineupId]);

    async function handleSaveName() {
        try {
            await lineupService.rename(lineupId, name.trim());
            toast.success("Nome atualizado");
            onUpdated();
        } catch {
            toast.error("Erro ao atualizar nome");
        }
    }

    function handleAddRoleLocal() {
        if (!newRole) return toast.error("Selecione um papel.");
        setDraft(prev => prev.addRole(newRole, roles));
        setNewRole("");
    }

    /*
     * ♻️ REFACTORING — Move Method (diff + chamadas → LineupService.applyDraft)
     * Antes: 20 linhas aqui calculando removidos/adicionados e chamando a API
     * em dois laços.
     * Benefícios: + Coesão  - Responsabilidades do componente  + Testabilidade
     */
    async function handleSaveRoles() {
        try {
            await lineupService.applyDraft(lineupId, draft);
            toast.success("Formação atualizada!");
            onUpdated();
            close();
        } catch {
            toast.error("Erro ao salvar formação");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className={`bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-6 w-[90%] max-w-lg shadow-xl ${animationClass}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-gray-100 font-semibold">Editar Formação</h2>
                    <button onClick={close} className="text-gray-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                {loading ? (
                    <p className="text-gray-400 text-sm">Carregando...</p>
                ) : (
                    <>
                        <label className="text-gray-300 text-sm">Nome da formação</label>
                        <input
                            className="w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 mb-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleSaveName}
                        />

                        <p className="text-gray-300 text-sm mb-2">Papéis da formação</p>

                        <div className="space-y-3 mb-4">
                            {draft.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-[#242428] border border-[#33333a] p-3 rounded-lg flex justify-between items-center"
                                >
                                    <p className="text-gray-200 font-medium">{item.role?.name}</p>

                                    <button
                                        onClick={() => setDraft(prev => prev.removeItem(item.id))}
                                        className="bg-red-600 hover:bg-red-700 p-1 rounded"
                                    >
                                        <Trash2 size={16} className="text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <p className="text-gray-300 text-sm mb-2">Adicionar papel</p>

                        <div className="flex gap-2 mb-4">
                            <select
                                className="flex-1 bg-[#121214] border border-[#2d2d35] rounded-lg px-2 py-2 text-gray-200"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleAddRoleLocal}
                                className="bg-sf-primary hover:bg-sf-primary-600 text-white px-3 rounded-lg"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="flex justify-between">
                            <button onClick={close} className="px-4 py-2 text-gray-300 hover:text-white">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveRoles}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
                            >
                                Salvar alterações
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
