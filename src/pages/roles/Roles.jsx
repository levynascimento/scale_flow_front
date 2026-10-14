import { useEffect, useState } from "react";
import RoleFormModal from "./RoleFormModal.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import Button from "../../components/Button.jsx";
import { roleService } from "../../services/index.js";
import { Paginator } from "../../domain/Paginator.js";

const PAGE_SIZE = 10;

export default function Roles() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [openForm, setOpenForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        loadRoles();
    }, []);

    /*
     * ♻️ REFACTORING — Move Method (ordenação → RoleService.listSortedByName)
     * Benefícios: + Reuso  + Coesão  - Lógica no componente
     */
    async function loadRoles() {
        try {
            setLoading(true);
            setRoles(await roleService.listSortedByName());
        } catch (err) {
            console.error("Erro ao carregar papéis:", err);
        } finally {
            setLoading(false);
        }
    }

    /*
     * ♻️ REFACTORING — Extract Method (openForm)
     * Antes: handleOpenCreate e handleOpenEdit eram duas funções que faziam
     * a mesma coisa, só mudando o argumento (null ou o papel).
     * Agora: uma só, parametrizada.
     * Benefícios: - Duplicação  + Legibilidade
     */
    function openFormFor(role = null) {
        setEditingRole(role);
        setOpenForm(true);
    }

    /*
     * ♻️ REFACTORING — Inline Method (getFiltered)
     * Antes: `function getFiltered() { return roles.filter(...) }` chamada
     * uma única vez, na linha seguinte, só para atribuir a `filtered`.
     * O corpo era tão legível quanto o nome.
     * Benefícios: - Indireção desnecessária  + Legibilidade
     */
    const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

    /*
     * ♻️ REFACTORING — Extract Class (Paginator)
     * Antes: totalPages, currentPage, startIndex e paginated eram 4 variáveis
     * soltas aqui, e os botões repetiam Math.max/Math.min.
     * Benefícios: + Coesão  + Reuso  + Testabilidade  - Tamanho do componente
     */
    const paginator = new Paginator(filtered, PAGE_SIZE, page);

    async function handleConfirmDelete() {
        if (!deleteTarget) return;

        try {
            await roleService.delete(deleteTarget.id);
        } catch (err) {
            console.error("Erro ao excluir papel:", err);
        } finally {
            setDeleteTarget(null);
            loadRoles();
        }
    }

    return (
        <div className="text-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Papéis</h1>
                <Button onClick={() => openFormFor(null)}>+ Novo papel</Button>
            </div>

            <input
                type="text"
                placeholder="Buscar papel..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-[#1e1e22] border border-[#2a2a30] text-gray-200"
            />

            {loading ? (
                <p className="text-gray-400">Carregando papéis…</p>
            ) : filtered.length === 0 ? (
                <p className="text-gray-400">Nenhum papel encontrado.</p>
            ) : (
                <div className="space-y-3">
                    {paginator.pageItems.map((role) => (
                        <div
                            key={role.id}
                            className="bg-[#1b1b1f] border border-[#2a2a30] p-4 rounded-lg flex justify-between items-center"
                        >
                            <div>
                                <p className="font-medium">{role.name}</p>
                                <p className="text-gray-500 text-sm">{role.slug}</p>
                            </div>

                            <div className="flex gap-3">
                                <Button className="bg-indigo-600 hover:bg-indigo-500" onClick={() => openFormFor(role)}>
                                    Editar
                                </Button>
                                <Button className="bg-red-600 hover:bg-red-500" onClick={() => setDeleteTarget(role)}>
                                    Remover
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {paginator.needsPagination && (
                <div className="flex justify-center mt-6 gap-2 items-center">
                    <Button
                        variant="outline"
                        disabled={!paginator.hasPrevious}
                        onClick={() => setPage(paginator.previousPage())}
                    >
                        Anterior
                    </Button>

                    <span className="text-sm text-gray-300">
                        Página {paginator.currentPage} de {paginator.totalPages}
                    </span>

                    <Button
                        variant="outline"
                        disabled={!paginator.hasNext}
                        onClick={() => setPage(paginator.nextPage())}
                    >
                        Próxima
                    </Button>
                </div>
            )}

            <RoleFormModal
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSaved={loadRoles}
                editingRole={editingRole}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title="Excluir papel"
                message={deleteTarget ? `Deseja excluir o papel "${deleteTarget.name}"?` : ""}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
