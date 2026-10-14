/*
 * ♻️ REFACTORING — Extract Variable (INPUT_BASE_CLASS)
 * Antes: uma string de classes de 150 caracteres concatenada com `+` no
 * meio do JSX.
 * Benefícios:
 *   + Legibilidade
 *   + Reuso (outros campos podem usar o mesmo visual)
 */
const INPUT_BASE_CLASS =
  'w-full rounded-xl border border-sf-border bg-sf-card px-4 py-3 text-sf-foreground outline-none focus:ring-2 focus:ring-sf-primary/60'

export default function Input({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col text-left">
      {label && <label className="text-sm text-sf-muted mb-2">{label}</label>}
      <input className={`${INPUT_BASE_CLASS} ${className}`} {...props} />
    </div>
  )
}
