import { DateFormatter } from '../core/format/DateFormatter.js'

/*
 * ♻️ REFACTORING — Extract Class (Event)
 * Antes: o evento era um objeto JSON "anêmico" e as regras sobre ele estavam
 * espalhadas pelos componentes:
 *   - EventCard: getEventState() (passado / agora / futuro)
 *   - Events: a mesma comparação de datas repetida dentro do sort
 *   - BandHome: `new Date(e.startingTime) > new Date()` 2x + busca da
 *     escalação do usuário 2x
 * Agora: o evento sabe responder sobre si mesmo.
 * Benefícios:
 *   + Coesão (dados e comportamento juntos)
 *   - Duplicação
 *   - Feature Envy nos componentes
 *   + Encapsulamento
 *   + Testabilidade (regras testáveis sem React)
 */
export class Event {
    static STATE = {
        PAST: 'past',
        NOW: 'now',
        FUTURE: 'future'
    }

    constructor(dto) {
        // Copia os dados do backend sem sobrescrever getters/métodos da classe
        // (ex.: se a API mandar um campo "state", o getter continua valendo).
        for (const [key, value] of Object.entries(dto ?? {})) {
            if (!(key in Event.prototype)) this[key] = value
        }
    }

    static from(dto) {
        return dto instanceof Event ? dto : new Event(dto)
    }

    static fromList(dtos = []) {
        return dtos.map(Event.from)
    }

    /*
     * ♻️ REFACTORING — Extract Variable → Move Field (startDate / endDate)
     * Antes: `new Date(event.startingTime)` era recriado em ~10 pontos.
     * Benefícios:
     *   + Legibilidade
     *   - Duplicação
     */
    get startDate() {
        return new Date(this.startingTime)
    }

    get endDate() {
        return new Date(this.endingTime)
    }

    hasEnded(now = new Date()) {
        return this.endDate < now
    }

    isHappening(now = new Date()) {
        return this.startDate <= now && this.endDate >= now
    }

    isUpcoming(now = new Date()) {
        return this.startDate > now
    }

    /*
     * ♻️ REFACTORING — Move Method (getEventState → Event.state)
     * Antes: função solta em EventCard.jsx que recebia o evento e só usava
     * dados dele (Feature Envy clássico).
     * Benefícios:
     *   + Coesão
     *   - Feature Envy
     *   + Reuso (o sort de Events.jsx agora usa a mesma regra)
     */
    get state() {
        if (this.hasEnded()) return Event.STATE.PAST
        if (this.isHappening()) return Event.STATE.NOW
        return Event.STATE.FUTURE
    }

    get formattedRange() {
        return DateFormatter.range(this.startingTime, this.endingTime)
    }

    /*
     * ♻️ REFACTORING — Extract Method + Move Method (escalationOf)
     * Antes: BandHome fazia 2x a mesma busca:
     *   e.escalations?.some(es => String(es.user?.id) === String(userId))
     *   e.escalations.find(es => String(es.user?.id) === String(userId))
     * Benefícios:
     *   - Duplicação
     *   + Coesão
     *   + Legibilidade
     */
    escalationOf(userId) {
        return (this.escalations ?? []).find(es => String(es.user?.id) === String(userId))
    }

    isUserEscalated(userId) {
        return Boolean(this.escalationOf(userId))
    }

    /*
     * Substitui o `{ ...ev, ...newData }` de Events.jsx: o spread criaria um
     * objeto comum e perderia os métodos da classe.
     */
    with(changes) {
        return new Event({ ...this, ...changes })
    }

    /*
     * ♻️ REFACTORING — Extract Method (nextUpcoming)
     * Antes: BandHome tinha um useMemo com filter + sort + [0] inline.
     * Benefícios:
     *   + Legibilidade (o nome diz o que o bloco faz)
     *   + Reuso
     */
    static nextUpcoming(events) {
        return events
            .filter(e => e.isUpcoming())
            .sort((a, b) => a.startDate - b.startDate)[0]
    }
}
