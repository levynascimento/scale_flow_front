import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X, UserPlus, Trash2, Layers } from "lucide-react";
import Button from "../../components/Button";
import EscalationDraftForm from "./components/EscalationDraftForm.jsx";
import { escalationService, lineupService } from "../../services/index.js";
import { RoleService } from "../../services/RoleService.js";
import { bandSession } from "../../core/session/BandSession.js";
import { Escalation } from "../../domain/Escalation.js";

const EMPTY_DRAFT = { roleId: "", userId: "" };

/*
 * ♻️ REFACTORING — Inline Method (getCurrentBandId)
 * Antes: o arquivo começava com
 *   function getCurrentBandId() { return localStorage.getItem("bandId"); }
 * uma função cujo corpo era tão claro quanto o nome, usada uma única vez.
 * Agora: a chamada foi substituída por `bandSession.bandId`.
 * Benefícios:
 *   - Indireção desnecessária
 *   - Acoplamento (com localStorage)
 *   + Legibilidade
 */

export default function EventEscalationModal({
    open,
    event,
    editable = false,
    onClose,
    allIntegrants = [],
    allRoles = [],
    onUpdated,
}) {
    const [loading, setLoading] = useState(true);
    const [escalations, setEscalations] = useState([]);
    const [suggestedLineup, setSuggestedLineup] = useState(null);
    const [pendingEscalations, setPendingEscalations] = useState([]);

    /*
     * ♻️ REFACTORING — Inline Variable (adding / selectedRole / selectedIntegrant)
     * Antes: 3 estados (adding: boolean, selectedRole, selectedIntegrant)
     * que sempre eram resetados juntos.
     * Agora: um só, `manualDraft`. Se for null, não está adicionando; o
     * boolean `adding` deixou de existir porque era derivável.
     * Benefícios:
     *   - Estado redundante
     *   + Consistência (impossível ficar "adicionando" sem rascunho)
     *   + Legibilidade
     */
    const [manualDraft, setManualDraft] = useState(null);

    const [priorityCache, setPriorityCache] = useState({});

    /*
     * ♻️ REFACTORING — Move Method (ordenação → Escalation.sortByRoleThenUser)
     * Antes: 12 linhas de comparação inline no useMemo.
     * Benefícios: + Legibilidade  + Coesão  + Testabilidade
     */
    const escalationsSorted = useMemo(() => Escalation.sortByRoleThenUser(escalations), [escalations]);

    async function loadData() {
        if (!event) return;

        try {
            setLoading(true);
            const [data, lineup] = await Promise.all([
                escalationService.listByEvent(event.id),
                event.lineupId ? lineupService.getById(event.lineupId) : null
            ]);
            setEscalations(Array.isArray(data) ? data : []);
            setSuggestedLineup(lineup);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar escalações.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            setManualDraft(null);
            setPendingEscalations([]);
            loadData();
        }
    }, [open, event?.id]);

    async function loadPriority(roleId) {
        if (!roleId || priorityCache[roleId]) return;

        const bandId = bandSession.bandId;
        const role = RoleService.findById(allRoles, roleId);
        if (!bandId || !role?.slug) return;

        try {
            const data = await escalationService.getPriorityList(role.slug, bandId);
            setPriorityCache(prev => ({ ...prev, [roleId]: data }));
        } catch (err) {
            console.error(err);
        }
    }

    /*
     * ♻️ REFACTORING — Change Function Declaration (getPriorityOnlyIntegrants → integrantsAllowedFor)
     * Antes: o nome falava de "priority only", mas o que a função devolve é a
     * lista de integrantes que podem ocupar aquele papel.
     * Benefícios: + Legibilidade (nome revela a intenção)
     */
    function integrantsAllowedFor(roleId) {
        const priorityList = priorityCache[roleId];
        if (!roleId || !priorityList) return [];

        const allowedIds = priorityList.map(p => p.userId);
        return allIntegrants.filter(i => allowedIds.includes(i.user.id));
    }

    /*
     * ♻️ REFACTORING — Extract Method (saveEscalation)
     * Antes: handleCreate e confirmPending tinham o mesmo miolo: validar
     * papel/integrante, chamar createEscalation, recarregar, notificar o pai,
     * mostrar toast e tratar erro.
     * Agora: o miolo comum virou um método; cada chamador só cuida do próprio
     * estado depois do sucesso.
     * Benefícios:
     *   - Duplicação
     *   + Consistência (mesma validação e mesmas mensagens nos dois fluxos)
     *   + Legibilidade
     */
    async function saveEscalation(draft) {
        if (!draft?.roleId || !draft?.userId) {
            toast.error("Selecione o papel e o integrante.");
            return false;
        }

        try {
            await escalationService.create(event.id, { userId: draft.userId, roleId: draft.roleId });
            await loadData();
            onUpdated?.();
            toast.success("Escalação adicionada!");
            return true;
        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar escalação.");
            return false;
        }
    }

    async function confirmManual() {
        if (await saveEscalation(manualDraft)) setManualDraft(null);
    }

    async function confirmPending(index) {
        if (await saveEscalation(pendingEscalations[index])) cancelPending(index);
    }

    function cancelPending(index) {
        setPendingEscalations(prev => prev.filter((_, i) => i !== index));
    }

    /*
     * ♻️ REFACTORING — Extract Method (updatePending)
     * Antes: o `setPendingEscalations(prev => prev.map((p, i) => i === index ? {...} : p))`
     * era escrito inline duas vezes dentro dos onChange do JSX.
     * Benefícios: - Duplicação  + Legibilidade do JSX
     */
    function updatePending(index, changes) {
        setPendingEscalations(prev => prev.map((p, i) => (i === index ? { ...p, ...changes } : p)));
    }

    /*
     * ♻️ REFACTORING — Extract Method (changeDraftRole)
     * "Trocar o papel" sempre faz 2 coisas: carregar a prioridade do novo
     * papel e limpar o integrante escolhido. Antes isso estava duplicado nos
     * dois formulários.
     * Benefícios: - Duplicação  + Coesão
     */
    function changeDraftRole(roleId) {
        loadPriority(roleId);
        return { roleId, userId: "" };
    }

    /*
     * ♻️ REFACTORING — Move Method (cálculo das sugestões → Lineup.toPendingEscalations)
     * Antes: 50 linhas aqui navegando por suggestedLineup.roles[i].role.id.
     * Agora: o componente pergunta à formação e cuida só da UI.
     * Benefícios: - Feature Envy  + Coesão  + Testabilidade
     */
    function applyFormationAsSuggestions() {
        if (!suggestedLineup) return;

        const suggestions = suggestedLineup.toPendingEscalations(escalations, pendingEscalations);

        if (suggestions.length === 0) {
            toast.error("Nenhum papel novo para sugerir a partir da formação.");
            return;
        }

        suggestions.forEach(item => loadPriority(item.roleId));
        setPendingEscalations(prev => [...prev, ...suggestions]);
        toast.success("Formação aplicada como base.");
    }

    async function handleDelete(id) {
        try {
            await escalationService.delete(id);
            await loadData();
            onUpdated?.();
            toast.success("Escalação removida!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover escalação.");
        }
    }

    if (!open || !event) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-start overflow-y-auto z-[9999] py-10">
            <div className="bg-[#1a1a1e] border border-[#2a2a30] rounded-2xl p-7 w-[95%] max-w-2xl text-gray-200 shadow-xl">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Escalação — {event.name}</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={26} />
                    </button>
                </div>

                {/* FORMAÇÃO SUGERIDA */}
                {editable && suggestedLineup && (
                    <div className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10">
                        <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                                <p className="text-indigo-300 font-medium flex items-center gap-2">
                                    <Layers size={16} />
                                    Formação sugerida
                                </p>
                                <p className="text-sm text-gray-400">{suggestedLineup.name}</p>

                                {suggestedLineup.roleCount > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {suggestedLineup.roles.map((lr, idx) => (
                                            <span
                                                key={`${lr?.role?.id || "role"}-${idx}`}
                                                className="text-xs px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200"
                                            >
                                                {lr?.role?.name || "—"}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button className="bg-[#7c5fff] hover:bg-[#6a4ee8]" onClick={applyFormationAsSuggestions}>
                                Usar formação como base
                            </Button>
                        </div>
                    </div>
                )}

                {/* LISTA DE ESCALADOS */}
                <div className="mb-6">
                    {loading ? (
                        <p className="text-gray-400 text-sm">Carregando...</p>
                    ) : escalationsSorted.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhum integrante escalado ainda.</p>
                    ) : (
                        <div className="space-y-3">
                            {escalationsSorted.map((e) => (
                                <div
                                    key={e.id}
                                    className="bg-[#111118] border border-[#2a2a30] rounded-xl p-4 flex justify-between items-center gap-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-gray-200 font-medium truncate">{e?.user?.name || "Integrante"}</p>
                                        <p className="text-sm text-gray-400 truncate">{e?.role?.name || "Papel"}</p>
                                    </div>

                                    {editable && (
                                        <button
                                            onClick={() => handleDelete(e.id)}
                                            className="bg-red-600/70 hover:bg-red-600 p-2 rounded-lg"
                                            title="Remover"
                                        >
                                            <Trash2 size={16} className="text-white" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PENDENTES DA FORMAÇÃO */}
                {editable && pendingEscalations.length > 0 && (
                    <div className="space-y-4 mb-6">
                        {pendingEscalations.map((item, index) => (
                            <EscalationDraftForm
                                key={item._key || `${item.roleId}-${index}`}
                                draft={item}
                                roles={allRoles}
                                integrants={integrantsAllowedFor(item.roleId)}
                                onRoleChange={roleId => updatePending(index, changeDraftRole(roleId))}
                                onUserChange={userId => updatePending(index, { userId })}
                                onConfirm={() => confirmPending(index)}
                                onCancel={() => cancelPending(index)}
                            />
                        ))}
                    </div>
                )}

                {/* ADIÇÃO MANUAL */}
                {editable && !manualDraft && (
                    <Button
                        className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] flex items-center justify-center gap-2 py-3"
                        onClick={() => setManualDraft(EMPTY_DRAFT)}
                    >
                        <UserPlus size={20} />
                        Adicionar à Escalação
                    </Button>
                )}

                {editable && manualDraft && (
                    <EscalationDraftForm
                        draft={manualDraft}
                        roles={allRoles}
                        integrants={integrantsAllowedFor(manualDraft.roleId)}
                        onRoleChange={roleId => setManualDraft(changeDraftRole(roleId))}
                        onUserChange={userId => setManualDraft(prev => ({ ...prev, userId }))}
                        onConfirm={confirmManual}
                        onCancel={() => setManualDraft(null)}
                    />
                )}
            </div>
        </div>
    );
}
