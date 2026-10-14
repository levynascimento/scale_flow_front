import { NavLink } from "react-router-dom"

/*
 * ♻️ REFACTORING — Extract Method (componente SidebarLink) + Move Method (baseItem)
 * Antes: BandLayout repetia 6 vezes o mesmo bloco:
 *   <NavLink to={...} className={({ isActive }) => baseItem(isActive)}>
 *       <Icone size={18} /> {!collapsed && "Texto"}
 *   </NavLink>
 * e a função baseItem() morava dentro do BandLayout, embora só servisse
 * para estilizar esses links.
 * Benefícios:
 *   - Duplicação
 *   + Coesão (o estilo do link mora junto do link)
 *   + Legibilidade do layout
 */
function linkClass(isActive) {
    return `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
        ${isActive ? "bg-[#7c5fff] text-white" : "text-gray-300 hover:bg-[#2a2a2f]"}`
}

export default function SidebarLink({ to, icon: Icon, label, collapsed, end = false }) {
    return (
        <NavLink to={to} end={end} className={({ isActive }) => linkClass(isActive)}>
            <Icon size={18} /> {!collapsed && label}
        </NavLink>
    )
}
