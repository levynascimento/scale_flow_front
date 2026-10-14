/*
 * ♻️ REFACTORING — Extract Class (SkillLevel)
 * Antes: a regra "nível entre 0 e 10" estava escrita 3 vezes em
 * UserSettings (adicionar, digitar e sair do campo) e NÃO era validada no
 * MusicDifficultyModal (dava para salvar 99 ou texto vazio virando 0).
 * Agora: um objeto de valor concentra a regra.
 * Benefícios:
 *   + Coesão
 *   - Duplicação
 *   + Consistência (as duas telas aplicam a mesma regra)
 *   - Magic numbers (0 e 10 viraram constantes com nome)
 */
export class SkillLevel {
    static MIN = 0
    static MAX = 10
    static TYPING_PATTERN = /^\d{1,2}$/

    static isInRange(value) {
        return value >= SkillLevel.MIN && value <= SkillLevel.MAX
    }

    // Aceita o que o usuário pode estar no meio de digitar ("" ou até 2 dígitos)
    static isTypingAllowed(raw) {
        return raw === '' || SkillLevel.TYPING_PATTERN.test(raw)
    }

    /*
     * Devolve o número validado ou null. Substitui o trio repetido:
     *   if (raw === "") ...; const n = Number(raw); if (n < 0 || n > 10) ...
     */
    static parse(raw) {
        if (raw === '' || raw === null || raw === undefined) return null
        const value = Number(raw)
        return Number.isInteger(value) && SkillLevel.isInRange(value) ? value : null
    }

    static get rangeLabel() {
        return `${SkillLevel.MIN} a ${SkillLevel.MAX}`
    }
}
