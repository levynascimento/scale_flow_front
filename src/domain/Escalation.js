/*
 * ♻️ REFACTORING — Extract Method + Move Method (Escalation.sortByRoleThenUser)
 * Antes: EventEscalationModal tinha um useMemo com 12 linhas de comparação
 * (papel, depois nome do integrante) escritas inline.
 * Agora: a regra de ordenação pertence ao domínio de escalações.
 * Benefícios:
 *   + Legibilidade (o componente lê "ordenar por papel e depois usuário")
 *   + Coesão
 *   + Testabilidade
 */
export class Escalation {
    static roleName(escalation) {
        return escalation?.role?.name || ''
    }

    static userName(escalation) {
        return escalation?.user?.name || ''
    }

    static sortByRoleThenUser(escalations) {
        const list = Array.isArray(escalations) ? [...escalations] : []
        return list.sort((a, b) =>
            Escalation.roleName(a).localeCompare(Escalation.roleName(b)) ||
            Escalation.userName(a).localeCompare(Escalation.userName(b))
        )
    }
}
