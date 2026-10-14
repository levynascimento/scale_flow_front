import { BaseService } from './BaseService.js'

/*
 * ♻️ REFACTORING — Extract Class (bandApi.js → BandService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade
 */
export class BandService extends BaseService {
    /*
     * ♻️ REFACTORING — Change Function Declaration (nomes sem redundância)
     * Antes: getBands(), getBandById(), createBand()... repetiam "Band" em
     * todos os nomes porque eram funções soltas.
     * Agora: o contexto é a classe — bandService.list(), bandService.getById().
     * Benefícios:
     *   + Legibilidade
     *   - Redundância nos nomes
     */
    list() {
        return this.http.get('/bands')
    }

    getById(id) {
        return this.http.get(`/bands/${id}`)
    }

    /*
     * ♻️ REFACTORING — Inline Method (getBandJoinCode)
     * Antes: getBandJoinCode(id) e getBandWithJoinCode(id) eram duas funções
     * com corpo IDÊNTICO (GET /bands/{id}/join-code). Só uma era usada.
     * Agora: a duplicada foi incorporada a esta e removida.
     * Benefícios:
     *   - Duplicação
     *   - Ambiguidade (qual das duas usar?)
     */
    getWithJoinCode(id) {
        return this.http.get(`/bands/${id}/join-code`)
    }

    create(body) {
        return this.http.post('/bands', body)
    }

    update(id, body) {
        return this.http.put(`/bands/${id}`, body)
    }

    delete(id) {
        return this.http.delete(`/bands/${id}`)
    }

    regenerateJoinCode(id) {
        return this.http.put(`/bands/${id}/join-code`)
    }

    join(joinCode) {
        return this.http.post(`/bands/join/${joinCode}`)
    }

    /*
     * ♻️ REFACTORING — Inline Class (integrantsApi.js → BandService.listMembers)
     * Antes: integrantsApi.js era um arquivo inteiro com UMA função,
     * getBandIntegrants(), que fazia exatamente o mesmo que getBandMembers()
     * de bandApi.js (GET /bands/{id}/integrants). A "classe" não tinha
     * responsabilidade própria.
     * Agora: o arquivo foi absorvido aqui e as duas funções viraram uma.
     * Benefícios:
     *   - Duplicação
     *   - Indireção desnecessária (um arquivo a menos para achar)
     *   + Coesão (integrantes são parte do recurso "banda")
     */
    listMembers(bandId) {
        return this.http.get(`/bands/${bandId}/integrants`)
    }
}
