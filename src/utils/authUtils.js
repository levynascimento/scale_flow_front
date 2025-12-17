import { setAuthToken } from '../services/api'
import toast from 'react-hot-toast'

export function logoutUser() {
    // Limpa dados do usuário
    localStorage.removeItem('token')

    // Remove o token do axios
    setAuthToken(null)

    // Mostra feedback
    toast.success('Sessão encerrada com sucesso!')

    // Redireciona após breve delay
    setTimeout(() => {
        window.location.href = '/auth/login'
    }, 800)
}
