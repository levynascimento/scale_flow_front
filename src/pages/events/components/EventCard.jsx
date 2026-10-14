import { DateFormatter } from '../../../core/format/DateFormatter.js'
import { EventStatePresenter } from '../../../domain/EventStatePresenter.js'

/*
 * ♻️ REFACTORING — Move Method (getEventState → Event.state)
 * ♻️ REFACTORING — Extract Class (getCardColor + getBadge → EventStatePresenter)
 * ♻️ REFACTORING — Move Method (formatDateTime → DateFormatter.short)
 * Antes: este arquivo tinha 4 funções soltas antes do componente. Três delas
 * faziam o mesmo if/else sobre o estado do evento ("past" / "now" / futuro).
 * Benefícios:
 *   - Duplicação (3 if/else iguais → 1 tabela)
 *   + Coesão (estado no modelo, aparência no presenter, data no formatter)
 *   + Reuso
 *   - Tamanho do arquivo (de 100 para ~50 linhas)
 */

/*
 * ♻️ REFACTORING — Extract Method (CounterBadge)
 * Antes: 3 <span> idênticos para Escalações / Sugestões / Músicas.
 * Benefícios: - Duplicação  + Consistência
 */
function CounterBadge({ label, value }) {
    return (
        <span className="px-2 py-1 rounded-full bg-black/20 border border-black/30">
            {label}: {value ?? 0}
        </span>
    )
}

export default function EventCard({ event, onClick }) {
    const style = EventStatePresenter.for(event)

    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left rounded-2xl p-4 border
                hover:-translate-y-1 transition-all duration-200
                hover:shadow-lg hover:border-[#7c5fff]
                ${style.cardClass}
            `}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full border ${style.badgeClass}`}>
                    {style.badgeLabel}
                </span>
            </div>

            <p className="text-xs text-gray-200 mb-2">
                {DateFormatter.range(event.startingTime, event.endingTime, DateFormatter.short)}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-gray-200 mt-3">
                <CounterBadge label="Escalações" value={event.escalationsCount} />
                <CounterBadge label="Sugestões" value={event.suggestionsCount} />
                <CounterBadge label="Músicas" value={event.chosenMusicsCount} />
            </div>
        </button>
    )
}
