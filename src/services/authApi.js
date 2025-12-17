import api, { setAuthToken } from './api'

export async function loginUser(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    const token = data.token

    // salva token e configura para o axios
    setAuthToken(token)
    localStorage.setItem('token', token)

    return data // pode retornar só o token mesmo
}
