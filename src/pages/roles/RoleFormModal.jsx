import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/Button.jsx";
import { roleService } from "../../services/index.js";

const MODE = { SINGLE: "single", MULTI: "multi" };

/*
 * ♻️ REFACTORING — Extract Method (parseRoleNames)
 * Antes: `multiText.split("\n").map(s => s.trim()).filter(Boolean)` dentro
 * do handleSubmit.
 * Benefícios: + Legibilidade  + Testabilidade
 */
function parseRoleNames(text) {
    return text.split("\n").map(s => s.trim()).filter(Boolean);
}

/*
 * ♻️ REFACTORING — Extract Method (componente ModeTab)
 * Antes: os dois botões "Um papel" / "Vários papéis" repetiam o mesmo
 * markup e o mesmo ternário de classes.
 * Benefícios: - Duplicação  + Legibilidade
 */
function ModeTab({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 px-3 py-2 text-sm ${active ? "bg-[#7c5fff] text-white" : "bg-transparent text-gray-300"}`}
        >
            {children}
        </button>
    );
}

export default function RoleFormModal({ open, onClose, onSaved, editingRole }) {
    const isEditing = !!editingRole;

    const [mode, setMode] = useState(MODE.SINGLE);
    const [name, setName] = useState("");
    const [multiText, setMultiText] = useState("");
    const [loading, setLoading] = useState(false);

    /*
     * ♻️ REFACTORING complementar (fora da lista da disciplina):
     *    Consolidate Duplicate Conditional Fragments
     * Antes: o useEffect tinha um if/else em que os dois ramos faziam
     * setMode("single") e setMultiText(""), mudando só o nome.
     * Agora: só o que varia depende de isEditing.
     * Benefícios: - Duplicação  + Legibilidade
     */
    useEffect(() => {
        if (!open) return;
        setMode(MODE.SINGLE);
        setName(isEditing ? editingRole?.name ?? "" : "");
        setMultiText("");
    }, [open, isEditing, editingRole]);

    if (!open) return null;

    /*
     * ♻️ REFACTORING — Extract Method (save)
     * Antes: handleSubmit tinha um if/else if/else de 3 ramos e a validação
     * "Informe o nome do papel." estava COPIADA nos ramos de editar e criar.
     * Agora: a decisão de "o que salvar" está separada de "como reagir"
     * (loading, toast, fechar). Cada ramo devolve a mensagem de sucesso, ou
     * null quando a validação falha.
     * Benefícios:
     *   - Duplicação (validação do nome escrita uma vez)
     *   + Legibilidade
     *   + Coesão
     */
    async function save() {
        if (!isEditing && mode === MODE.MULTI) {
            const names = parseRoleNames(multiText);
            if (names.length === 0) {
                toast.error("Digite pelo menos um nome de papel.");
                return null;
            }
            await roleService.createMany(names);
            return "Papéis criados com sucesso!";
        }

        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Informe o nome do papel.");
            return null;
        }

        if (isEditing) {
            await roleService.update(editingRole.id, { name: trimmedName });
            return "Papel atualizado com sucesso!";
        }

        await roleService.create({ name: trimmedName });
        return "Papel criado com sucesso!";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const successMessage = await save();
            if (!successMessage) return;
            toast.success(successMessage);
            onSaved?.();
            onClose?.();
        } catch (err) {
            console.error("Erro ao salvar papel:", err);
            toast.error("Erro ao salvar papel.");
        } finally {
            setLoading(false);
        }
    }

    /*
     * ♻️ REFACTORING — Extract Variable (showSingle / showMulti / submitLabel)
     * Antes: `(isEditing || mode === "single")`, `!isEditing && mode === "multi"`
     * e um ternário aninhado para o texto do botão, direto no JSX.
     * Benefícios: + Legibilidade  - Lógica no JSX
     */
    const showSingle = isEditing || mode === MODE.SINGLE;
    const showMulti = !isEditing && mode === MODE.MULTI;
    const submitLabel = loading ? "Salvando..." : isEditing ? "Salvar" : "Criar";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1e1e22] border border-[#2a2a30] rounded-xl p-6 w-[95%] max-w-lg text-gray-100 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">{isEditing ? "Editar papel" : "Novo papel"}</h2>

                {!isEditing && (
                    <div className="flex mb-4 border border-[#2a2a30] rounded-lg overflow-hidden">
                        <ModeTab active={mode === MODE.SINGLE} onClick={() => setMode(MODE.SINGLE)}>Um papel</ModeTab>
                        <ModeTab active={mode === MODE.MULTI} onClick={() => setMode(MODE.MULTI)}>Vários papéis</ModeTab>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {showSingle && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Nome do papel</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a30] text-gray-200"
                                placeholder="Ex.: Guitarrista, Baixista, Tecladista…"
                            />
                        </div>
                    )}

                    {showMulti && (
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Nomes dos papéis (um por linha)</label>
                            <textarea
                                rows={6}
                                value={multiText}
                                onChange={(e) => setMultiText(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[#111118] border border-[#2a2a30] text-gray-200 resize-y"
                                placeholder={"Ex:\nGuitarra\nBaixo\nTeclado\nBateria\nVoz principal\nBack vocal"}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>{submitLabel}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
