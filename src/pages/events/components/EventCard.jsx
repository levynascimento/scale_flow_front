function getEventState(event) {
    const now = new Date()
    const start = new Date(event.startingTime)
    const end = new Date(event.endingTime)

    if (end < now) return "past"
    if (start <= now && end >= now) return "now"
    return "future"
}

function getCardColor(state) {
    if (state === "past") return "bg-[#2e1b1b] border-[#472525]"
    if (state === "now") return "bg-[#1b2e1b] border-[#254725]"
    return "bg-[#1b1b2e] border-[#252547]" // futuro
}

function getBadge(state) {
    if (state === "past")
        return (
            <span className="px-2 py-1 text-xs rounded-full bg-red-800/40 text-red-300 border border-red-700/40">
        🔴 Passado
      </span>
        )

    if (state === "now")
        return (
            <span className="px-2 py-1 text-xs rounded-full bg-green-800/40 text-green-300 border border-green-700/40">
        🟢 Agora
      </span>
        )

    return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-800/40 text-blue-300 border border-blue-700/40">
      🔵 Futuro
    </span>
    )
}

function formatDateTime(value) {
    if (!value) return '-'
    const date = new Date(value)
    return date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
}

export default function EventCard({ event, onClick }) {
    const state = getEventState(event)
    const colorClass = getCardColor(state)

    const {
        name,
        startingTime,
        endingTime,
        escalationsCount,
        suggestionsCount,
        chosenMusicsCount
    } = event

    return (
        <button
            onClick={onClick}
            className={`
        w-full text-left rounded-2xl p-4 border
        hover:-translate-y-1 transition-all duration-200
        hover:shadow-lg hover:border-[#7c5fff]
        ${colorClass}
      `}
        >
            {/* Cabeçalho com nome e badge */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                    {name}
                </h3>

                {/* Badge */}
                {getBadge(state)}
            </div>

            {/* Datas */}
            <p className="text-xs text-gray-200 mb-2">
                {formatDateTime(startingTime)} → {formatDateTime(endingTime)}
            </p>

            {/* Informações extras */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-200 mt-3">
        <span className="px-2 py-1 rounded-full bg-black/20 border border-black/30">
          Escalações: {escalationsCount ?? 0}
        </span>
                <span className="px-2 py-1 rounded-full bg-black/20 border border-black/30">
          Sugestões: {suggestionsCount ?? 0}
        </span>
                <span className="px-2 py-1 rounded-full bg-black/20 border border-black/30">
          Músicas: {chosenMusicsCount ?? 0}
        </span>
            </div>
        </button>
    )
}
