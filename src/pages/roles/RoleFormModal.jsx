import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/Button.jsx";
import {
    createRole,
    updateRole,
    createMultipleRoles,
} from "../../services/rolesApi.js";

export default function RoleFormModal({
                                          open,
                                          onClose,
                                          onSaved,
                                          editingRole,
                                      }) {
    const isEditing = !!editingRole;

    const [mode, setMode] = useState("single"); // 'single' | 'multi'
    const [name, setName] = useState("");
    const [multiText, setMultiText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        if (isEditing) {
            setMode("single");
            setName(editingRole?.name ?? "");
            setMultiText("");
        } else {
            setMode("single");
            setName("");
            setMultiText("");
        }
    }, [open, isEditing, editingRole]);

    if (!open) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                if (!name.trim()) {
                    toast.error("Informe o nome do papel.");
                    return;
                }

                await updateRole(editingRole.id, { name: name.trim() });
                toast.success("Papel atualizado com sucesso!");
            } else if (mode === "single") {
                if (!name.trim()) {
                    toast.error("Informe o nome do papel.");
                    return;
                }

                await createRole({ name: name.trim() });
                toast.success("Papel criado com sucesso!");
            } else {
                // múltiplos
                const names = multiText
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);

                if (names.length === 0) {
                    toast.error("Digite pelo menos um nome de papel.");
                    return;
                }

                await createMultipleRoles(names);
                toast.success("Papéis criados com sucesso!");
            }

            onSaved?.();
            onClose?.();
        } catch (err) {
            console.error("Erro ao salvar papel:", err);
            toast.error("Erro ao salvar papel.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1e1e22] border border-[#2a2a30] rounded-xl p-6 w-[95%] max-w-lg text-gray-100 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">
                    {isEditing ? "Editar papel" : "Novo papel"}
                </h2>

                {!isEditing && (
                    <div className="flex mb-4 border border-[#2a2a30] rounded-lg overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setMode("single")}
                            className={`flex-1 px-3 py-2 text-sm ${
                                mode === "single"
                                    ? "bg-[#7c5fff] text-white"
                                    : "bg-transparent text-gray-300"
                            }`}
                        >
                            Um papel
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("multi")}
                            className={`flex-1 px-3 py-2 text-sm ${
                                mode === "multi"
                                    ? "bg-[#7c5fff] text-white"
                                    : "bg-transparent text-gray-300"
                            }`}
                        >
                            Vários papéis
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Modo único */}
                    {(isEditing || mode === "single") && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                Nome do papel
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a30] text-gray-200"
                                placeholder="Ex.: Guitarrista, Baixista, Tecladista…"
                            />
                        </div>
                    )}

                    {/* Modo múltiplos (apenas criação) */}
                    {!isEditing && mode === "multi" && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">
                                Nomes dos papéis (um por linha)
                            </label>
                            <textarea
                                rows={6}
                                value={multiText}
                                onChange={(e) => setMultiText(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a30] text-gray-200 resize-y"
                                placeholder={
                                    "Ex:\nGuitarra\nBaixo\nTeclado\nBateria\nVoz principal\nBack vocal"
                                }
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" disabled={loading}>
                            {loading
                                ? "Salvando..."
                                : isEditing
                                    ? "Salvar"
                                    : "Criar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
