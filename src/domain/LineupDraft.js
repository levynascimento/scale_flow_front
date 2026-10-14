/*
 * ♻️ REFACTORING — Extract Class (LineupDraft)
 * Antes: LineupEditModal guardava DOIS estados paralelos (items e draftItems)
 * e, no salvar, calculava a diferença entre eles inline (filter + find
 * aninhados) antes de chamar a API.
 * Agora: o "rascunho de edição da formação" é um objeto imutável que sabe
 * adicionar, remover e dizer o que mudou.
 * Benefícios:
 *   + Coesão
 *   - Complexidade do componente
 *   + Testabilidade (o diff é testável sem React)
 *   + Encapsulamento (o estado original não é mais manipulado à mão)
 */
export class LineupDraft {
    constructor(original = [], current = original) {
        this.original = original
        this.current = current
    }

    static of(lineupRoles) {
        return new LineupDraft(lineupRoles ?? [])
    }

    get items() {
        return this.current
    }

    /*
     * Correção encontrada durante o refactoring: o código antigo fazia
     * `roles.find(r => r.id === newRole)`, comparando o id numérico do papel
     * com o value do <select>, que é sempre string. O papel nunca era
     * encontrado e o botão "+" não fazia nada. Agora a comparação é por String.
     */
    addRole(roleId, roles) {
        const role = roles.find(r => String(r.id) === String(roleId))
        if (!role) return this
        const item = { id: `temp-${Date.now()}`, role, isNew: true }
        return new LineupDraft(this.original, [...this.current, item])
    }

    removeItem(itemId) {
        return new LineupDraft(this.original, this.current.filter(i => i.id !== itemId))
    }

    /*
     * ♻️ REFACTORING — Extract Method (removedItems / addedItems)
     * Antes: `items.filter(old => !draftItems.find(d => d.id === old.id))`
     * estava solto dentro de handleSaveRoles.
     * Benefícios:
     *   + Legibilidade (o nome diz o que a expressão calcula)
     *   + Reuso
     */
    removedItems() {
        const currentIds = new Set(this.current.map(i => i.id))
        return this.original.filter(item => !currentIds.has(item.id))
    }

    addedItems() {
        return this.current.filter(item => item.isNew)
    }
}
