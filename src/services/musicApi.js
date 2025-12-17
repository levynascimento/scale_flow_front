import api from './api'

// 🎵 CRUD básico de músicas
export async function getMusicById(id) {
    const { data } = await api.get(`/musics/${id}`)
    return data
}

export async function updateMusicInfo(id, body) {
    const { data } = await api.put(`/musics/${id}`, body)
    return data
}

export async function deleteMusic(id) {
    await api.delete(`/musics/${id}`)
}

// 🎵 Temas de música
export async function addMusicThemes(id, themesArray) {
    const { data } = await api.post(`/musics/${id}/themes`, themesArray)
    return data
}

export async function removeMusicThemes(id, themes) {
    await api.delete(`/musics/${id}/themes`, { data: themes })
}

// 🎸 Músicas ligadas a uma banda
export async function getBandMusics(bandId) {
    const { data } = await api.get(`/bands/${bandId}/musics`)
    return data
}

export async function createMusic(bandId, body) {
    const { data } = await api.post(`/bands/${bandId}/musics`, body)
    return data
}

// 🎚️ DIFICULDADE DE MÚSICAS POR PAPEL
// -------------------------------------------

// Listar dificuldades da música
export async function getMusicDifficulties(id) {
    const { data } = await api.get(`/musics/${id}/difficulties`)
    return data
}

// Definir ou sobrescrever dificuldade de um papel
export async function setMusicDifficulty(id, roleSlug, level) {
    const { data } = await api.post(`/musics/${id}/difficulties/${roleSlug}`, {
        level
    })
    return data
}

// Remover dificuldade específica
export async function deleteMusicDifficulty(id, roleSlug) {
    const { data } = await api.delete(`/musics/${id}/difficulties/${roleSlug}`)
    return data
}
