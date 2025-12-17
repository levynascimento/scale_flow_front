
import api from './api'

// Lista todos os eventos da banda
export async function getBandEvents(bandId) {
    const { data } = await api.get(`/bands/${bandId}/events`)
    return data
}

// Detalhes de um evento específico
export async function getEventById(eventId) {
    const { data } = await api.get(`/events/${eventId}`)
    return data
}

// Criar evento para a banda
export async function createEvent(bandId, body) {
    const { data } = await api.post(`/bands/${bandId}/events`, body)
    return data
}

// Editar evento
export async function updateEvent(eventId, body) {
    const { data } = await api.put(`/events/${eventId}`, body)
    return data
}

// Deletar evento
export async function deleteEvent(eventId) {
    await api.delete(`/events/${eventId}`)
}

export async function getBandEventsToday(bandId) {
    const { data } = await api.get(`/bands/${bandId}/events/now`)
    return data
}

export async function getBandEventsFuture(bandId) {
    const { data } = await api.get(`/bands/${bandId}/events/future`)
    return data
}

export async function getBandEventsPast(bandId) {
    const { data } = await api.get(`/bands/${bandId}/events/past`)
    return data
}

export async function importHolyricsEvents(bandId, month, year, month_year) {
    const { data } = await api.post(`/band/${bandId}/events/holyrics/import`, {
        month,
        year,
        month_year
    })
    return data
}

export async function getEventMusics(eventId) {
    const res = await api.get(`/events/${eventId}/musics`);
    return res.data;
}

export async function addMusicToEvent(eventId, musicId) {
    const res = await api.post(`/events/${eventId}/musics`, { musicId });
    return res.data;
}

export async function removeMusicFromEvent(eventId, musicId) {
    const res = await api.delete(`/events/${eventId}/musics`, {
        data: { musicId }
    });
    return res.data;
}

// 📌 Buscar sugestões do evento
export async function getEventSuggestions(eventId) {
    const { data } = await api.get(`/events/${eventId}/suggestions`);
    return data;
}

// 📌 Criar nova sugestão
export async function createSuggestion(eventId, musicId) {
    const { data } = await api.post(`/events/${eventId}/suggestions`, { musicId });
    return data;
}

export async function acceptSuggestion(suggestionId) {
    await api.put(`/suggestions/${suggestionId}/accept`)
}

export async function deleteSuggestion(suggestionId) {
    await api.delete(`/suggestions/${suggestionId}`)
}




