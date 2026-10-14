// Storage falso em memória: possível porque as sessões recebem o storage
// pelo construtor (♻️ Move Field → injeção de dependência).
export class MemoryStorage {
    constructor() { this.data = new Map() }
    getItem(key) { return this.data.has(key) ? this.data.get(key) : null }
    setItem(key, value) { this.data.set(key, String(value)) }
    removeItem(key) { this.data.delete(key) }
}
