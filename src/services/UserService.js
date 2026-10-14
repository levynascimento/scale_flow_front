import { BaseService } from './BaseService.js'

/*
 * ♻️ REFACTORING — Extract Class (userApi.js → UserService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade
 */
export class UserService extends BaseService {
    static SKILLS_PATH = '/users/habilities'

    getCurrent() {
        return this.http.get('/users')
    }

    update(body) {
        return this.http.put('/users', body)
    }

    updatePassword(password) {
        return this.http.put('/users/password', { password })
    }

    delete() {
        return this.http.delete('/users')
    }

    /*
     * ♻️ REFACTORING — Change Function Declaration (Hability → Skill)
     * Antes: getUserHabilities, addUserHability... "Hability" não existe em
     * inglês (o correto é "ability" ou "skill").
     * Agora: os nomes no frontend usam "skill". A URL do backend
     * (/users/habilities) continua igual, isolada numa constante.
     * Benefícios:
     *   + Legibilidade
     *   + Expressividade do domínio
     *   - Acoplamento com o nome usado no backend
     */
    listSkills() {
        return this.http.get(UserService.SKILLS_PATH)
    }

    addSkill(roleName, level) {
        return this.http.post(UserService.SKILLS_PATH, { roleName, level })
    }

    updateSkill(roleName, level) {
        return this.http.put(UserService.SKILLS_PATH, { roleName, level })
    }

    // Remove só a relação do usuário com o papel (não apaga o papel global).
    removeSkill(roleName) {
        return this.http.delete(UserService.SKILLS_PATH, { data: { roleName } })
    }
}
