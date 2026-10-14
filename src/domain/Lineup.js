/*
 * ♻️ REFACTORING — Extract Class (Lineup)
 * Antes: a formação era só JSON, e EventEscalationModal tinha uma função de
 * 50 linhas (applyFormationAsSuggestions) que navegava por dentro dela
 * (suggestedLineup.roles[i].role.id ...) para montar as sugestões.
 * Agora: a própria formação sabe gerar as escalações pendentes.
 * Benefícios:
 *   + Coesão
 *   - Feature Envy (o componente "invejava" os dados da formação)
 *   + Testabilidade
 *   - Tamanho do componente
 */
export class Lineup {
    constructor(dto) {
        for (const [key, value] of Object.entries(dto ?? {})) {
            if (!(key in Lineup.prototype)) this[key] = value
        }
        this.roles = Array.isArray(dto?.roles) ? dto.roles : []
    }

    static from(dto) {
        return dto ? new Lineup(dto) : null
    }

    get roleCount() {
        return this.roles.length
    }

    /*
     * ♻️ REFACTORING — Move Method (applyFormationAsSuggestions → Lineup.toPendingEscalations)
     * A parte "pura" (calcular o que sugerir) veio para cá. O componente ficou
     * só com a parte de UI (toast + setState).
     * Benefícios:
     *   + Coesão
     *   - Acoplamento entre regra de negócio e React
     *   + Testabilidade
     */
    toPendingEscalations(existingEscalations = [], alreadyPending = []) {
        const escalatedRoleIds = new Set(
            existingEscalations.map(e => e?.role?.id).filter(Boolean).map(String)
        )
        const pendingKeys = new Set(alreadyPending.map(p => p._key))

        return this.roles
            .map((lineupRole, index) => Lineup.toPending(lineupRole?.role, index))
            .filter(Boolean)
            .filter(item => !escalatedRoleIds.has(item.roleId))
            .filter(item => !pendingKeys.has(item._key))
    }

    /*
     * ♻️ REFACTORING — Extract Method (toPending)
     * Antes: era a lambda anônima dentro do .map() de applyFormationAsSuggestions.
     * Benefícios:
     *   + Legibilidade
     */
    static toPending(role, index) {
        if (!role?.id) return null
        const roleId = String(role.id)
        return {
            roleId,
            roleName: role.name,
            userId: '',
            // chave única por item (uma formação pode ter 2 guitarras)
            _key: `${roleId}|${index}`
        }
    }
}
