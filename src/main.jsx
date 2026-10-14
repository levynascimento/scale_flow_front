import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles.css'

/*
 * ♻️ REFACTORING — Extract Variable (TOASTER_OPTIONS)
 * Antes: um objeto de configuração com 20 linhas estava escrito inline
 * dentro do JSX do render, misturando "o que renderizar" com "como estilizar
 * as notificações".
 * Benefícios:
 *   + Legibilidade (o render mostra só a estrutura do app)
 *   + Coesão (tema dos toasts tem nome e lugar próprio)
 */
const TOASTER_OPTIONS = {
    style: {
        background: '#1e1e22',
        color: '#fff',
        border: '1px solid #7c5fff',
        fontSize: '0.9rem',
    },
    success: {
        iconTheme: { primary: '#7c5fff', secondary: '#1e1e22' },
    },
    error: {
        style: { border: '1px solid #ef4444' },
    },
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster position="top-right" toastOptions={TOASTER_OPTIONS} />
        </BrowserRouter>
    </React.StrictMode>
)
