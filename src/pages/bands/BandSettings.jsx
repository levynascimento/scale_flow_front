import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getBandWithJoinCode,
    updateBand,
    regenerateJoinCode,
    deleteBand
} from "../../services/bandApi.js";
import toast from "react-hot-toast";
import Input from "../../components/Input.jsx";
import Button from "../../components/Button.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";

export default function BandSettings() {
    const { id } = useParams();

    const [band, setBand] = useState(null);
    const [name, setName] = useState("");
    const [showJoinCode, setShowJoinCode] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadBand();
    }, [id]);

    async function loadBand() {
        try {
            const b = await getBandWithJoinCode(id);
            setBand(b);
            setName(b.name);
        } catch {
            toast.error("Erro ao carregar dados da banda.");
        }
    }

    async function handleSave() {
        try {
            await updateBand(id, { name });
            toast.success("Dados atualizados!");
            await loadBand();
        } catch {
            toast.error("Erro ao atualizar banda.");
        }
    }

    async function handleRegen() {
        try {
            await regenerateJoinCode(id);
            toast.success("Código regenerado!");
            setShowJoinCode(false);
            await loadBand();
        } catch {
            toast.error("Erro ao regenerar código.");
        }
    }

    function handleCopyCode() {
        if (!band?.joinCode) return;
        navigator.clipboard.writeText(band.joinCode);
        toast.success("Código copiado!");
    }

    // 🔴 CONFIRMAÇÃO REAL (não usa alert)
    async function handleConfirmDelete() {
        try {
            setDeleting(true);
            await deleteBand(id);
            toast.success("Banda deletada!");
            window.location.href = "/bands/select";
        } catch {
            toast.error(
                "Erro ao deletar banda. Verifique se não existem dados vinculados."
            );
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
        }
    }

    if (!band) {
        return <div className="p-8 text-gray-300">Carregando...</div>;
    }

    return (
        <div className="p-8 space-y-10">
            <h1 className="text-3xl font-bold">Configurações da Banda</h1>

            {/* DADOS BÁSICOS */}
            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">
                <h2 className="text-xl font-semibold">Dados Básicos</h2>

                <Input
                    label="Nome da Banda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Button
                    className="mt-2 bg-sf-primary hover:bg-sf-primary/80"
                    onClick={handleSave}
                >
                    Salvar Alterações
                </Button>
            </div>

            {/* CÓDIGO DA BANDA */}
            <div className="bg-sf-card p-6 rounded-xl border border-sf-border space-y-4">
                <h2 className="text-xl font-semibold">Código da Banda</h2>

                <p className="text-gray-400 text-sm">
                    Compartilhe este código com usuários para que entrem na banda.
                </p>

                <Input
                    label="Join Code"
                    value={
                        showJoinCode
                            ? band.joinCode || ""
                            : band.joinCode
                                ? "••••••••"
                                : ""
                    }
                    disabled
                />

                <div className="flex gap-3 flex-wrap">
                    <Button
                        className="bg-sf-primary hover:bg-sf-primary/80"
                        onClick={() => setShowJoinCode(prev => !prev)}
                    >
                        {showJoinCode ? "Ocultar Código" : "Mostrar Código"}
                    </Button>

                    <Button
                        className="bg-sf-primary hover:bg-sf-primary/80"
                        onClick={handleCopyCode}
                    >
                        Copiar Código
                    </Button>

                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleRegen}
                    >
                        Regenerar Código
                    </Button>
                </div>
            </div>

            {/* ZONA DE PERIGO */}
            <div className="bg-sf-card p-6 rounded-xl border border-red-800/40 space-y-4">
                <h2 className="text-xl font-semibold text-red-400">
                    Zona de Perigo
                </h2>

                <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => setConfirmOpen(true)}
                >
                    Deletar Banda
                </Button>
            </div>

            {/* CONFIRM DIALOG */}
            <ConfirmDialog
                open={confirmOpen}
                title="Deletar Banda"
                message="Esta ação é irreversível. Todos os dados da banda serão perdidos. Deseja continuar?"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
