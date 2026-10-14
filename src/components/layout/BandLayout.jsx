import { Outlet, useParams } from "react-router-dom"
import { useState } from "react"
import toast from "react-hot-toast"
import {
    Home,
    Music,
    Calendar,
    Users,
    Layers,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings,
    User
} from "lucide-react"
import { authSession } from "../../core/session/AuthSession.js"
import { bandSession } from "../../core/session/BandSession.js"
import ConfirmDialog from "../ConfirmDialog.jsx"
import SidebarLink from "./SidebarLink.jsx"

/*
 * ♻️ REFACTORING — Extract Variable → Move Field (NAV_ITEMS)
 * Antes: os itens do menu eram 5 blocos de JSX quase idênticos.
 * Agora: são dados (rótulo, ícone, caminho, se é só admin) e o JSX itera.
 * Benefícios:
 *   - Duplicação
 *   + Extensibilidade (novo item de menu = uma linha)
 *   + Legibilidade
 */
const NAV_ITEMS = [
    { path: "home", label: "Home", icon: Home, end: true },
    { path: "repertoires", label: "Repertório", icon: Music },
    { path: "events", label: "Eventos", icon: Calendar },
    { path: "roles", label: "Papéis", icon: Users },
    { path: "lineups", label: "Formações", icon: Layers, adminOnly: true }
]

export default function BandLayout() {
    const { id } = useParams()
    const [collapsed, setCollapsed] = useState(false)
    const [userMenu, setUserMenu] = useState(false)
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

    /*
     * ♻️ REFACTORING — Rename Variable (role → membership)
     * Antes: `role` (string vinda do localStorage), nome que colidia com os
     * "papéis" musicais do sistema.
     * Agora: `membership` é um objeto MembershipRole com rótulo e estilo.
     * Benefícios:
     *   + Legibilidade
     *   - Ambiguidade
     */
    const membership = bandSession.membershipRole
    const isAdmin = membership.isAdmin

    /*
     * ♻️ REFACTORING — Extract Variable (visibleNavItems)
     * Benefícios:
     *   + Legibilidade (a regra "admin vê formações" fica explícita)
     */
    const visibleNavItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)

    /*
     * ♻️ REFACTORING — Move Method (leaveBand → BandSession.leave)
     * Antes: o componente manipulava localStorage diretamente (e removia a
     * chave errada, "currentBand", então a banda nunca era esquecida).
     * Benefícios:
     *   + Coesão
     *   - Acoplamento
     *   + Corretude (bug corrigido)
     */
    function leaveBand() {
        bandSession.leave()
        window.location.href = "/bands/select"
    }

    /*
     * ♻️ REFACTORING — Move Method (logoutUser → AuthSession.endSession)
     * O toast ficou aqui (é UI); limpar a sessão e redirecionar foi para a sessão.
     * Benefícios:
     *   + Coesão
     *   - Acoplamento
     */
    function logout() {
        toast.success("Sessão encerrada com sucesso!")
        authSession.endSession({ redirectDelayMs: 800 })
    }

    function goToUserSettings() {
        setUserMenu(false)
        window.location.href = "/user/settings"
    }

    return (
        <div className="flex h-screen bg-[#0f0f10] text-gray-100 overflow-hidden">

            {/* SIDEBAR */}
            <aside
                className={`
                    ${collapsed ? "w-16" : "w-56"}
                    bg-[#1b1b1f] border-r border-[#2a2a30]
                    flex flex-col justify-between
                    h-full overflow-hidden
                    transition-all duration-200
                `}
            >

                {/* HEADER DO MENU */}
                <div className="px-4 py-4 border-b border-[#2a2a30]">
                    <div className="flex items-center justify-between">
                        {!collapsed && (
                            <h1 className="text-lg font-semibold text-[#7c5fff]">
                                ScaleFlow
                            </h1>
                        )}

                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    </div>

                    {/*
                      ♻️ REFACTORING — Extract Class (MembershipRole)
                      Antes: dois ternários aninhados de 3 níveis (um para a cor,
                      outro para o texto) direto no JSX.
                      Benefícios: - Complexidade  - Duplicação  + Legibilidade
                    */}
                    {!collapsed && (
                        <div className="mt-3">
                            <span className={`text-xs px-3 py-1 rounded-xl border ${membership.badgeClass}`}>
                                {membership.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* MENU PRINCIPAL — ROLÁVEL */}
                <nav
                    className="
                        flex-1 overflow-y-auto px-3 py-4 space-y-2
                        scrollbar-thin scrollbar-thumb-[#2a2a30] scrollbar-track-[#1b1b1f]
                    "
                >
                    {visibleNavItems.map(item => (
                        <SidebarLink
                            key={item.path}
                            to={`/bands/${id}/${item.path}`}
                            icon={item.icon}
                            label={item.label}
                            end={item.end}
                            collapsed={collapsed}
                        />
                    ))}
                </nav>

                {/* RODAPÉ FIXO */}
                <div className="p-3 border-t border-[#2a2a30] space-y-2">
                    {isAdmin && (
                        <SidebarLink
                            to={`/bands/${id}/settings`}
                            icon={Settings}
                            label="Configurações da Banda"
                            collapsed={collapsed}
                        />
                    )}

                    <button
                        onClick={() => setLeaveDialogOpen(true)}
                        className="
                            flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full
                            text-red-400 hover:bg-[#3a2020] transition
                        "
                    >
                        <LogOut size={18} /> {!collapsed && "Sair da Banda"}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col">

                {/* HEADER SUPERIOR */}
                <header className="bg-[#1b1b1f] border-b border-[#2a2a30] p-4 flex justify-between items-center shadow-sm">
                    <h2 className="text-lg font-medium text-gray-200">Painel da Banda</h2>

                    <div className="relative">
                        <button
                            onClick={() => setUserMenu(!userMenu)}
                            className="w-10 h-10 rounded-full bg-[#2b2b2f] flex items-center justify-center hover:bg-[#3a3a40] transition"
                        >
                            <User size={18} />
                        </button>

                        {userMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#1b1b1f] border border-[#2a2a30] rounded-lg shadow-xl p-2 z-50">
                                <button
                                    onClick={goToUserSettings}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#2a2a2f] w-full text-left text-sm"
                                >
                                    <Settings size={16} />
                                    Configurações
                                </button>

                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#3a2020] text-red-400 w-full text-left text-sm"
                                >
                                    <LogOut size={16} />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f10]">
                    <Outlet />
                </div>
            </main>

            <ConfirmDialog
                open={leaveDialogOpen}
                title="Sair da Banda"
                message="Deseja realmente sair desta banda? Você pode entrar novamente selecionando ela na tela de seleção de bandas."
                onCancel={() => setLeaveDialogOpen(false)}
                onConfirm={leaveBand}
            />
        </div>
    )
}
