import { Outlet, NavLink, useParams } from "react-router-dom"
import { useState } from "react"
import {
    Home,
    Music,
    Calendar,
    Users,
    Layers,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Cloud,
    Settings,
    User
} from "lucide-react"
import { logoutUser } from "../../utils/authUtils"
import ConfirmDialog from "../ConfirmDialog.jsx";

export default function BandLayout() {
    const { id } = useParams()
    const [collapsed, setCollapsed] = useState(false)
    const [userMenu, setUserMenu] = useState(false)
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

    const role = localStorage.getItem("bandRole")
    const isAdmin = role === "ADMIN"

    const baseItem = (isActive) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
        ${isActive ? "bg-[#7c5fff] text-white" : "text-gray-300 hover:bg-[#2a2a2f]"}`

    function leaveBand() {
        localStorage.removeItem("currentBand")
        window.location.href = "/bands"
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
                            {collapsed ? (
                                <ChevronRight size={18} />
                            ) : (
                                <ChevronLeft size={18} />
                            )}
                        </button>
                    </div>

                    {/* BADGE DO TIPO DE USUÁRIO */}
                    {!collapsed && (
                        <div className="mt-3">
                            <span
                                className={`text-xs px-3 py-1 rounded-xl border ${
                                    role === "ADMIN"
                                        ? "text-[#cbb6ff] border-[#7c5fff]/40 bg-[#7c5fff]/10"
                                        : role === "MEMBER"
                                            ? "text-[#a7d4ff] border-[#4ea1ff]/40 bg-[#4ea1ff]/10"
                                            : "text-gray-400 border-gray-600/40 bg-gray-600/10"
                                }`}
                            >
                                {role === "ADMIN"
                                    ? "Administrador"
                                    : role === "MEMBER"
                                        ? "Membro"
                                        : "Observador"}
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
                    <NavLink to={`/bands/${id}/home`} end className={({ isActive }) => baseItem(isActive)}>
                        <Home size={18} /> {!collapsed && "Home"}
                    </NavLink>

                    <NavLink to={`/bands/${id}/repertoires`} className={({ isActive }) => baseItem(isActive)}>
                        <Music size={18} /> {!collapsed && "Repertório"}
                    </NavLink>

                    <NavLink to={`/bands/${id}/events`} className={({ isActive }) => baseItem(isActive)}>
                        <Calendar size={18} /> {!collapsed && "Eventos"}
                    </NavLink>

                    <NavLink to={`/bands/${id}/roles`} className={({ isActive }) => baseItem(isActive)}>
                        <Users size={18} /> {!collapsed && "Papéis"}
                    </NavLink>

                    {isAdmin && (
                        <NavLink to={`/bands/${id}/lineups`} className={({ isActive }) => baseItem(isActive)}>
                            <Layers size={18} /> {!collapsed && "Formações"}
                        </NavLink>
                    )}
                </nav>

                {/* RODAPÉ FIXO */}
                <div className="p-3 border-t border-[#2a2a30] space-y-2">

                    {isAdmin && (
                        <NavLink
                            to={`/bands/${id}/settings`}
                            className={({ isActive }) => baseItem(isActive)}
                        >
                            <Settings size={18} /> {!collapsed && "Configurações da Banda"}
                        </NavLink>
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
                                    onClick={() => {
                                        setUserMenu(false)
                                        window.location.href = "/user/settings"
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#2a2a2f] w-full text-left text-sm"
                                >
                                    <Settings size={16} />
                                    Configurações
                                </button>

                                <button
                                    onClick={() => logoutUser()}
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

            {/* CONFIRM */}
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
