import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/Button";

import {
    getEscalations,
    createEscalation,
    deleteEscalation,
    getPriorityList
} from "../../services/escalationApi";

import { getLineup } from "../../services/lineupApi";
import { X, UserPlus, Trash2, Layers } from "lucide-react";

function getCurrentBandId() {
    return localStorage.getItem("bandId");
}

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

    // sugestões vindas da formação (cada item vira "quase" um formulário)
    const [pendingEscalations, setPendingEscalations] = useState([]);

    const [adding, setAdding] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedIntegrant, setSelectedIntegrant] = useState("");

    const [priorityCache, setPriorityCache] = useState({});

    const escalationsSorted = useMemo(() => {
        const copy = Array.isArray(escalations) ? [...escalations] : [];
        // ordenação simples: por role, depois por nome (se existir)
        copy.sort((a, b) => {
            const ra = a?.role?.name || "";
            const rb = b?.role?.name || "";
            if (ra.localeCompare(rb) !== 0) return ra.localeCompare(rb);

            const ua = a?.user?.name || "";
            const ub = b?.user?.name || "";
            return ua.localeCompare(ub);
        });
        return copy;
    }, [escalations]);

    async function loadData() {
        if (!event) return;

        try {
            setLoading(true);

            const data = await getEscalations(event.id);
            setEscalations(Array.isArray(data) ? data : []);

            if (event.lineupId) {
                const lineup = await getLineup(event.lineupId);
                setSuggestedLineup(lineup);
            } else {
                setSuggestedLineup(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar escalações.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            setAdding(false);
            setSelectedRole("");
            setSelectedIntegrant("");
            setPendingEscalations([]);
            loadData();
        }
    }, [open, event?.id]);

    async function loadPriority(roleId) {
        if (!roleId || priorityCache[roleId]) return;

        const bandId = getCurrentBandId();
        if (!bandId) return;

        const role = allRoles.find(r => String(r.id) === String(roleId));
        if (!role?.slug) return;

        try {
            const data = await getPriorityList(role.slug, bandId);

            setPriorityCache(prev => ({
                ...prev,
                [roleId]: data
            }));
        } catch (err) {
            console.error(err);
        }
    }

    function getPriorityOnlyIntegrants(roleId) {
        if (!roleId || !priorityCache[roleId]) return [];

        const allowedIds = priorityCache[roleId].map(p => p.userId);

        return allIntegrants.filter(i =>
            allowedIds.includes(i.user.id)
        );
    }

    async function handleCreate() {
        if (!selectedRole || !selectedIntegrant) {
            toast.error("Selecione o papel e o integrante.");
            return;
        }

        try {
            await createEscalation(event.id, {
                userId: selectedIntegrant,
                roleId: selectedRole,
            });

            toast.success("Escalação adicionada!");

            setAdding(false);
            setSelectedRole("");
            setSelectedIntegrant("");

            await loadData();
            onUpdated?.();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar escalação.");
        }
    }

    // ✅ Agora cria sugestões no formato desejado:
    // - 2 selects (papel já preenchido e travado)
    // - usuário escolhe apenas o integrante
    function applyFormationAsSuggestions() {
        if (!suggestedLineup) return;

        const existingRoleIds = escalations
            .map(e => e?.role?.id)
            .filter(Boolean)
            .map(id => String(id));

        // aqui a gente evita duplicar a mesma role já sugerida no pending
        // (mas se sua formação tiver 2 guitarras, elas vêm como 2 itens — isso é OK)
        const pendingKeys = new Set(
            pendingEscalations.map(p => `${String(p.roleId)}|${p._key}`)
        );

        const lineupRoles = Array.isArray(suggestedLineup.roles) ? suggestedLineup.roles : [];

        const rolesToSuggest = lineupRoles
            .map((lr, idx) => {
                const role = lr?.role;
                if (!role?.id) return null;

                // chave única por item da formação (pra permitir repetição da mesma role)
                const key = `${String(role.id)}|${idx}`;

                return {
                    roleId: String(role.id),
                    roleName: role.name,
                    userId: "",
                    _key: key, // garante itens únicos mesmo com role repetida
                };
            })
            .filter(Boolean)
            // regra atual: não sugerir roles que já estão escaladas
            // (se você quiser sugerir mesmo assim, é só remover esse filtro)
            .filter(item => !existingRoleIds.includes(item.roleId))
            // não duplicar pending do mesmo item
            .filter(item => !pendingKeys.has(`${item.roleId}|${item._key}`));

        if (rolesToSuggest.length === 0) {
            toast.error("Nenhum papel novo para sugerir a partir da formação.");
            return;
        }

        rolesToSuggest.forEach(item => loadPriority(item.roleId));

        setPendingEscalations(prev => ([
            ...prev,
            ...rolesToSuggest
        ]));

        toast.success("Formação aplicada como base.");
    }

    async function confirmPending(index) {
        const item = pendingEscalations[index];

        if (!item?.roleId || !item?.userId) {
            toast.error("Selecione o integrante.");
            return;
        }

        try {
            await createEscalation(event.id, {
                userId: item.userId,
                roleId: item.roleId,
            });

            setPendingEscalations(prev =>
                prev.filter((_, i) => i !== index)
            );

            await loadData();
            onUpdated?.();

            toast.success("Escalação adicionada!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao confirmar escalação.");
        }
    }

    function cancelPending(index) {
        setPendingEscalations(prev =>
            prev.filter((_, i) => i !== index)
        );
    }

    async function handleDelete(id) {
        try {
            await deleteEscalation(id);
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
                    <h1 className="text-2xl font-bold">
                        Escalação — {event.name}
                    </h1>
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
                                <p className="text-sm text-gray-400">
                                    {suggestedLineup.name}
                                </p>

                                {/* ✅ (1) Agora mostra os papéis da formação */}
                                {Array.isArray(suggestedLineup.roles) && suggestedLineup.roles.length > 0 && (
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

                            <Button
                                className="bg-[#7c5fff] hover:bg-[#6a4ee8]"
                                onClick={applyFormationAsSuggestions}
                            >
                                Usar formação como base
                            </Button>
                        </div>
                    </div>
                )}

                {/* ✅ (3) LISTA DE ESCALADOS — agora aparece após adicionar */}
                <div className="mb-6">
                    {loading ? (
                        <p className="text-gray-400 text-sm">Carregando...</p>
                    ) : escalationsSorted.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            Nenhum integrante escalado ainda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {escalationsSorted.map((e) => (
                                <div
                                    key={e.id}
                                    className="bg-[#111118] border border-[#2a2a30] rounded-xl p-4 flex justify-between items-center gap-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-gray-200 font-medium truncate">
                                            {e?.user?.name || "Integrante"}
                                        </p>
                                        <p className="text-sm text-gray-400 truncate">
                                            {e?.role?.name || "Papel"}
                                        </p>
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

                {/* ✅ (2) PENDING DA FORMAÇÃO — 2 selects (role preenchida + integrante) */}
                {editable && pendingEscalations.length > 0 && (
                    <div className="space-y-4 mb-6">
                        {pendingEscalations.map((item, index) => (
                            <div
                                key={item._key || `${item.roleId}-${index}`}
                                className="mt-6 space-y-4 p-5 bg-[#111118] border border-[#2a2a30] rounded-xl"
                            >
                                <h2 className="text-lg font-semibold">Novo escalado</h2>

                                <div>
                                    <label className="text-sm text-gray-300">Papel</label>
                                    <select
                                        value={item.roleId}
                                        onChange={(e) => {
                                            const newRoleId = e.target.value;

                                            loadPriority(newRoleId);

                                            const role = allRoles.find(r => String(r.id) === String(newRoleId));

                                            setPendingEscalations(prev =>
                                                prev.map((p, i) =>
                                                    i === index
                                                        ? {
                                                            ...p,
                                                            roleId: newRoleId,
                                                            roleName: role?.name || "",
                                                            userId: "", // limpa integrante ao trocar papel
                                                        }
                                                        : p
                                                )
                                            );
                                        }}
                                        className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                                    >
                                        {allRoles.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                <div>
                                    <label className="text-sm text-gray-300">Integrante</label>
                                    <select
                                        value={item.userId}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setPendingEscalations(prev =>
                                                prev.map((p, i) =>
                                                    i === index ? { ...p, userId: value } : p
                                                )
                                            );
                                        }}
                                        className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                                    >
                                        <option value="">Selecione...</option>
                                        {getPriorityOnlyIntegrants(item.roleId).map(i => (
                                            <option key={i.user.id} value={i.user.id}>
                                                {i.user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    <Button
                                        className="bg-emerald-600/80 hover:bg-emerald-500 flex-1"
                                        onClick={() => confirmPending(index)}
                                    >
                                        Confirmar
                                    </Button>

                                    <Button
                                        className="bg-gray-600/50 hover:bg-gray-600 flex-1"
                                        onClick={() => cancelPending(index)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ADD MANUAL */}
                {editable && !adding && (
                    <Button
                        className="w-full bg-[#7c5fff] hover:bg-[#6a4ee8] flex items-center justify-center gap-2 py-3"
                        onClick={() => setAdding(true)}
                    >
                        <UserPlus size={20} />
                        Adicionar à Escalação
                    </Button>
                )}

                {editable && adding && (
                    <div className="mt-6 space-y-4 p-5 bg-[#111118] border border-[#2a2a30] rounded-xl">
                        <h2 className="text-lg font-semibold">Novo escalado</h2>

                        <div>
                            <label className="text-sm text-gray-300">Papel</label>
                            <select
                                value={selectedRole}
                                onChange={e => {
                                    const value = e.target.value;
                                    setSelectedRole(value);
                                    setSelectedIntegrant("");
                                    loadPriority(value);
                                }}
                                className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                            >
                                <option value="">Selecione...</option>
                                {allRoles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedRole && (
                            <div>
                                <label className="text-sm text-gray-300">Integrante</label>
                                <select
                                    value={selectedIntegrant}
                                    onChange={e => setSelectedIntegrant(e.target.value)}
                                    className="w-full bg-[#1a1a1e] border border-[#2a2a30] rounded-lg px-3 py-2 mt-1"
                                >
                                    <option value="">Selecione...</option>
                                    {getPriorityOnlyIntegrants(selectedRole).map(i => (
                                        <option key={i.user.id} value={i.user.id}>
                                            {i.user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <Button
                                className="bg-emerald-600/80 hover:bg-emerald-500 flex-1"
                                onClick={handleCreate}
                            >
                                Confirmar
                            </Button>

                            <Button
                                className="bg-gray-600/50 hover:bg-gray-600 flex-1"
                                onClick={() => setAdding(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
