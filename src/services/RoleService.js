import { BaseService } from './BaseService.js'

/*
 * ♻️ REFACTORING — Extract Class (rolesApi.js → RoleService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade
 */
export class RoleService extends BaseService {
    list() {
        return this.http.get('/roles')
    }

    /*
     * ♻️ REFACTORING — Move Method (ordenação por nome → RoleService.listSortedByName)
     * Antes: Roles.jsx buscava os papéis e ordenava dentro do componente.
     * Benefícios:
     *   + Reuso
     *   + Coesão
     */
    async listSortedByName() {
        const roles = await this.list()
        return (roles || []).sort((a, b) => a.name.localeCompare(b.name))
    }

    getById(id) {
        return this.http.get(`/roles/${id}`)
    }

    create(payload) {
        return this.http.post('/roles', payload)
    }

    update(id, payload) {
        return this.http.put(`/roles/${id}`, payload)
    }

    delete(id) {
        return this.http.delete(`/roles/${id}`)
    }

    createMany(names) {
        return this.http.post('/roles/multiple', names)
    }

    /*
     * ♻️ REFACTORING — Extract Method (findBySlug / nameBySlug)
     * Antes: `roles.find(r => r.slug === roleSlug)` repetido 3x em UserSettings.
     * Benefícios:
     *   - Duplicação
     *   + Legibilidade
     */
    static findBySlug(roles, slug) {
        return roles.find(r => r.slug === slug)
    }

    static findById(roles, id) {
        return roles.find(r => String(r.id) === String(id))
    }
}
