import { Navigate, useParams } from "react-router-dom";
import { bandSession } from "../core/session/BandSession.js";

export default function RequireAdmin({ children }) {
    const { id } = useParams();

    /*
     * ♻️ REFACTORING — Move Method (checagem de admin → BandSession.isAdmin)
     * Antes: `localStorage.getItem("bandRole") !== "ADMIN"`.
     * Benefícios:
     *   - Acoplamento (com localStorage e com a string "ADMIN")
     *   - Duplicação (a mesma regra existia em 4 arquivos)
     */
    if (bandSession.isAdmin) {
        return children;
    }

    /*
     * ♻️ REFACTORING — Extract Variable (fallbackPath)
     * Antes: dois `return <Navigate ...>` com um if no meio.
     * Benefícios:
     *   + Legibilidade
     *   - Duplicação de JSX
     */
    const fallbackPath = id ? `/bands/${id}/home` : "/bands/select";
    return <Navigate to={fallbackPath} replace />;
}
