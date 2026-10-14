import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import { DateFormatter } from '../../core/format/DateFormatter.js'

const EMPTY_FORM = { name: '', startingTime: '', endingTime: '', lineupId: '' }

/*
 * ♻️ REFACTORING — Extract Method (formFromEvent)
 * Antes: o useEffect tinha dois blocos de 4 setState cada (um para editar,
 * outro para criar), além da conversão de datas e da busca do id da formação.
 * Agora: uma função pura transforma o evento no estado do formulário.
 * Benefícios:
 *   + Legibilidade
 *   + Testabilidade
 *   - Duplicação
 */
function formFromEvent(event) {
    if (!event) return EMPTY_FORM

    // o back pode mandar lineupId ou o objeto lineup
    const lineupId = event.lineupId ?? event.lineup?.id ?? null

    return {
        name: event.name || '',
        startingTime: DateFormatter.toDateTimeInput(event.startingTime),
        endingTime: DateFormatter.toDateTimeInput(event.endingTime),
        lineupId: lineupId ? String(lineupId) : ''
    }
}

export default function EventFormModal({ open, onClose, onSubmit, event, lineups = [] }) {
    const isEdit = !!event

    /*
     * ♻️ REFACTORING complementar (fora da lista da disciplina): agrupar um
     * "Data Clump" num objeto, parente do Introduce Parameter Object.
     * Antes: name, startingTime, endingTime e lineupId eram 4 useState que
     * sempre mudavam juntos.
     * Agora: um objeto `form` agrupa os campos que pertencem ao mesmo conceito.
     * Benefícios:
     *   + Coesão
     *   - Número de variáveis de estado
     *   + Legibilidade
     */
    const [form, setForm] = useState(EMPTY_FORM)

    useEffect(() => {
        setForm(formFromEvent(event))
    }, [event, open])

    if (!open) return null

    function setField(field) {
        return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!form.name || !form.startingTime || !form.endingTime) {
            toast.error('Preencha todos os campos.')
            return
        }

        await onSubmit({ ...form, lineupId: form.lineupId || null })
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1b1b1f] border border-[#2a2a30] rounded-2xl p-6 w-[95%] max-w-lg shadow-2xl transform transition-all duration-200 translate-y-0 scale-100">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">
                    {isEdit ? 'Editar evento' : 'Novo evento'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome do evento"
                        placeholder="Ex.: Culto de domingo"
                        value={form.name}
                        onChange={setField('name')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Início" type="datetime-local" value={form.startingTime} onChange={setField('startingTime')} />
                        <Input label="Fim" type="datetime-local" value={form.endingTime} onChange={setField('endingTime')} />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-200">
                            Formação sugerida (opcional)
                        </label>

                        <select
                            value={form.lineupId}
                            onChange={setField('lineupId')}
                            className="w-full bg-[#1b1b1f] border border-[#2a2a30] rounded-lg px-3 py-2 text-gray-200"
                        >
                            <option value="">Nenhuma formação</option>
                            {lineups.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
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
