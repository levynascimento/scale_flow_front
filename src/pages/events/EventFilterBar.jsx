export default function EventFilterBar({ current, onChange }) {
    const options = [
        { key: "now", label: "Agora" },
        { key: "future", label: "Futuros" },
        { key: "past", label: "Passados" },
        { key: "all", label: "Todos" }
    ]

    return (
        <div className="flex gap-3 bg-[#1b1b1f] border border-[#2a2a30] rounded-xl p-2 w-fit">
            {options.map(opt => (
                <button
                    key={opt.key}
                    onClick={() => onChange(opt.key)}
                    className={`
            px-4 py-2 rounded-lg text-sm transition
            ${
                        current === opt.key
                            ? "bg-[#7c5fff] text-white shadow-md"
                            : "text-gray-300 hover:bg-[#2a2a2f]"
                    }
          `}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}
