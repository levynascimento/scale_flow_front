/*
 * ♻️ REFACTORING — Extract Method (errorMessageFrom)
 * Antes: `err?.response?.data?.message || 'texto padrão'` era repetido em
 * Login e Register.
 * Benefícios:
 *   - Duplicação
 *   + Legibilidade
 *   + Coesão (saber onde o backend põe a mensagem de erro é assunto da camada HTTP)
 */
export function errorMessageFrom(err, fallback) {
    return err?.response?.data?.message || fallback
}
