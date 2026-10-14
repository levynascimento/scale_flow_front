/*
 * ♻️ REFACTORING — Extract Class (DateFormatter)
 * Antes: formatação de data aparecia de 4 jeitos diferentes:
 *   - EventCard: função solta formatDateTime()
 *   - EventFormModal: função solta toInputValue()
 *   - EventViewModal e BandHome: `new Date(x).toLocaleString("pt-BR")` inline
 * Agora: uma classe concentra a política de formatação do app.
 * Benefícios:
 *   + Coesão
 *   - Duplicação
 *   + Consistência (troca de locale em um único lugar)
 *   + Reuso
 */
export class DateFormatter {
    static LOCALE = 'pt-BR'

    static full(value) {
        return new Date(value).toLocaleString(DateFormatter.LOCALE)
    }

    /*
     * ♻️ REFACTORING — Move Method (formatDateTime → DateFormatter.short)
     * Saiu de EventCard.jsx, onde só podia ser usada por aquele arquivo.
     * Benefícios:
     *   + Reuso
     *   + Coesão
     */
    static short(value) {
        if (!value) return '-'
        return new Date(value).toLocaleString(DateFormatter.LOCALE, {
            dateStyle: 'short',
            timeStyle: 'short'
        })
    }

    /*
     * ♻️ REFACTORING — Move Method + Change Function Declaration (toInputValue → toDateTimeInput)
     * Saiu de EventFormModal.jsx. O nome novo diz para qual input serve.
     * Benefícios:
     *   + Legibilidade
     *   + Reuso
     */
    static toDateTimeInput(isoString) {
        if (!isoString) return ''
        return isoString.slice(0, 16) // "YYYY-MM-DDTHH:mm"
    }

    static range(start, end, formatter = DateFormatter.full) {
        return `${formatter(start)} → ${formatter(end)}`
    }
}
