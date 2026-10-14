import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'

import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

import BandSelect from './pages/bands/BandSelect.jsx'
import BandHome from './pages/bands/BandHome.jsx'

import Repertoires from './pages/repertoires/Repertoires.jsx'
import RepertoireForm from './pages/repertoires/RepertoireForm.jsx'
import RepertoireEdit from "./pages/repertoires/RepertoireEdit.jsx";

import BandLayout from "./components/layout/BandLayout.jsx";
import Events from './pages/events/Events.jsx'
import Lineups from './pages/lineups/Lineups.jsx'
import Roles from "./pages/roles/Roles.jsx"
import UserSettings from "./pages/users/UserSettings.jsx";
import BandSettings from "./pages/bands/BandSettings.jsx";

/*
 * ♻️ REFACTORING — Extract Method (protectedPage / adminOnly)
 * Antes: o embrulho `<ProtectedRoute>...</ProtectedRoute>` e
 * `<RequireAdmin>...</RequireAdmin>` era escrito à mão em cada rota
 * (6 blocos de 5–7 linhas cada).
 * Benefícios:
 *   - Duplicação
 *   + Legibilidade (a tabela de rotas cabe na tela)
 *   + Consistência (impossível esquecer de proteger uma rota pela metade)
 */
function protectedPage(element) {
    return <ProtectedRoute>{element}</ProtectedRoute>
}

function adminOnly(element) {
    return <RequireAdmin>{element}</RequireAdmin>
}

export default function App() {
    return (
        <Routes>
            {/* público */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* usuário logado */}
            <Route path="/user/settings" element={protectedPage(<UserSettings />)} />
            <Route path="/bands/select" element={protectedPage(<BandSelect />)} />

            {/* layout da banda */}
            <Route path="/bands/:id" element={protectedPage(<BandLayout />)}>
                <Route path="home" element={<BandHome />} />
                <Route path="repertoires" element={<Repertoires />} />
                <Route path="repertoires/new" element={<RepertoireForm />} />
                <Route path="repertoires/:musicId/edit" element={<RepertoireEdit />} />
                <Route path="events" element={<Events />} />
                <Route path="roles" element={<Roles />} />

                {/* somente ADMIN */}
                <Route path="lineups" element={adminOnly(<Lineups />)} />
                <Route path="settings" element={adminOnly(<BandSettings />)} />
            </Route>

            <Route path="*" element={<Navigate to="/bands/select" replace />} />
        </Routes>
    )
}
