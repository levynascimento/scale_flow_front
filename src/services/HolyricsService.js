import { BaseService } from './BaseService.js'

/*
 * ♻️ REFACTORING — Extract Class (holyricsApi.js → HolyricsService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 */
export class HolyricsService extends BaseService {
    updateConfig(bandId, body) {
        return this.http.put(`/band/${bandId}/holyrics`, body)
    }

    disconnect(bandId) {
        return this.http.delete(`/band/${bandId}/holyrics`)
    }

    listMusics(bandId) {
        return this.http.post(`/band/${bandId}/musics/holyrics/list`)
    }

    importMusics(bandId) {
        return this.http.post(`/band/${bandId}/musics/holyrics/import`)
    }

    listEvents(bandId, body) {
        return this.http.post(`/band/${bandId}/events/holyrics/list`, body)
    }

    /*
     * ♻️ REFACTORING — Move Method (eventApi.importHolyricsEvents → HolyricsService.importEvents)
     * Antes: havia DUAS funções importHolyricsEvents, uma em eventApi.js (com
     * 4 parâmetros posicionais) e outra em holyricsApi.js (com body), para o
     * mesmo endpoint.
     * Agora: fica só aqui, na classe que trata da integração com o Holyrics.
     * Benefícios:
     *   + Coesão
     *   - Duplicação
     *   - Ambiguidade (qual das duas usar?)
     */
    importEvents(bandId, body) {
        return this.http.post(`/band/${bandId}/events/holyrics/import`, body)
    }
}
