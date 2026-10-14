/*
 * ♻️ REFACTORING — Extract Class (EventFilter)
 * Antes: o filtro era uma string ("now", "future", "past", "all") e cada
 * arquivo tinha seu próprio if/else para ela:
 *   - EventFilterBar: array local com os rótulos
 *   - Events.loadEvents(): um if/else para escolher o endpoint
 *     e OUTRO if/else (de 3 ramos, 20 linhas) para escolher a ordenação
 * Agora: cada filtro é um objeto que conhece rótulo, endpoint e ordenação.
 * Benefícios:
 *   + Coesão
 *   - Duplicação
 *   - Complexidade ciclomática (loadEvents caiu de ~10 caminhos para 1)
 *   + Extensibilidade (novo filtro = nova instância)
 */
export class EventFilter {
    constructor(key, label, pathSuffix, compare) {
        this.key = key
        this.label = label
        this.pathSuffix = pathSuffix
        this.compare = compare
    }

    sort(events) {
        return [...events].sort(this.compare)
    }

    /*
     * ♻️ REFACTORING — Extract Method (byStartAsc / byStartDesc / byRelevance)
     * Antes: as funções de comparação eram lambdas anônimas dentro de
     * loadEvents, e a de "todos" tinha 20 linhas sem nome.
     * Benefícios:
     *   + Legibilidade (cada critério tem nome)
     *   + Reuso
     */
    static byStartAsc(a, b) {
        return a.startDate - b.startDate
    }

    static byStartDesc(a, b) {
        return b.startDate - a.startDate
    }

    // Acontecendo agora primeiro; depois os que não terminaram (mais
    // próximos primeiro); por fim os encerrados (mais recentes primeiro).
    static byRelevance(a, b) {
        const now = new Date()

        if (a.isHappening(now) !== b.isHappening(now)) return a.isHappening(now) ? -1 : 1
        if (a.hasEnded(now) !== b.hasEnded(now)) return a.hasEnded(now) ? 1 : -1
        if (!a.hasEnded(now)) return EventFilter.byStartAsc(a, b)
        return EventFilter.byStartDesc(a, b)
    }

    static NOW = new EventFilter('now', 'Agora', '/now', EventFilter.byStartAsc)
    static FUTURE = new EventFilter('future', 'Futuros', '/future', EventFilter.byStartAsc)
    static PAST = new EventFilter('past', 'Passados', '/past', EventFilter.byStartDesc)
    static ALL = new EventFilter('all', 'Todos', '', EventFilter.byRelevance)

    static values() {
        return [EventFilter.NOW, EventFilter.FUTURE, EventFilter.PAST, EventFilter.ALL]
    }
}
