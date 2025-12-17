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

export default function App() {
    return (
        <Routes>

            {/* público */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* CONFIGURAÇÕES DO USUÁRIO */}
            <Route
                path="/user/settings"
                element={
                    <ProtectedRoute>
                        <UserSettings />
                    </ProtectedRoute>
                }
            />

            {/* seleção de bandas */}
            <Route
                path="/bands/select"
                element={
                    <ProtectedRoute>
                        <BandSelect />
                    </ProtectedRoute>
                }
            />

            {/* layout da banda */}
            <Route
                path="/bands/:id"
                element={
                    <ProtectedRoute>
                        <BandLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="home" element={<BandHome />} />
                <Route path="repertoires" element={<Repertoires />} />
                <Route path="repertoires/new" element={<RepertoireForm />} />
                <Route path="repertoires/:musicId/edit" element={<RepertoireEdit />} />

                <Route path="events" element={<Events />} />
                <Route path="roles" element={<Roles />} />

                {/* ✅ Lineups só para ADMIN */}
                <Route
                    path="lineups"
                    element={
                        <RequireAdmin>
                            <Lineups />
                        </RequireAdmin>
                    }
                />

                {/* ✅ Configurações da Banda só para ADMIN */}
                <Route
                    path="settings"
                    element={
                        <RequireAdmin>
                            <BandSettings />
                        </RequireAdmin>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/bands/select" replace />} />
        </Routes>
    )
}
