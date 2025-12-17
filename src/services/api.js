import axios from 'axios'

// ✅ Criação da instância base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
})

// ✅ Função para configurar o token de autenticação
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        localStorage.setItem('token', token) // 🔹 padronizado
    } else {
        delete api.defaults.headers.common['Authorization']
        localStorage.removeItem('token')
    }
}

// ✅ Restaura token salvo ao iniciar o app
const storedToken = localStorage.getItem('token')
if (storedToken) {
    setAuthToken(storedToken)
}

// ✅ Interceptador de resposta (trata erros 401 e 403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response
            if (status === 401 || status === 403) {
                console.warn('Sessão expirada. Redirecionando para login...')
                setAuthToken(null)

                // Evita redirecionar se já estiver na tela de login
                if (!window.location.pathname.includes('/auth/login')) {
                    window.location.href = '/auth/login'
                }
            }
        } else if (error.request) {
            console.error('Sem resposta do servidor. Verifique sua conexão.')
        } else {
            console.error('Erro ao configurar requisição:', error.message)
        }

        return Promise.reject(error)
    }
)

export default api
