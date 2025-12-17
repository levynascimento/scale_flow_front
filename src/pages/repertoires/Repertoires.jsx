import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBandMusics, deleteMusic } from '../../services/musicApi'
import { getRoles } from '../../services/rolesApi'
import Button from '../../components/Button'
import ConfirmDialog from '../../components/ConfirmDialog'
import toast from 'react-hot-toast'

import MusicDifficultyModal from "./MusicDifficultyModal.jsx"

export default function Repertoires() {
    const { id: bandId } = useParams()
    const navigate = useNavigate()

    const [musics, setMusics] = useState([])
    const [roles, setRoles] = useState([])

    const [selectedMusic, setSelectedMusic] = useState(null)
    const [difficultyMusic, setDifficultyMusic] = useState(null)

    async function loadMusics() {
        try {
            const data = await getBandMusics(bandId)
            setMusics(data)
        } catch {
            toast.error('Erro ao carregar músicas.')
        }
    }

    async function loadRoles() {
        try {
            const data = await getRoles();
            setRoles(data); // já vem na forma correta: [{id, name, slug}]
        } catch {
            toast.error("Erro ao carregar papéis (roles).");
        }
    }


    useEffect(() => {
        loadMusics();
        loadRoles(); // agora corretamente busca no /roles
    }, [bandId]);


    async function handleConfirmDelete() {
        if (!selectedMusic) return
        try {
            await deleteMusic(selectedMusic.id)
            toast.success('Música excluída!')
            setSelectedMusic(null)
            loadMusics()
        } catch {
            toast.error('Erro ao excluir música.')
        }
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-100">Repertório</h1>
                <Button onClick={() => navigate(`/bands/${bandId}/repertoires/new`)}>+ Nova Música</Button>
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
                                <td className="p-3">{m.themes?.map(t => t.name).join(', ') || '—'}</td>

                                {/* COLUNA NOVA → DIFICULDADES */}
                                <td className="p-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDifficultyMusic(m)}
                                    >
                                        Gerenciar
                                    </Button>
                                </td>

                                {/* AÇÕES */}
                                <td className="p-3 text-center space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(`/bands/${bandId}/repertoires/${m.id}/edit`)}
                                    >
                                        Editar
                                    </Button>

                                    <Button
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => setSelectedMusic(m)}
                                    >
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* CONFIRM DELETE */}
            <ConfirmDialog
                open={!!selectedMusic}
                title="Excluir Música"
                message={`Tem certeza que deseja excluir "${selectedMusic?.title}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setSelectedMusic(null)}
            />

            {/* MODAL DE DIFICULDADES */}
            <MusicDifficultyModal
                open={!!difficultyMusic}
                music={difficultyMusic}
                roles={roles}            // <-- agora vindo do endpoint certo
                onClose={() => setDifficultyMusic(null)}
                onUpdated={loadMusics}
            />
        </div>
    )
}
