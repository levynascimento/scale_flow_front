import api from './api'

// 📋 Listar todas as bandas
export async function getBands() {
    const { data } = await api.get('/bands')
    return data
}

// 📄 Detalhar banda
export async function getBandById(id) {
    const { data } = await api.get(`/bands/${id}`)
    return data
}

// 📄 Detalhar banda + Join Code
export async function getBandWithJoinCode(id) {
    const { data } = await api.get(`/bands/${id}/join-code`)
    return data
}

// ✏️ Atualizar banda
export async function updateBand(id, body) {
    const { data } = await api.put(`/bands/${id}`, body)
    return data
}

// ❌ Deletar banda
export async function deleteBand(id) {
    await api.delete(`/bands/${id}`)
}

// ➕ Criar nova banda
export async function createBand(body) {
    const { data } = await api.post('/bands', body)
    return data
}

// 🔁 Redefinir Join Code
export async function regenerateJoinCode(id) {
    const { data } = await api.put(`/bands/${id}/join-code`)
    return data
}

// 👥 Entrar em uma banda com Join Code
export async function joinBand(joinCode) {
    const { data } = await api.post(`/bands/join/${joinCode}`)
    return data
}

// 🔍 Consultar banda pelo Join Code
export async function getBandJoinCode(id) {
    const { data } = await api.get(`/bands/${id}/join-code`)
    return data
}

// 👥 Buscar todos os integrantes de uma banda
export async function getBandMembers(bandId) {
    const { data } = await api.get(`/bands/${bandId}/integrants`)
    return data
}
