import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/Button'
import ConfirmDialog from '../../components/ConfirmDialog'
import MusicDifficultyModal from "./MusicDifficultyModal.jsx"
import { musicService, roleService } from '../../services/index.js'
import { Music } from '../../domain/Music.js'

export default function Repertoires() {
    const { id: bandId } = useParams()
    const navigate = useNavigate()

    const [musics, setMusics] = useState([])
    const [roles, setRoles] = useState([])

    /*
     * ♻️ REFACTORING — Rename Variable (selectedMusic → musicToDelete)
     * Antes: `selectedMusic` guardava a música que estava para ser EXCLUÍDA,
     * enquanto `difficultyMusic` guardava a do modal de dificuldade. O nome
     * "selected" não dizia para que ela tinha sido selecionada.
     * Benefícios: + Legibilidade (nome revela a intenção)  - Ambiguidade
     */
    const [musicToDelete, setMusicToDelete] = useState(null)
    const [difficultyMusic, setDifficultyMusic] = useState(null)

    /*
     * ♻️ REFACTORING — Extract Method (repertoirePath)
     * Antes: a URL `/bands/${bandId}/repertoires...` era montada à mão 3 vezes.
     * Benefícios: - Duplicação  + Consistência
     */
    const repertoirePath = (suffix = '') => `/bands/${bandId}/repertoires${suffix}`

    async function loadMusics() {
        try {
            setMusics(await musicService.listByBand(bandId))
        } catch {
            toast.error('Erro ao carregar músicas.')
        }
    }

    async function loadRoles() {
        try {
            setRoles(await roleService.list())
        } catch {
            toast.error("Erro ao carregar papéis (roles).")
        }
    }

    useEffect(() => {
        loadMusics()
        loadRoles()
    }, [bandId])

    async function handleConfirmDelete() {
        if (!musicToDelete) return
        try {
            await musicService.delete(musicToDelete.id)
            toast.success('Música excluída!')
            setMusicToDelete(null)
            loadMusics()
        } catch {
            toast.error('Erro ao excluir música.')
        }
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-100">Repertório</h1>
                <Button onClick={() => navigate(repertoirePath('/new'))}>+ Nova Música</Button>
            </div>

            <div className="bg-[#1b1b1f] border border-[#2a2a2f] rounded-xl overflow-hidden">
                <table className="w-full text-gray-200">
                    <thead className="bg-[#2a2a2f] text-sm text-gray-400">
                        <tr>
                            <th className="p-3 text-left">Título</th>
                            <th className="p-3 text-left">Artista</th>
                            <th className="p-3 text-left">Temas</th>
                            <th className="p-3 text-left">Dificuldades</th>
                            <th className="p-3 text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {musics.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    Nenhuma música cadastrada.
                                </td>
                            </tr>
                        ) : (
                            musics.map(m => (
                                <tr key={m.id} className="border-t border-[#2a2a2f] hover:bg-[#2a2a2f]/70">
                                    <td className="p-3">{m.title}</td>
                                    <td className="p-3">{m.artist}</td>
                                    {/*
                                      ♻️ REFACTORING — Extract Method + Move Method (Music.themesLabel)
                                      Antes: map + join + fallback inline na célula.
                                      Benefícios: + Legibilidade  + Reuso
                                    */}
                                    <td className="p-3">{Music.themesLabel(m)}</td>

                                    <td className="p-3">
                                        <Button variant="outline" onClick={() => setDifficultyMusic(m)}>
                                            Gerenciar
                                        </Button>
                                    </td>

                                    <td className="p-3 text-center space-x-2">
                                        <Button variant="outline" onClick={() => navigate(repertoirePath(`/${m.id}/edit`))}>
                                            Editar
                                        </Button>
                                        <Button className="bg-red-600 hover:bg-red-700" onClick={() => setMusicToDelete(m)}>
                                            Excluir
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                open={!!musicToDelete}
                title="Excluir Música"
                message={`Tem certeza que deseja excluir "${musicToDelete?.title}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setMusicToDelete(null)}
            />

            <MusicDifficultyModal
                open={!!difficultyMusic}
                music={difficultyMusic}
                roles={roles}
                onClose={() => setDifficultyMusic(null)}
                onUpdated={loadMusics}
            />
        </div>
    )
}
