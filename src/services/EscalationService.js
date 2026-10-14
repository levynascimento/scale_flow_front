import { BaseService } from './BaseService.js'

/*
 * ♻️ REFACTORING — Extract Class (escalationApi.js → EscalationService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade
 */
export class EscalationService extends BaseService {
    listByEvent(eventId) {
        return this.http.get(`/events/${eventId}/escalations`)
    }

    create(eventId, payload) {
        return this.http.post(`/events/${eventId}/escalations`, payload)
    }

    delete(escalationId) {
        return this.http.delete(`/escalations/${escalationId}`)
    }

    /*
     * ♻️ REFACTORING — Extract Method (roleQuery)
     * Antes: o objeto `{ params: { roleSlug: roleId, bandId } }` era repetido
     * nas 3 funções de sugestão.
     * Benefícios:
     *   - Duplicação
     *   + Consistência
     */
    roleQuery(roleSlug, bandId) {
        return { params: { roleSlug, bandId } }
    }

    /*
     * ♻️ REFACTORING — Rename Variable + Change Function Declaration
     * Antes: getPriorityList(roleId, bandId) — o parâmetro se chamava
     * "roleId", mas o que era enviado (e o que o backend espera) é o SLUG do
     * papel. Quem lia achava que devia passar o id.
     * Agora: o parâmetro se chama roleSlug.
     * Benefícios:
     *   + Legibilidade
     *   - Bugs por uso incorreto da função
     */
    getPriorityList(roleSlug, bandId) {
        return this.http.get('/escalations/priority-list', this.roleQuery(roleSlug, bandId))
    }

    getLast(roleSlug, bandId) {
        return this.http.get('/escalations/last-escalation', this.roleQuery(roleSlug, bandId))
    }

    getLastTwoMonths(roleSlug, bandId) {
        return this.http.get('/escalations/last-2-months', this.roleQuery(roleSlug, bandId))
    }
}
