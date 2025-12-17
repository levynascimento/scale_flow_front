import { useEffect, useState } from "react";
import {
    getCurrentUser,
    updateUser,
    updatePassword,
    deleteUser,
    getUserHabilities,
    addUserHability,
    updateUserHability,
    deleteUserHability
} from "../../services/userApi.js";
import { getRoles } from "../../services/rolesApi";
import toast from "react-hot-toast";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { NavLink } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export default function UserSettings() {
    const bandId = localStorage.getItem("bandId");

    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // CONFIRM DELETE
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // --- HABILIDADES ---
    const [habilities, setHabilities] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newRole, setNewRole] = useState("");
    const [newLevel, setNewLevel] = useState("");
    const [levelInputs, setLevelInputs] = useState({});

    // ------------------------------------------
    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setUser(u);
                setName(u.name);
                setEmail(u.email);
            } catch {
                toast.error("Erro ao carregar dados do usuário.");
            }
        }
        load();
    }, []);

    // ------------------------------------------
    async function handleUpdateUser() {
        try {
            await updateUser({ name, email });
            toast.success("Dados atualizados!");
        } catch {
            toast.error("Erro ao atualizar usuário.");
        }
    }

    // ------------------------------------------
    async function handleChangePassword() {
        if (!password.trim()) {
            toast.error("A senha não pode ser vazia.");
            return;
        }

        try {
            await updatePassword(password);
            toast.success("Senha alterada!");
            setPassword("");
        } catch {
            toast.error("Erro ao alterar senha.");
        }
    }

    // ------------------------------------------
    async function handleConfirmDeleteAccount() {
        try {
            setDeleting(true);
            await deleteUser();
            toast.success("Conta deletada!");
            localStorage.clear();
            window.location.href = "/auth/login";
        } catch {
            toast.error("Erro ao deletar conta.");
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
        }
    }

    // =============== HABILIDADES ===============
    useEffect(() => {
        async function loadHabilitiesData() {
            try {
                const habs = await getUserHabilities();
                setHabilities(habs);

                const mapped = {};
                habs.forEach(h => (mapped[h.roleSlug] = h.level.toString()));
                setLevelInputs(mapped);

                const r = await getRoles();
                setRoles(r);
            } catch {
                toast.error("Erro ao carregar habilidades.");
            }
        }

        loadHabilitiesData();
    }, []);

    // ------------------------------------------
    async function handleAddHability() {
        if (!newRole) {
            toast.error("Selecione um papel.");
            return;
        }

        if (newLevel === "") {
            toast.error("Informe um nível.");
            return;
        }

        const parsedLevel = Number(newLevel);
        if (parsedLevel < 0 || parsedLevel > 10) {
            toast.error("O nível deve ser entre 0 e 10.");
            return;
        }

        if (habilities.some(h => h.roleSlug === newRole)) {
            toast.error("Você já cadastrou essa habilidade.");
            return;
        }

        try {
            const role = roles.find(r => r.slug === newRole);

            await addUserHability(role.name, parsedLevel);
            toast.success("Habilidade adicionada!");

            const habs = await getUserHabilities();
            setHabilities(habs);

            const mapped = {};
            habs.forEach(h => (mapped[h.roleSlug] = h.level.toString()));
            setLevelInputs(mapped);

            setNewRole("");
            setNewLevel("");

        } catch {
            toast.error("Erro ao adicionar habilidade.");
        }
    }

    // ------------------------------------------
    async function handleUpdate(level, roleSlug) {
        try {
            const role = roles.find(r => r.slug === roleSlug);
            await updateUserHability(role.name, level);
            toast.success("Nível atualizado!");
        } catch {
            toast.error("Erro ao atualizar habilidade.");
        }
    }

    // ------------------------------------------
    async function handleDelete(roleSlug) {
        try {
            const role = roles.find(r => r.slug === roleSlug);
            await deleteUserHability(role.name);

            const updated = habilities.filter(h => h.roleSlug !== roleSlug);
            setHabilities(updated);

            setLevelInputs(prev => {
                const clone = { ...prev };
                delete clone[roleSlug];
                return clone;
            });

            toast.success("Habilidade removida!");
        } catch {
            toast.error("Erro ao remover habilidade.");
        }
    }

    // ------------------------------------------
    if (!user) return <div className="p-8 text-gray-300">Carregando...</div>;

    return (
        <div className="p-8 space-y-10">

            {/* BOTÃO DE VOLTAR */}
            <div className="mb-4">
                <NavLink
                    to={`/bands/${bandId}/home`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                               bg-sf-surface border border-sf-border text-sf-foreground
                               hover:bg-sf-surface/80 transition-colors"
                >
                    <FiArrowLeft size={18} />
                    <span>Voltar</span>
                </NavLink>
            </div>

            <h1 className="text-3xl font-bold">Configurações da Conta</h1>

            {/* DADOS DO USUÁRIO */}
            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">
                <h2 className="text-xl font-semibold">Dados do Usuário</h2>

                <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <Button className="mt-2 bg-sf-primary hover:bg-sf-primary/80" onClick={handleUpdateUser}>
                    Salvar Alterações
                </Button>
            </div>

            {/* SENHA */}
            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">
                <h2 className="text-xl font-semibold">Alterar Senha</h2>

                <Input
                    label="Nova Senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button className="mt-2 bg-blue-600 hover:bg-blue-700" onClick={handleChangePassword}>
                    Atualizar Senha
                </Button>
            </div>

            {/* HABILIDADES */}
            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">
                <h2 className="text-xl font-semibold">Minhas Habilidades</h2>

                <div className="space-y-4">
                    {habilities.length === 0 && (
                        <p className="text-gray-400">Você ainda não cadastrou habilidades.</p>
                    )}

                    {habilities.map(h => (
                        <div
                            key={h.id}
                            className="p-4 rounded-lg bg-sf-surface border border-sf-border flex items-center justify-between"
                        >
                            <div className="space-y-2">
                                <p className="font-semibold capitalize">{h.roleSlug}</p>

                                <Input
                                    label="Nível"
                                    type="text"
                                    inputMode="numeric"
                                    className="w-24"
                                    value={levelInputs[h.roleSlug] ?? ""}
                                    onChange={(e) => {
                                        let val = e.target.value;

                                        if (val === "") {
                                            setLevelInputs(prev => ({ ...prev, [h.roleSlug]: "" }));
                                            return;
                                        }

                                        if (/^\d{1,2}$/.test(val)) {
                                            setLevelInputs(prev => ({ ...prev, [h.roleSlug]: val }));
                                        }
                                    }}
                                    onBlur={() => {
                                        const raw = levelInputs[h.roleSlug];
                                        if (raw === "") {
                                            setLevelInputs(prev => ({ ...prev, [h.roleSlug]: h.level.toString() }));
                                            return;
                                        }

                                        const nivel = Number(raw);
                                        if (nivel < 0 || nivel > 10) {
                                            toast.error("Informe um nível válido (0 a 10).");
                                            setLevelInputs(prev => ({ ...prev, [h.roleSlug]: h.level.toString() }));
                                            return;
                                        }

                                        handleUpdate(nivel, h.roleSlug);
                                    }}
                                />
                            </div>

                            <Button
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(h.roleSlug)}
                            >
                                Remover
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ZONA DE PERIGO */}
            <div className="bg-sf-card p-6 rounded-xl border border-red-900/50 space-y-4">
                <h2 className="text-xl font-semibold text-red-400">Zona de Perigo</h2>

                <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => setConfirmOpen(true)}
                >
                    Deletar Conta
                </Button>
            </div>

            {/* CONFIRM DIALOG */}
            <ConfirmDialog
                open={confirmOpen}
                title="Deletar Conta"
                message="Esta ação é irreversível. Todos os seus dados serão apagados. Deseja continuar?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDeleteAccount}
            />
        </div>
    );
}
