// src/pages/lineups/Lineups.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getLineups, deleteLineup } from "../../services/lineupApi.js";
import { getRoles } from "../../services/rolesApi.js";

import { Plus } from "lucide-react";

import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import LineupCreateModal from "./LineupCreateModal.jsx";
import LineupDetailsModal from "./LineupDetailsModal.jsx";
import LineupEditModal from "./LineupEditModal.jsx";

export default function Lineups() {
    const { id: bandId } = useParams();

    const [lineups, setLineups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [selectedLineupId, setSelectedLineupId] = useState(null);

    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        lineup: null,
    });

    async function loadData() {
        try {
            setLoading(true);
            const [lineupsRes, rolesRes] = await Promise.all([
                getLineups(bandId),
                getRoles(),
            ]);

            setLineups(lineupsRes);
            setRoles(rolesRes);
        } catch (e) {
            console.error("Erro ao carregar lineups:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (bandId) loadData();
    }, [bandId]);

    async function handleDeleteLineup(lineup) {
        if (!lineup) return;

        try {
            await deleteLineup(lineup.id);
            await loadData();

            setDetailsOpen(false);
            setSelectedLineupId(null);
        } catch (err) {
            console.error("Erro ao excluir:", err);
        }
    }

    if (loading) {
        return (
            <div className="text-gray-300 text-center p-6">
                Carregando formações.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-200">
                        Formações
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Monte e gerencie as formações da banda.
                    </p>
                </div>

                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sf-primary hover:bg-sf-primary-600 transition text-white shadow-lg"
                >
                    <Plus size={18} />
                    Nova formação
                </button>
            </div>

            {/* LISTA DE CARDS */}
            {lineups.length === 0 ? (
                <p className="text-gray-400">
                    Nenhuma formação criada ainda.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {lineups.map((lineup) => (
                        <div
                            key={lineup.id}
                            onClick={() => {
                                setSelectedLineupId(lineup.id);
                                setDetailsOpen(true);
                            }}
                            className="cursor-pointer bg-[#1b1b1f] border border-[#29292e] rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-[#7c5fff] transition relative"
                        >
                            <h2 className="text-lg font-semibold text-gray-100">
                                {lineup.name}
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                {(lineup.roles?.length ?? 0)} papel(éis)
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO */}
            <LineupCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={loadData}
            />

            {/* MODAL DE DETALHES */}
            {selectedLineupId && (
                <LineupDetailsModal
                    open={detailsOpen}
                    lineupId={selectedLineupId}
                    onClose={() => setDetailsOpen(false)}
                    onEdit={(lineup) => {
                        setSelectedLineupId(lineup.id);
                        setEditOpen(true);
                    }}
                    onDelete={(lineup) => {
                        setDeleteDialog({ open: true, lineup });
                    }}
                />
            )}

            {/* CONFIRMAR EXCLUSÃO */}
            <ConfirmDialog
                open={deleteDialog.open}
                title="Excluir Formação"
                message={`Tem certeza que deseja excluir a formação "${deleteDialog.lineup?.name}"?`}
                onConfirm={() => {
                    handleDeleteLineup(deleteDialog.lineup);
                    setDeleteDialog({ open: false, lineup: null });
                }}
                onCancel={() =>
                    setDeleteDialog({ open: false, lineup: null })
                }
            />

            {/* MODAL DE EDIÇÃO */}
            {selectedLineupId && (
                <LineupEditModal
                    open={editOpen}
                    lineupId={selectedLineupId}
                    onClose={() => setEditOpen(false)}
                    onUpdated={() => {
                        loadData();
                        setEditOpen(false);
                        setDetailsOpen(false);
                    }}
                />

            )}
        </div>
    );
}
