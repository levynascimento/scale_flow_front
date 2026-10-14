import Button from "../../../components/Button";

const SELECT_CLASS = "w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1";

/*
 * ♻️ REFACTORING — Extract Method (componente EscalationDraftForm)
 * Antes: EventEscalationModal tinha DOIS formulários de ~70 linhas quase
 * idênticos: um para cada escalação pendente vinda da formação e outro para
 * a adição manual. Mesmo título, mesmos 2 selects, mesmos 2 botões.
 * Agora: um componente só, usado nos dois lugares.
 * Benefícios:
 *   - Duplicação (~70 linhas)
 *   + Consistência (mudar o form muda os dois casos)
 *   + Coesão
 *   - Tamanho do EventEscalationModal (de 500 para ~250 linhas)
 */
export default function EscalationDraftForm({
    draft,
    roles,
    integrants,
    onRoleChange,
    onUserChange,
    onConfirm,
    onCancel
}) {
    return (
        <div className="mt-6 space-y-4 p-5 bg-[#111118] border border-[#2a2a30] rounded-xl">
            <h2 className="text-lg font-semibold">Novo escalado</h2>

            <div>
                <label className="text-sm text-gray-300">Papel</label>
                <select
                    value={draft.roleId}
                    onChange={e => onRoleChange(e.target.value)}
                    className={SELECT_CLASS}
                >
                    <option value="">Selecione...</option>
                    {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>

            {draft.roleId && (
                <div>
                    <label className="text-sm text-gray-300">Integrante</label>
                    <select
                        value={draft.userId}
                        onChange={e => onUserChange(e.target.value)}
                        className={SELECT_CLASS}
                    >
                        <option value="">Selecione...</option>
                        {integrants.map(i => (
                            <option key={i.user.id} value={i.user.id}>{i.user.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex gap-3 mt-4">
                <Button className="bg-emerald-600/80 hover:bg-emerald-500 flex-1" onClick={onConfirm}>
                    Confirmar
                </Button>
                <Button className="bg-gray-600/50 hover:bg-gray-600 flex-1" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </div>
    );
}
