import { useState } from "react";

/*
 * ♻️ REFACTORING — Extract Method (hook useAnimatedClose)
 * Antes: LineupCreateModal e LineupEditModal tinham, cada um, o mesmo
 * estado `closing` e a mesma função handleAnimatedClose() com setTimeout
 * de 150ms.
 * Agora: o comportamento "fechar com animação" é um hook reutilizável.
 * Benefícios:
 *   - Duplicação
 *   + Reuso (qualquer modal pode usar)
 *   + Coesão (estado e lógica da animação juntos)
 */
export const CLOSE_ANIMATION_MS = 150;

export function useAnimatedClose(onClose) {
    const [closing, setClosing] = useState(false);

    function close() {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
        }, CLOSE_ANIMATION_MS);
    }

    return { closing, close, animationClass: closing ? "animate-fadeOut" : "animate-scaleIn" };
}
