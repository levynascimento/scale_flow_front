import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const [checking, setChecking] = useState(true)
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setAuthenticated(!!token)
        setChecking(false)
    }, [])

    if (checking) {
        return <div className="p-8 text-sf-muted">Verificando sessão...</div>
    }

    return authenticated ? children : <Navigate to="/auth/login" replace />
}
