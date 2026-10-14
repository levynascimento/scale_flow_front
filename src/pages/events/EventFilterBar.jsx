import { EventFilter } from "../../domain/EventFilter.js"

/*
 * ♻️ REFACTORING — Move Field (options → EventFilter.values())
 * Antes: o array de opções { key, label } era declarado aqui dentro, a cada
 * render, enquanto Events.jsx tinha OUTRA lista implícita das mesmas chaves
 * nos seus if/else. Se alguém adicionasse um filtro aqui, esqueceria lá.
 * Agora: a lista mora na classe EventFilter, que é a dona do conceito.
 * Benefícios:
 *   + Coesão
 *   - Duplicação
 *   + Consistência (uma fonte de verdade para os filtros)
 */
export default function EventFilterBar({ current, onChange }) {
    return (
        <div className="flex gap-3 bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-2 w-fit">
            {EventFilter.values().map(filter => (
                <button
                    key={filter.key}
                    onClick={() => onChange(filter)}
                    className={`
                        px-4 py-2 rounded-lg text-sm transition
                        ${current === filter
                            ? "bg-[#7c5fff] text-white shadow-md"
                            : "text-gray-300 hover:bg-[#2a2a2f]"}
                    `}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
