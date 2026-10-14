/*
 * ♻️ REFACTORING — Extract Method (componente FieldError)
 * Antes: o trecho abaixo era repetido 4 vezes (Login: e-mail e senha;
 * RepertoireForm: título e artista):
 *   {errors.x && <p className="text-red-400 text-sm mt-1">{errors.x}</p>}
 * E o bloco de "erro geral" (caixa vermelha) era repetido em Login,
 * Register e RepertoireForm.
 * Benefícios:
 *   - Duplicação
 *   + Consistência visual
 *   + Coesão
 */
export default function FieldError({ message }) {
    if (!message) return null
    return <p className="text-red-400 text-sm mt-1">{message}</p>
}

export function FormError({ message }) {
    if (!message) return null
    return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {message}
        </div>
    )
}
