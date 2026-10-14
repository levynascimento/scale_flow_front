import { BaseService } from './BaseService.js'
import { Lineup } from '../domain/Lineup.js'

/*
 * ♻️ REFACTORING — Extract Class (lineupApi.js → LineupService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade
 */
export class LineupService extends BaseService {
    async listByBand(bandId) {
        const dtos = await this.http.get(`/bands/${bandId}/lineups`)
        return dtos.map(dto => new Lineup(dto))
    }

    async getById(lineupId) {
        return Lineup.from(await this.http.get(`/lineups/${lineupId}`))
    }

    create(bandId, payload) {
        return this.http.post(`/bands/${bandId}/lineups`, payload)
    }

    /*
     * ♻️ REFACTORING — Change Function Declaration (updateLineupName)
     * Antes: updateLineupName(lineupId, { name }) — a função se chamava
     * "atualizar NOME", mas recebia um objeto genérico, e quem chamava tinha
     * que saber o formato do payload.
     * Agora: rename(lineupId, name) recebe o que o nome promete.
     * Benefícios:
     *   + Legibilidade
     *   - Acoplamento (quem chama não conhece o formato do body)
     */
    rename(lineupId, name) {
        return this.http.put(`/lineups/${lineupId}`, { name })
    }

    addRole(lineupId, roleId) {
        return this.http.post(`/lineups/${lineupId}/roles`, { roleId })
    }

    updateRole(lineupRoleId, payload) {
        return this.http.put(`/lineups-roles/${lineupRoleId}`, payload)
    }

    removeRole(lineupRoleId) {
        return this.http.delete(`/lineups-roles/${lineupRoleId}`)
    }

    delete(lineupId) {
        return this.http.delete(`/lineups/${lineupId}`)
    }

    /*
     * ♻️ REFACTORING — Move Method (aplicar diff da edição → LineupService.applyDraft)
     * Antes: LineupEditModal tinha dois laços `for ... await` chamando a API
     * para remover e adicionar papéis.
     * Agora: o serviço aplica um LineupDraft.
     * Benefícios:
     *   + Coesão (orquestração de chamadas fica na camada de serviço)
     *   - Responsabilidades do componente
     */
    async applyDraft(lineupId, draft) {
        for (const item of draft.removedItems()) {
            await this.removeRole(item.id)
        }
        for (const item of draft.addedItems()) {
            await this.addRole(lineupId, item.role.id)
        }
    }
}
