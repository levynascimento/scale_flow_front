/*
 * ♻️ REFACTORING — Extract Class (Paginator)
 * Antes: Roles.jsx tinha 4 variáveis soltas no corpo do componente
 * (totalPages, currentPage, startIndex, paginated) + duas expressões de
 * Math.max/Math.min nos botões.
 * Agora: a paginação é um objeto que pode ser usado em qualquer listagem.
 * Benefícios:
 *   + Coesão
 *   + Reuso
 *   + Testabilidade
 *   - Tamanho do componente
 */
export class Paginator {
    constructor(items, pageSize, requestedPage) {
        this.items = items
        this.pageSize = pageSize
        this.totalPages = Math.max(1, Math.ceil(items.length / pageSize))
        this.currentPage = Math.min(Math.max(1, requestedPage), this.totalPages)
    }

    get pageItems() {
        const start = (this.currentPage - 1) * this.pageSize
        return this.items.slice(start, start + this.pageSize)
    }

    get hasPrevious() {
        return this.currentPage > 1
    }

    get hasNext() {
        return this.currentPage < this.totalPages
    }

    get needsPagination() {
        return this.items.length > this.pageSize
    }

    previousPage() {
        return Math.max(1, this.currentPage - 1)
    }

    nextPage() {
        return Math.min(this.totalPages, this.currentPage + 1)
    }
}
