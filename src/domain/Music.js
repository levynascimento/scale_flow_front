/*
 * ♻️ REFACTORING — Extract Class (Music)
 * Antes: regras sobre música estavam espalhadas:
 *   - SelectMusicModal: busca por título/artista inline no filter
 *   - Repertoires: `m.themes?.map(t => t.name).join(', ') || '—'` inline no JSX
 *   - RepertoireForm: split/trim/filter dos temas dentro do handleSubmit
 * Benefícios:
 *   + Coesão
 *   - Feature Envy
 *   + Reuso
 *   + Testabilidade
 */
export class Music {
    /*
     * ♻️ REFACTORING — Move Method (filtro de busca → Music.matches)
     * Benefícios:
     *   + Coesão
     *   + Reuso (qualquer tela de busca de música usa a mesma regra)
     */
    static matches(music, term) {
        return `${music.title} ${music.artist}`.toLowerCase().includes(term.toLowerCase())
    }

    /*
     * ♻️ REFACTORING — Extract Method (themesLabel)
     * Benefícios:
     *   + Legibilidade do JSX
     *   + Reuso
     */
    static themesLabel(music) {
        return music.themes?.map(t => t.name).join(', ') || '—'
    }

    /*
     * ♻️ REFACTORING — Extract Method (parseThemes)
     * Antes: `form.themes.split(',').map(t => t.trim()).filter(Boolean)`
     * dentro do handleSubmit de RepertoireForm.
     * Benefícios:
     *   + Legibilidade
     *   + Testabilidade
     */
    static parseThemes(text) {
        return text.split(',').map(t => t.trim()).filter(Boolean)
    }
}
