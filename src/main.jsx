import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

// 👇 importa o Toaster
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />

            {/* 🔥 adiciona o toaster global */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e1e22',
                        color: '#fff',
                        border: '1px solid #7c5fff',
                        fontSize: '0.9rem',
                    },
                    success: {
                        iconTheme: {
                            primary: '#7c5fff',
                            secondary: '#1e1e22',
                        },
                    },
                    error: {
                        style: {
                            border: '1px solid #ef4444',
                        },
                    },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
)
