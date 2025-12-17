import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getRoles } from "../../services/rolesApi.js";
import { createLineup } from "../../services/lineupApi.js";

import { toast } from "react-toastify";
import { X, Plus, Trash2 } from "lucide-react";

export default function LineupCreateModal({ open, onClose, onCreated }) {
    const { id: bandId } = useParams();

    const [name, setName] = useState("");
    const [roles, setRoles] = useState([]);

    // [{ roleId }]
    const [items, setItems] = useState([]);
    const [newRole, setNewRole] = useState("");

    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);

    function handleAnimatedClose() {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, 150);
    }

    useEffect(() => {
        if (!open) return;

        async function load() {
            try {
                setLoading(true);
                const r = await getRoles();
                setRoles(r);

                setItems([]);
                setNewRole("");
                setName("");
            } catch {
                toast.error("Erro ao carregar papéis");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [open]);

    function handleAddItem() {
        if (!newRole) return toast.warn("Selecione um papel.");

        setItems((prev) => [
            ...prev,
            { roleId: newRole },
        ]);

        setNewRole("");
    }

    function handleRemoveItem(index) {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleCreate() {
        if (!name.trim()) return toast.warn("Digite um nome.");
        if (items.length === 0)
            return toast.warn("Adicione pelo menos um papel.");

        try {
            await createLineup(bandId, {
                name: name.trim(),
                roles: items, // [{ roleId }]
            });

            toast.success("Formação criada!");
            onCreated();
            handleAnimatedClose();
        } catch {
            toast.error("Erro ao criar formação");
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className={`bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-6 w-[90%] max-w-lg shadow-xl ${closing ? "animate-fadeOut" : "animate-scaleIn"}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-gray-100 font-semibold">
                        Nova Formação
                    </h2>
                    <button onClick={handleAnimatedClose} className="text-gray-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                <label className="text-gray-300 text-sm">Nome da formação</label>
                <input
                    className="w-full bg-[#121214] border border-[#2d2d35] rounded-lg px-3 py-2 text-gray-200 mb-4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <p className="text-gray-300 text-sm mb-2">Papéis adicionados</p>

                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-4">
                        Nenhum papel ainda.
                    </p>
                ) : (
                    <div className="space-y-3 mb-4">
                        {items.map((item, index) => {
                            const role = roles.find(
                                (r) => String(r.id) === String(item.roleId)
                            );

                            return (
                                <div key={index} className="bg-[#242428] border border-[#33333a] p-3 rounded-lg flex justify-between items-center">
                                    <p className="text-gray-200">
                                        {role?.name ?? "Papel"}
                                    </p>

                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="bg-red-600 hover:bg-red-700 p-1 rounded"
                                    >
                                        <Trash2 size={16} className="text-white" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-gray-300 text-sm mb-2">Adicionar papel</p>

                <div className="flex gap-2 mb-4">
                    <select
                        className="flex-1 bg-[#121214] border border-[#2d2d35] rounded-lg px-2 py-2 text-gray-200"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                    >
                        <option value="">Selecione...</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleAddItem}
                        className="bg-sf-primary hover:bg-sf-primary-600 text-white px-3 rounded-lg"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <button
                    onClick={handleCreate}
                    className="w-full px-4 py-2 bg-sf-primary text-white rounded-lg hover:bg-sf-primary-600"
                >
                    Criar
                </button>

                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleAnimatedClose}
                        className="px-4 py-2 text-gray-300 hover:text-white"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
