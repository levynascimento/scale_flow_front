import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createMusic } from '../../services/musicApi.js'
import Button from '../../components/Button.jsx'
import toast from 'react-hot-toast'
import { ArtistValidator, TitleValidator } from '../../utils/musicValidationChain.js'

export default function RepertoireForm() {
    const { id: bandId } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ title: '', artist: '', themes: '' })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    function handleChange(e) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: '' })) // limpa o erro ao digitar
    }

    async function handleSubmit(e) {
        e.preventDefault()

        // 🧠 Cria e encadeia os validadores
        const titleValidator = new TitleValidator()
        const artistValidator = new ArtistValidator()
        titleValidator.setNext(artistValidator)

        // 🧩 Executa a cadeia
        const error = titleValidator.handle(form)

        if (error) {
            // Erro inline
            const newErrors = {}
            if (error.toLowerCase().includes('título')) newErrors.title = error
            else if (error.toLowerCase().includes('artista')) newErrors.artist = error
            else newErrors.general = error

            setErrors(newErrors)
            return
        }

        setLoading(true)
        try {
            const themesArray = form.themes
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)

            await createMusic(bandId, {
                title: form.title,
                artist: form.artist,
                themes: themesArray,
            })

            toast.success('🎵 Música cadastrada com sucesso!')
            navigate(`/bands/${bandId}/repertoires`)
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
                    {/* --- TÍTULO --- */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Título</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Ex: Graça Infinita"
                            className={`w-full bg-[#2a2a2f] border ${
                                errors.title ? 'border-red-500' : 'border-[#3a3a3f]'
                            } text-gray-100 placeholder-gray-500 rounded-lg p-2 focus:outline-none focus:ring-2 ${
                                errors.title ? 'focus:ring-red-500' : 'focus:ring-[#7c5fff]'
                            }`}
                        />
                        {errors.title && (
                            <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* --- ARTISTA --- */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Artista</label>
                        <input
                            name="artist"
                            value={form.artist}
                            onChange={handleChange}
                            placeholder="Ex: Chris Tomlin"
                            className={`w-full bg-[#2a2a2f] border ${
                                errors.artist ? 'border-red-500' : 'border-[#3a3a3f]'
                            } text-gray-100 placeholder-gray-500 rounded-lg p-2 focus:outline-none focus:ring-2 ${
                                errors.artist ? 'focus:ring-red-500' : 'focus:ring-[#7c5fff]'
                            }`}
                        />
                        {errors.artist && (
                            <p className="text-red-400 text-sm mt-1">{errors.artist}</p>
                        )}
                    </div>

                    {/* --- TEMAS --- */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Temas (separados por vírgula)
                        </label>
                        <input
                            name="themes"
                            value={form.themes}
                            onChange={handleChange}
                            placeholder="Ex: Adoração, Louvor, Gratidão"
                            className="w-full bg-[#2a2a2f] border border-[#3a3a3f] text-gray-100 placeholder-gray-500 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#7c5fff]"
                        />
                    </div>

                    {/* --- ERRO GERAL INLINE --- */}
                    {errors.general && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {errors.general}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-gray-500 text-gray-300 hover:bg-[#2a2a2f]"
                            onClick={() => navigate(`/bands/${bandId}/repertoires`)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#7c5fff] hover:bg-[#6b4ef9] text-white"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
