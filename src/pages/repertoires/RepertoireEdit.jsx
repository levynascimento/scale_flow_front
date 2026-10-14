import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from "react-hot-toast";
import Button from '../../components/Button.jsx'
import { musicService } from '../../services/index.js'

const INPUT_CLASS = 'w-full bg-[#2a2a2f] border border-[#3a3a3f] text-gray-100 p-2 rounded-lg'

/*
 * ♻️ REFACTORING — Extract Method (componente LabeledInput)
 * Antes: os campos Título e Artista repetiam o mesmo bloco
 * <div><label/><input/></div> com as mesmas classes.
 * Benefícios: - Duplicação  + Consistência visual
 */
function LabeledInput({ label, ...props }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input className={INPUT_CLASS} {...props} />
        </div>
    )
}

export default function RepertoireEdit() {
    const { id: bandId, musicId } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ title: '', artist: '' })
    const [themes, setThemes] = useState([])
    const [newTheme, setNewTheme] = useState('')
    const [loading, setLoading] = useState(false)

    const backToList = () => navigate(`/bands/${bandId}/repertoires`)

    useEffect(() => {
        async function loadMusic() {
            try {
                const music = await musicService.getById(musicId)
                setForm({ title: music.title, artist: music.artist })
                setThemes(music.themes || [])
            } catch (err) {
                console.error('Erro ao carregar música:', err)
            }
        }
        loadMusic()
    }, [musicId])

    function handleChange(e) {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    async function handleSave(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await musicService.update(musicId, { title: form.title, artist: form.artist })
            toast.success('Música atualizada!')
            backToList()
        } catch (err) {
            console.error('Erro ao atualizar música:', err)
            toast.error('Erro ao atualizar música.')
        } finally {
            setLoading(false)
        }
    }

    async function handleAddTheme(e) {
        e.preventDefault()

        /*
         * ♻️ REFACTORING — Extract Variable (themeName)
         * Antes: `newTheme.trim()` era calculado 3 vezes na mesma função.
         * Benefícios: - Duplicação  + Legibilidade
         */
        const themeName = newTheme.trim()
        if (!themeName) return

        try {
            await musicService.addThemes(musicId, [themeName])
            setThemes(prev => [...prev, { id: crypto.randomUUID(), name: themeName }])
            setNewTheme('')
            toast.success('Tema adicionado!')
        } catch {
            toast.error('Erro ao adicionar tema.')
        }
    }

    async function handleRemoveTheme(themeName) {
        if (!confirm(`Remover o tema "${themeName}"?`)) return
        try {
            await musicService.removeThemes(musicId, [themeName])
            setThemes(prev => prev.filter(t => t.name !== themeName))
            toast.success('Tema removido!')
        } catch {
            toast.error('Erro ao remover tema.')
        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-12 bg-[#1b1b1f] border border-[#2a2a2f] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Editar Música</h2>

            <form onSubmit={handleSave} className="space-y-5">
                <LabeledInput label="Título" name="title" value={form.title} onChange={handleChange} />
                <LabeledInput label="Artista" name="artist" value={form.artist} onChange={handleChange} />

                <div className="flex justify-end gap-3">
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

            <hr className="my-8 border-[#2a2a2f]" />

            <h3 className="text-lg font-semibold text-gray-100 mb-4">Temas</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {themes.length > 0 ? (
                    themes.map(t => (
                        <span key={t.id} className="bg-[#2a2a2f] text-gray-200 px-3 py-1 rounded-full flex items-center gap-2">
                            {t.name}
                            <button onClick={() => handleRemoveTheme(t.name)} className="text-red-400 hover:text-red-300 text-sm">
                                ✕
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-gray-500">Nenhum tema associado.</span>
                )}
            </div>

            <form onSubmit={handleAddTheme} className="flex gap-2">
                <input
                    className={`flex-1 ${INPUT_CLASS}`}
                    placeholder="Adicionar novo tema..."
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                />
                <Button variant="outline" type="submit">Adicionar</Button>
            </form>
        </div>
    )
}
