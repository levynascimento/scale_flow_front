// src_frontend/pages/events/EventFormModal.jsx

import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

function toInputValue(isoString) {
    if (!isoString) return ''
    return isoString.slice(0, 16) // "YYYY-MM-DDTHH:mm"
}

export default function EventFormModal({
                                           open,
                                           onClose,
                                           onSubmit,
                                           event,
                                           lineups = [] // ⭐ lista de formações da banda
                                       }) {
    const isEdit = !!event

    const [name, setName] = useState('')
    const [startingTime, setStartingTime] = useState('')
    const [endingTime, setEndingTime] = useState('')
    const [lineupId, setLineupId] = useState('') // ⭐ formação sugerida

    useEffect(() => {
        if (event) {
            setName(event.name || '')
            setStartingTime(toInputValue(event.startingTime))
            setEndingTime(toInputValue(event.endingTime))

            // tenta pegar o id da formação sugerida que já veio do back
            const initialLineupId =
                event.lineupId ??
                event.lineup?.id ??
                null

            setLineupId(initialLineupId ? String(initialLineupId) : '')
        } else {
            setName('')
            setStartingTime('')
            setEndingTime('')
            setLineupId('')
        }
    }, [event, open])

    if (!open) return null

    async function handleSubmit(e) {
        e.preventDefault()

        if (!name || !startingTime || !endingTime) {
            toast.error('Preencha todos os campos.')
            return
        }

        await onSubmit({
            name,
            startingTime,
            endingTime,
            // ⭐ envia a formação sugerida (ou null se nenhuma)
            lineupId: lineupId || null
        })
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className="
                    bg-[#1b1b1f] border border-[#2a2a30]
                    rounded-2xl p-6 w-[95%] max-w-lg
                    shadow-2xl transform transition-all duration-200
                    translate-y-0 scale-100
                "
            >
                <h2 className="text-xl font-semibold text-gray-100 mb-4">
                    {isEdit ? 'Editar evento' : 'Novo evento'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome do evento"
                        placeholder="Ex.: Culto de domingo"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Início"
                            type="datetime-local"
                            value={startingTime}
                            onChange={e => setStartingTime(e.target.value)}
                        />
                        <Input
                            label="Fim"
                            type="datetime-local"
                            value={endingTime}
                            onChange={e => setEndingTime(e.target.value)}
                        />
                    </div>

                    {/* ⭐ Formação sugerida (opcional) */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-200">
                            Formação sugerida (opcional)
                        </label>

                        <select
                            value={lineupId}
                            onChange={e => setLineupId(e.target.value)}
                            className="w-full bg-[#1b1b1f] border border-[#2a2a30] rounded-lg px-3 py-2 text-gray-200"
                        >
                            <option value="">Nenhuma formação</option>

                            {lineups.map(l => (
                                <option key={l.id} value={l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>

                        <p className="text-xs text-gray-500">
                            A formação serve apenas como sugestão para montar a escala do evento.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-[#2a2a30] text-gray-300 hover:bg-[#191920]"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            {isEdit ? 'Salvar alterações' : 'Criar evento'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
