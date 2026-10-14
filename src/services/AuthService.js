import { BaseService } from './BaseService.js'

/*
 * ♻️ REFACTORING — Extract Class (authApi.js → AuthService)
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento
 *   + Testabilidade (HttpClient e sessão são injetados)
 */
export class AuthService extends BaseService {
    constructor(http, session) {
        super(http)
        this.session = session
    }

    /*
     * ♻️ REFACTORING — Change Function Declaration (loginUser → login)
     * Antes: loginUser() salvava o token DUAS vezes (setAuthToken já gravava
     * no localStorage e logo depois havia outro localStorage.setItem).
     * Agora: o nome não repete o contexto da classe ("User") e o token é
     * salvo uma vez só, pela sessão.
     * Benefícios:
     *   - Duplicação
     *   + Legibilidade
     */
    async login(credentials) {
        const data = await this.http.post('/auth/login', credentials)
        if (data?.token) {
            this.session.saveToken(data.token)
        }
        return data
    }

    /*
     * ♻️ REFACTORING — Move Method (cadastro: Register.jsx → AuthService.register)
     * Antes: Register.jsx chamava `api.post('/auth/register')` direto,
     * furando a camada de serviços (era a única tela que fazia isso).
     * Benefícios:
     *   - Acoplamento (componente não conhece mais URL do backend)
     *   + Consistência (todas as telas falam com serviços)
     *   + Coesão
     */
    register({ name, email, password }) {
        return this.http.post('/auth/register', { name, email, password })
    }

    /*
     * ♻️ REFACTORING — Extract Method (registerAndLogin)
     * Antes: o fluxo "cadastra → faz login → salva token" estava inline no
     * handleSubmit do Register, repetindo a lógica de login que já existia
     * em authApi.js.
     * Benefícios:
     *   - Duplicação (reusa login())
     *   + Legibilidade
     */
    async registerAndLogin({ name, email, password }) {
        await this.register({ name, email, password })
        return this.login({ email, password })
    }
}
