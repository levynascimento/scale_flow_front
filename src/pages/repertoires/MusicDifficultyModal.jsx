import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Button from "../../components/Button.jsx"
import { musicService } from "../../services/index.js"
import { SkillLevel } from "../../domain/SkillLevel.js"

/*
 * ♻️ REFACTORING — Extract Method (componente DifficultyRow)
 * Antes: o corpo do .map() tinha ~50 linhas com 3 estados visuais por papel
 * (sem dificuldade, com dificuldade, editando), tudo inline no modal.
 * Agora: cada linha é um componente com nome.
 * Benefícios:
 *   + Legibilidade
 *   + Coesão (a linha cuida da própria exibição)
 *   - Tamanho do componente principal
 */
function DifficultyRow({ role, difficulty, editing, levelInput, onLevelInput, onStartEdit, onSave, onDelete }) {
    return (
        <div className="bg-[#111118] border border-[#2a2a30] p-4 rounded-lg">
            <p className="font-medium">{role.name}</p>

            {!editing && (
                difficulty
                    ? <p className="text-gray-300 text-sm mb-2">Nível: <b>{difficulty.level}</b></p>
                    : <p className="text-gray-400 text-sm mb-2">Nenhuma dificuldade definida.</p>
            )}

            {editing ? (
                <div className="flex gap-2 mt-2">
                    <input
                        type="number"
                        min={SkillLevel.MIN}
                        max={SkillLevel.MAX}
                        value={levelInput}
                        onChange={e => onLevelInput(e.target.value)}
                        className="bg-[#1a1a1e] border border-[#2a2a30] rounded px-3 py-2 w-full"
                        placeholder={SkillLevel.rangeLabel}
                    />
                    <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={onSave}>Salvar</Button>
                </div>
            ) : (
                <div className="flex gap-2 mt-3">
                    <Button variant="outline" onClick={onStartEdit}>
                        {difficulty ? "Editar" : "Definir"}
                    </Button>
                    {difficulty && (
                        <Button className="bg-red-600 hover:bg-red-700" onClick={onDelete}>Remover</Button>
                    )}
                </div>
            )}
        </div>
    )
}

export default function MusicDifficultyModal({ open, onClose, music, roles = [], onUpdated }) {
    const [loading, setLoading] = useState(true)
    const [difficulties, setDifficulties] = useState([])
    const [editingRole, setEditingRole] = useState(null)
    const [levelInput, setLevelInput] = useState("")

    async function load() {
        if (!music) return
        try {
            setLoading(true)
            setDifficulties(await musicService.listDifficulties(music.id))
        } catch {
            toast.error("Erro ao carregar dificuldades.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) load()
    }, [open])

    /*
     * ♻️ REFACTORING — Extract Method (difficultyOf)
     * Antes: `difficulties.find(d => d.roleSlug === r.slug)` inline no map.
     * Benefícios: + Legibilidade
     */
    const difficultyOf = (role) => difficulties.find(d => d.roleSlug === role.slug)

    function startEditing(role) {
        setEditingRole(role)
        setLevelInput(difficultyOf(role)?.level ?? "")
    }

    async function handleSave() {
        if (!editingRole) return

        /*
         * ♻️ REFACTORING — Extract Class (SkillLevel) aplicada aqui também
         * Antes: `Number(levelInput)` era enviado sem validação: campo vazio
         * virava 0 e valores como 99 iam para o backend.
         * Agora: a mesma regra 0–10 usada em UserSettings.
         * Benefícios: + Consistência  + Corretude  - Duplicação de regra
         */
        const level = SkillLevel.parse(levelInput)
        if (level === null) {
            toast.error(`O nível deve ser entre ${SkillLevel.rangeLabel}.`)
            return
        }

        try {
            await musicService.setDifficulty(music.id, editingRole.slug, level)
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
            await musicService.deleteDifficulty(music.id, roleSlug)
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
                <div className="flex justify-between mb-4">
                    <h1 className="text-xl font-semibold">Dificuldades — {music.title}</h1>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {loading ? (
                    <p className="text-gray-400 text-center py-4">Carregando…</p>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {roles.map(role => (
                            <DifficultyRow
                                key={role.id}
                                role={role}
                                difficulty={difficultyOf(role)}
                                editing={editingRole?.slug === role.slug}
                                levelInput={levelInput}
                                onLevelInput={setLevelInput}
                                onStartEdit={() => startEditing(role)}
                                onSave={handleSave}
                                onDelete={() => handleDelete(role.slug)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
