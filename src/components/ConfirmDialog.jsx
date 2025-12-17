// src_frontend/components/ConfirmDialog.jsx

import Button from './Button.jsx'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[11000]">
            <div className="
                bg-[#1b1b1f] border border-[#2a2a30]
                rounded-2xl p-6 w-[95%] max-w-md
                shadow-2xl
            ">
                {/* TÍTULO */}
                {title && (
                    <h2 className="text-xl font-semibold text-gray-100 mb-3">
                        {title}
                    </h2>
                )}

                {/* MENSAGEM */}
                {message && (
                    <p className="text-sm text-gray-300 mb-6">
                        {message}
                    </p>
                )}

                {/* BOTÕES */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#2a2a30] text-gray-300 hover:bg-[#191920]"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-500"
                        onClick={onConfirm}
                    >
                        Confirmar
                    </Button>
                </div>
            </div>
        </div>
    )
}
