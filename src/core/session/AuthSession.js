/*
 * ♻️ REFACTORING — Extract Class (AuthSession)
 * Antes: o token era lido/gravado direto no localStorage em api.js, authApi.js,
 * authUtils.js, ProtectedRoute.jsx e UserSettings.jsx (5 lugares conhecendo a
 * chave 'token' e as regras de sessão).
 * Agora: uma classe é a única dona do token e das regras de autenticação.
 * Benefícios:
 *   + Coesão (tudo sobre sessão de autenticação mora num só lugar)
 *   - Acoplamento (componentes não dependem mais do localStorage)
 *   - Duplicação
 *   + Encapsulamento (a chave 'token' virou detalhe interno)
 *   + Testabilidade (o storage é injetável)
 */
export class AuthSession {
    static TOKEN_KEY = 'token'
    static LOGIN_PATH = '/auth/login'

    /*
     * ♻️ REFACTORING — Move Field (storage)
     * O acesso ao armazenamento saiu do escopo global dos módulos e virou um
     * campo do objeto, recebido no construtor.
     * Benefícios:
     *   + Encapsulamento
     *   + Testabilidade (é possível passar um storage falso)
     *   - Acoplamento (com window.localStorage)
     */
    constructor(storage = null) {
        this.injectedStorage = storage
    }

    // Lido só quando usado (não na importação), para funcionar fora do navegador.
    get storage() {
        return this.injectedStorage ?? window.localStorage
    }

    getToken() {
        return this.storage.getItem(AuthSession.TOKEN_KEY)
    }

    /*
     * ♻️ REFACTORING — Change Function Declaration
     * Antes: setAuthToken(token) fazia duas coisas opostas conforme o argumento
     * (salvar quando havia token, apagar quando era null) e ainda alterava o axios.
     * Agora: saveToken(token) e clear() têm nomes que revelam a intenção.
     * Benefícios:
     *   + Legibilidade (nome revela a intenção)
     *   - Parâmetros "flag" que mudam o comportamento
     *   + Coesão (cada método faz uma coisa só)
     */
    saveToken(token) {
        this.storage.setItem(AuthSession.TOKEN_KEY, token)
    }

    clear() {
        this.storage.removeItem(AuthSession.TOKEN_KEY)
    }

    isAuthenticated() {
        return Boolean(this.getToken())
    }

    isOnLoginPage() {
        return window.location.pathname.includes(AuthSession.LOGIN_PATH)
    }

    /*
     * ♻️ REFACTORING — Move Method (logoutUser → AuthSession.endSession)
     * Antes: utils/authUtils.js tinha logoutUser(), que manipulava dados de
     * sessão de fora da "classe" responsável por eles.
     * Agora: o encerramento da sessão é comportamento da própria sessão.
     * O aviso visual (toast) ficou no componente, que é quem cuida de UI.
     * Benefícios:
     *   + Coesão
     *   - Acoplamento (sessão não depende mais da biblioteca de toast)
     *   - Feature Envy (o método usava só dados de sessão)
     */
    endSession({ redirectDelayMs = 0 } = {}) {
        this.clear()
        setTimeout(() => this.redirectToLogin(), redirectDelayMs)
    }

    redirectToLogin() {
        window.location.href = AuthSession.LOGIN_PATH
    }
}

export const authSession = new AuthSession()
