import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Button from "../../components/Button.jsx"

import {
    getMusicDifficulties,
    setMusicDifficulty,
    deleteMusicDifficulty
} from "../../services/musicApi.js"

export default function MusicDifficultyModal({
                                                 open,
                                                 onClose,
                                                 music,
                                                 roles = [],
                                                 onUpdated
                                             }) {

    const [loading, setLoading] = useState(true)
    const [difficulties, setDifficulties] = useState([])

    const [editingRole, setEditingRole] = useState(null)
    const [levelInput, setLevelInput] = useState("")

    async function load() {
        if (!music) return
        try {
            setLoading(true)
            const data = await getMusicDifficulties(music.id)
            setDifficulties(data)
        } catch {
            toast.error("Erro ao carregar dificuldades.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) load()
    }, [open])

    async function handleSave() {
        if (!editingRole) return

        try {
            await setMusicDifficulty(music.id, editingRole.slug, Number(levelInput))
            toast.success("Dificuldade salva!")
            setEditingRole(null)
            setLevelInput("")
            await load()
            onUpdated?.()
        } catch {
            toast.error("Erro ao salvar dificuldade.")
        }
    }

    async function handleDelete(roleSlug) {
        try {
            await deleteMusicDifficulty(music.id, roleSlug)
            toast.success("Dificuldade removida!")
            await load()
            onUpdated?.()
        } catch {
            toast.error("Erro ao remover.")
        }
    }

    if (!open || !music) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1e] border border-[#2a2a30] rounded-xl p-6 w-full max-w-lg text-gray-200">

                {/* HEADER */}
                <div className="flex justify-between mb-4">
                    <h1 className="text-xl font-semibold">
                        Dificuldades — {music.title}
                    </h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {loading ? (
                    <p className="text-gray-400 text-center py-4">Carregando…</p>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">

                        {roles.map(r => {
                            const info = difficulties.find(d => d.roleSlug === r.slug)
                            const inEdit = editingRole?.slug === r.slug

                            return (
                                <div key={r.id} className="bg-[#111118] border border-[#2a2a30] p-4 rounded-lg">
                                    <p className="font-medium">{r.name}</p>

                                    {!info && !inEdit && (
                                        <p className="text-gray-400 text-sm mb-2">Nenhuma dificuldade definida.</p>
                                    )}

                                    {info && !inEdit && (
                                        <p className="text-gray-300 text-sm mb-2">
                                            Nível: <b>{info.level}</b>
                                        </p>
                                    )}

                                    {/* MODO EDIÇÃO */}
                                    {inEdit ? (
                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={levelInput}
                                                onChange={e => setLevelInput(e.target.value)}
                                                className="bg-[#1a1a1e] border border-[#2a2a30] rounded px-3 py-2 w-full"
                                                placeholder="0 a 10"
                                            />
                                            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleSave}>
                                                Salvar
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingRole(r)
                                                    setLevelInput(info?.level ?? "")
                                                }}
                                            >
                                                {info ? "Editar" : "Definir"}
                                            </Button>

                                            {info && (
                                                <Button
                                                    className="bg-red-600 hover:bg-red-700"
                                                    onClick={() => handleDelete(r.slug)}
                                                >
                                                    Remover
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                </div>
                            )
                        })}

                    </div>
                )}
            </div>
        </div>
    )
}
