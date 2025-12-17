// src/services/holyricsApi.js
import api from "./api";

// ⭐ Atualizar credenciais
export async function updateHolyricsConfig(bandId, body) {
    const { data } = await api.put(`/band/${bandId}/holyrics`, body);
    return data;
}

// ⭐ Desconectar Holyrics da banda
export async function disconnectHolyrics(bandId) {
    const { data } = await api.delete(`/band/${bandId}/holyrics`);
    return data;
}

// ⭐ Músicas
export async function listHolyricsMusics(bandId) {
    const { data } = await api.post(`/band/${bandId}/musics/holyrics/list`);
    return data;
}

export async function importHolyricsMusics(bandId) {
    const { data } = await api.post(`/band/${bandId}/musics/holyrics/import`);
    return data;
}

// ⭐ Eventos
export async function listHolyricsEvents(bandId, body) {
    const { data } = await api.post(`/band/${bandId}/events/holyrics/list`, body);
    return data;
}

export async function importHolyricsEvents(bandId, body) {
    const { data } = await api.post(`/band/${bandId}/events/holyrics/import`, body);
    return data;
}
