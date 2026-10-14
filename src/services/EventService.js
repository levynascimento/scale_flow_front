import { BaseService } from './BaseService.js'
import { Event } from '../domain/Event.js'
import { EventFilter } from '../domain/EventFilter.js'

/*
 * ♻️ REFACTORING — Extract Class (eventApi.js → EventService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade
 */
export class EventService extends BaseService {
    /*
     * ♻️ REFACTORING — Extract Method + Move Method (listByFilter)
     * Antes: existiam 4 funções quase iguais (getBandEvents, getBandEventsToday,
     * getBandEventsFuture, getBandEventsPast) e o componente Events escolhia
     * qual chamar com if/else, depois ordenava com OUTRO if/else.
     * Agora: um método recebe o EventFilter, que já sabe o endpoint e a ordem.
     * Benefícios:
     *   - Duplicação (4 funções → 1)
     *   - Complexidade no componente
     *   + Coesão
     *   + Extensibilidade
     */
    async listByFilter(bandId, filter = EventFilter.ALL) {
        const dtos = await this.http.get(`/bands/${bandId}/events${filter.pathSuffix}`)
        return filter.sort(Event.fromList(dtos))
    }

    async listAll(bandId) {
        return Event.fromList(await this.http.get(`/bands/${bandId}/events`))
    }

    async getById(eventId) {
        return Event.from(await this.http.get(`/events/${eventId}`))
    }

    create(bandId, body) {
        return this.http.post(`/bands/${bandId}/events`, body)
    }

    update(eventId, body) {
        return this.http.put(`/events/${eventId}`, body)
    }

    delete(eventId) {
        return this.http.delete(`/events/${eventId}`)
    }

    listMusics(eventId) {
        return this.http.get(`/events/${eventId}/musics`)
    }

    addMusic(eventId, musicId) {
        return this.http.post(`/events/${eventId}/musics`, { musicId })
    }

    removeMusic(eventId, musicId) {
        return this.http.delete(`/events/${eventId}/musics`, { data: { musicId } })
    }

    listSuggestions(eventId) {
        return this.http.get(`/events/${eventId}/suggestions`)
    }

    /*
     * ♻️ REFACTORING — Change Function Declaration (createSuggestion → suggestMusic)
     * Benefícios:
     *   + Legibilidade (o nome descreve a ação do usuário: sugerir uma música)
     */
    suggestMusic(eventId, musicId) {
        return this.http.post(`/events/${eventId}/suggestions`, { musicId })
    }

    acceptSuggestion(suggestionId) {
        return this.http.put(`/suggestions/${suggestionId}/accept`)
    }

    deleteSuggestion(suggestionId) {
        return this.http.delete(`/suggestions/${suggestionId}`)
    }

    // ♻️ importHolyricsEvents foi movido para HolyricsService (ver Move Method lá).
}
