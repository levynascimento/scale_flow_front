import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/Button.jsx'
import FieldError, { FormError } from '../../components/FieldError.jsx'
import { musicService } from '../../services/index.js'
import { Music } from '../../domain/Music.js'
import { ValidationHandler } from '../../core/validation/ValidationHandler.js'
import { ArtistValidator, TitleValidator } from '../../core/validation/validators.js'

/*
 * ♻️ REFACTORING — Extract Method (inputClass)
 * Antes: título e artista repetiam uma template string com DOIS ternários
 * (borda e anel de foco) que dependiam do mesmo erro.
 * Benefícios: - Duplicação  + Legibilidade  + Consistência
 */
function inputClass(hasError) {
    const color = hasError ? 'border-red-500 focus:ring-red-500' : 'border-[#3a3a3f] focus:ring-[#7c5fff]'
    return `w-full bg-[#2a2a2f] border ${color} text-gray-100 placeholder-gray-500 rounded-lg p-2 focus:outline-none focus:ring-2`
}

export default function RepertoireForm() {
    const { id: bandId } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ title: '', artist: '', themes: '' })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const backToList = () => navigate(`/bands/${bandId}/repertoires`)

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        /*
         * ♻️ REFACTORING — Extract Method (ValidationHandler.chain) + Move Field (error.field)
         * Antes: montava a cadeia à mão e descobria o campo do erro procurando
         * "título" ou "artista" dentro da mensagem.
         * Benefícios:
         *   - Complexidade (if/else if/else sumiu)
         *   + Robustez (mudar o texto não quebra a tela)
         *   - Duplicação (mesmo mecanismo do Login)
         */
        const error = ValidationHandler.chain(new TitleValidator(), new ArtistValidator()).handle(form)
        if (error) {
            setErrors(error.toFieldErrors())
            return
        }

        setLoading(true)
        try {
            await musicService.create(bandId, {
                title: form.title,
                artist: form.artist,
                // ♻️ Extract Method + Move Method → Music.parseThemes (+ Legibilidade, + Testabilidade)
                themes: Music.parseThemes(form.themes),
            })
            toast.success('🎵 Música cadastrada com sucesso!')
            backToList()
        } catch (err) {
            console.error('Erro ao cadastrar música:', err)
            toast.error('❌ Erro ao cadastrar música. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f0f10] text-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-[#1e1e22] border border-[#2a2a30] rounded-xl p-6 shadow-lg">
                <h1 className="text-2xl font-bold text-gray-100 mb-6">Nova Música</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Título</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Ex: Graça Infinita"
                            className={inputClass(errors.title)}
                        />
                        <FieldError message={errors.title} />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Artista</label>
                        <input
                            name="artist"
                            value={form.artist}
                            onChange={handleChange}
                            placeholder="Ex: Chris Tomlin"
                            className={inputClass(errors.artist)}
                        />
                        <FieldError message={errors.artist} />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Temas (separados por vírgula)</label>
                        <input
                            name="themes"
                            value={form.themes}
                            onChange={handleChange}
                            placeholder="Ex: Adoração, Louvor, Gratidão"
                            className={inputClass(false)}
                        />
                    </div>

                    <FormError message={errors.general} />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-gray-500 text-gray-300 hover:bg-[#2a2a2f]"
                            onClick={backToList}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-[#7c5fff] hover:bg-[#6b4ef9] text-white" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
