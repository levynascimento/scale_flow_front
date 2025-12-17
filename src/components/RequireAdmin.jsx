import { Navigate, useParams } from "react-router-dom";

export default function RequireAdmin({ children }) {
    const role = localStorage.getItem("bandRole");
    const { id } = useParams();

    if (role !== "ADMIN") {
        // se estiver dentro de /bands/:id, manda pra home da banda
        if (id) {
            return <Navigate to={`/bands/${id}/home`} replace />;
        }

        // fallback (caso acesse algo fora do contexto de banda)
        return <Navigate to="/bands/select" replace />;
    }

    return children;
}
