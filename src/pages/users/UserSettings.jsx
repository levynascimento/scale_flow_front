import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import Button from "../../components/Button.jsx";
import Input from "../../components/Input.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { roleService, userService } from "../../services/index.js";
import { RoleService } from "../../services/RoleService.js";
import { authSession } from "../../core/session/AuthSession.js";
import { bandSession } from "../../core/session/BandSession.js";
import { SkillLevel } from "../../domain/SkillLevel.js";

/*
 * ♻️ REFACTORING — Extract Method (toLevelInputs)
 * Antes: o bloco
 *   const mapped = {}; habs.forEach(h => (mapped[h.roleSlug] = h.level.toString()));
 * era copiado no carregamento inicial e de novo depois de adicionar.
 * Benefícios: - Duplicação  + Legibilidade  + Testabilidade
 */
function toLevelInputs(skills) {
    return Object.fromEntries(skills.map(s => [s.roleSlug, s.level.toString()]));
}

/*
 * ♻️ REFACTORING — Extract Method (componente SettingsCard)
 * Antes: 4 blocos <div className="bg-sf-card p-6 rounded-xl border ...">
 * com <h2> repetidos em volta de cada seção.
 * Benefícios: - Duplicação  + Consistência visual
 */
function SettingsCard({ title, danger = false, children }) {
    return (
        <div className={`bg-sf-card p-6 rounded-xl border space-y-4 ${danger ? "border-red-900/50" : "border-sf-border"}`}>
            <h2 className={`text-xl font-semibold ${danger ? "text-red-400" : ""}`}>{title}</h2>
            {children}
        </div>
    );
}

export default function UserSettings() {
    const bandId = bandSession.bandId;

    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);

    /*
     * ♻️ REFACTORING — Rename Variable (habilities → skills)
     * Antes: habilities, newLevel, levelInputs... "hability" não existe em
     * inglês. Os nomes no frontend passaram a usar "skill".
     * Benefícios: + Legibilidade  + Expressividade
     */
    const [skills, setSkills] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newRoleSlug, setNewRoleSlug] = useState("");
    const [newLevel, setNewLevel] = useState("");
    const [levelInputs, setLevelInputs] = useState({});

    /*
     * ♻️ REFACTORING — Inline Variable (deleting)
     * Antes: o estado `deleting` era atualizado mas nunca lido.
     * Benefícios: - Código morto  - Renders desnecessários
     */

    useEffect(() => {
        async function loadUser() {
            try {
                const u = await userService.getCurrent();
                setUser(u);
                setName(u.name);
                setEmail(u.email);
            } catch {
                toast.error("Erro ao carregar dados do usuário.");
            }
        }
        loadUser();
    }, []);

    /*
     * ♻️ REFACTORING — Extract Method (applySkills)
     * Antes: setHabilities + montagem do mapa + setLevelInputs repetidos no
     * carregamento e após adicionar.
     * Benefícios: - Duplicação  + Consistência
     */
    function applySkills(list) {
        setSkills(list);
        setLevelInputs(toLevelInputs(list));
    }

    useEffect(() => {
        async function loadSkills() {
            try {
                const [list, allRoles] = await Promise.all([userService.listSkills(), roleService.list()]);
                applySkills(list);
                setRoles(allRoles);
            } catch {
                toast.error("Erro ao carregar habilidades.");
            }
        }
        loadSkills();
    }, []);

    async function handleUpdateUser() {
        try {
            await userService.update({ name, email });
            toast.success("Dados atualizados!");
        } catch {
            toast.error("Erro ao atualizar usuário.");
        }
    }

    async function handleChangePassword() {
        if (!password.trim()) {
            toast.error("A senha não pode ser vazia.");
            return;
        }

        try {
            await userService.updatePassword(password);
            toast.success("Senha alterada!");
            setPassword("");
        } catch {
            toast.error("Erro ao alterar senha.");
        }
    }

    async function handleConfirmDeleteAccount() {
        try {
            await userService.delete();
            toast.success("Conta deletada!");
            /*
             * ♻️ REFACTORING — Move Method (localStorage.clear → sessões)
             * Antes: `localStorage.clear()` apagava TUDO do domínio, inclusive
             * dados que não pertencem à sessão.
             * Agora: cada sessão limpa só o que é dela.
             * Benefícios: + Encapsulamento  - Efeitos colaterais
             */
            bandSession.leave();
            authSession.endSession();
        } catch {
            toast.error("Erro ao deletar conta.");
        } finally {
            setConfirmOpen(false);
        }
    }

    /*
     * ♻️ REFACTORING — Extract Method (hasSkill / roleNameBySlug)
     * Antes: `habilities.some(h => h.roleSlug === x)` aparecia 2x e
     * `roles.find(r => r.slug === roleSlug)` aparecia 3x.
     * Benefícios: - Duplicação  + Legibilidade
     */
    const hasSkill = (slug) => skills.some(s => s.roleSlug === slug);
    const roleNameBySlug = (slug) => RoleService.findBySlug(roles, slug)?.name;

    /*
     * ♻️ REFACTORING — Extract Method (validateNewSkill) + Extract Class (SkillLevel)
     * Antes: 4 ifs de validação no início do handleAddHability, incluindo a
     * regra "entre 0 e 10" escrita à mão.
     * Agora: a validação é um método que devolve a mensagem de erro (ou null),
     * e a regra do intervalo vem de SkillLevel.
     * Benefícios: + Legibilidade  + Coesão  - Duplicação  - Magic numbers
     */
    function validateNewSkill() {
        if (!newRoleSlug) return "Selecione um papel.";
        if (newLevel === "") return "Informe um nível.";
        if (SkillLevel.parse(newLevel) === null) return `O nível deve ser entre ${SkillLevel.rangeLabel}.`;
        if (hasSkill(newRoleSlug)) return "Você já cadastrou essa habilidade.";
        return null;
    }

    async function handleAddSkill() {
        const error = validateNewSkill();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            await userService.addSkill(roleNameBySlug(newRoleSlug), SkillLevel.parse(newLevel));
            toast.success("Habilidade adicionada!");
            applySkills(await userService.listSkills());
            setNewRoleSlug("");
            setNewLevel("");
        } catch {
            toast.error("Erro ao adicionar habilidade.");
        }
    }

    async function handleUpdateSkill(level, roleSlug) {
        try {
            await userService.updateSkill(roleNameBySlug(roleSlug), level);
            toast.success("Nível atualizado!");
        } catch {
            toast.error("Erro ao atualizar habilidade.");
        }
    }

    async function handleRemoveSkill(roleSlug) {
        try {
            await userService.removeSkill(roleNameBySlug(roleSlug));
            applySkills(skills.filter(s => s.roleSlug !== roleSlug));
            toast.success("Habilidade removida!");
        } catch {
            toast.error("Erro ao remover habilidade.");
        }
    }

    /*
     * ♻️ REFACTORING — Extract Method (handleLevelTyping / handleLevelBlur)
     * Antes: os handlers onChange e onBlur do campo de nível eram arrow
     * functions de 8–12 linhas escritas dentro do JSX.
     * Benefícios: + Legibilidade do JSX  + Testabilidade
     */
    function handleLevelTyping(roleSlug, value) {
        if (SkillLevel.isTypingAllowed(value)) {
            setLevelInputs(prev => ({ ...prev, [roleSlug]: value }));
        }
    }

    function handleLevelBlur(skill) {
        const level = SkillLevel.parse(levelInputs[skill.roleSlug]);
        if (level === null) {
            // valor inválido: volta para o último nível salvo
            setLevelInputs(prev => ({ ...prev, [skill.roleSlug]: skill.level.toString() }));
            return;
        }
        handleUpdateSkill(level, skill.roleSlug);
    }

    if (!user) return <div className="p-8 text-gray-300">Carregando...</div>;

    return (
        <div className="p-8 space-y-10">
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

            <SettingsCard title="Dados do Usuário">
                <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button className="mt-2 bg-sf-primary hover:bg-sf-primary/80" onClick={handleUpdateUser}>
                    Salvar Alterações
                </Button>
            </SettingsCard>

            <SettingsCard title="Alterar Senha">
                <Input label="Nova Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button className="mt-2 bg-blue-600 hover:bg-blue-700" onClick={handleChangePassword}>
                    Atualizar Senha
                </Button>
            </SettingsCard>

            <SettingsCard title="Minhas Habilidades">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400 h-5">Papel</label>
                        <select
                            value={newRoleSlug}
                            onChange={(e) => setNewRoleSlug(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-sf-surface border border-sf-border"
                        >
                            <option value="">Selecione</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.slug} disabled={hasSkill(r.slug)}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-400 h-5">Nível ({SkillLevel.MIN}–{SkillLevel.MAX})</label>
                        <Input type="number" className="w-32" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} />
                    </div>

                    <Button className="bg-sf-primary hover:bg-sf-primary/80 h-[42px]" onClick={handleAddSkill}>
                        Adicionar
                    </Button>
                </div>

                <div className="space-y-4">
                    {skills.length === 0 && (
                        <p className="text-gray-400">Você ainda não cadastrou habilidades.</p>
                    )}

                    {skills.map(skill => (
                        <div
                            key={skill.id}
                            className="p-4 rounded-lg bg-sf-surface border border-sf-border flex items-center justify-between"
                        >
                            <div className="space-y-2">
                                <p className="font-semibold capitalize">{skill.roleSlug}</p>
                                <Input
                                    label="Nível"
                                    type="text"
                                    inputMode="numeric"
                                    className="w-24"
                                    value={levelInputs[skill.roleSlug] ?? ""}
                                    onChange={(e) => handleLevelTyping(skill.roleSlug, e.target.value)}
                                    onBlur={() => handleLevelBlur(skill)}
                                />
                            </div>

                            <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleRemoveSkill(skill.roleSlug)}>
                                Remover
                            </Button>
                        </div>
                    ))}
                </div>
            </SettingsCard>

            <SettingsCard title="Zona de Perigo" danger>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => setConfirmOpen(true)}>
                    Deletar Conta
                </Button>
            </SettingsCard>

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
