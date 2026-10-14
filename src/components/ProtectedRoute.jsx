import { Navigate } from 'react-router-dom'
import { authSession } from '../core/session/AuthSession.js'

/*
 * ♻️ REFACTORING — Inline Variable (checking / authenticated)
 * Antes: o componente tinha 2 estados (checking, authenticated) e um
 * useEffect só para ler o localStorage, que é síncrono. Isso causava um
 * render extra com "Verificando sessão..." sem necessidade.
 * Agora: o valor é obtido direto da sessão, sem variáveis intermediárias.
 * Benefícios:
 *   - Complexidade (de 2 estados + 1 efeito para 1 expressão)
 *   - Renders desnecessários
 *   + Legibilidade
 *   - Acoplamento (não conhece mais a chave 'token')
 */
export default function ProtectedRoute({ children }) {
    return authSession.isAuthenticated() ? children : <Navigate to="/auth/login" replace />
}
