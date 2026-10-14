import axios from 'axios'
import { authSession } from '../session/AuthSession.js'

/*
 * ♻️ REFACTORING — Extract Class (HttpClient)
 * Antes: services/api.js era um módulo com uma instância global do axios,
 * uma função setAuthToken(), código solto executado na importação (restaurar
 * token) e um interceptor anônimo.
 * Agora: uma classe encapsula a configuração do axios, a injeção do token e
 * o tratamento de erros. Os services recebem uma instância dela.
 * Benefícios:
 *   + Coesão
 *   + Encapsulamento (o axios virou detalhe de implementação)
 *   - Acoplamento (services não importam mais o axios)
 *   + Testabilidade (dá para injetar um HttpClient falso nos services)
 */
export class HttpClient {
    static UNAUTHORIZED_STATUSES = [401, 403]

    constructor({ baseURL, session }) {
        this.session = session
        this.axios = axios.create({
            baseURL,
            headers: { 'Content-Type': 'application/json' }
        })

        this.axios.interceptors.request.use(config => this.attachToken(config))
        this.axios.interceptors.response.use(
            response => response,
            error => this.handleError(error)
        )
    }

    /*
     * ♻️ REFACTORING — Extract Method (attachToken)
     * Antes: o token era gravado em api.defaults.headers por setAuthToken() e
     * precisava ser "restaurado" na carga do módulo; se alguém esquecesse de
     * chamar setAuthToken, o header ficava desatualizado.
     * Agora: o header é montado a cada requisição a partir da sessão.
     * Benefícios:
     *   + Coesão
     *   - Estado global mutável
     *   - Duplicação (authApi.js gravava o token 2x: via setAuthToken e via localStorage)
     */
    attachToken(config) {
        const token = this.session.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    }

    /*
     * ♻️ REFACTORING — Extract Method (handleError / isSessionExpired)
     * Antes: o interceptor era uma arrow function anônima com 3 níveis de if.
     * Agora: cada decisão tem nome.
     * Benefícios:
     *   + Legibilidade
     *   + Coesão
     *   + Reuso
     */
    handleError(error) {
        if (this.isSessionExpired(error)) {
            this.onSessionExpired()
        } else if (error.request && !error.response) {
            console.error('Sem resposta do servidor. Verifique sua conexão.')
        } else if (!error.response) {
            console.error('Erro ao configurar requisição:', error.message)
        }
        return Promise.reject(error)
    }

    isSessionExpired(error) {
        return HttpClient.UNAUTHORIZED_STATUSES.includes(error.response?.status)
    }

    onSessionExpired() {
        console.warn('Sessão expirada. Redirecionando para login...')
        this.session.clear()
        if (!this.session.isOnLoginPage()) {
            this.session.redirectToLogin()
        }
    }

    /*
     * ♻️ REFACTORING — Extract Method (get/post/put/delete → request)
     * Antes: os ~60 métodos dos arquivos *Api.js repetiam
     *   `const { data } = await api.get(...); return data`
     * (alguns com `const res = ...; return res.data`, nomes diferentes para a
     * mesma coisa).
     * Agora: o desembrulho do `data` acontece num único lugar.
     * Benefícios:
     *   - Duplicação (~60 ocorrências)
     *   + Consistência
     *   + Coesão
     */
    async request(config) {
        const { data } = await this.axios.request(config)
        return data
    }

    get(url, options = {}) {
        return this.request({ ...options, method: 'get', url })
    }

    post(url, body, options = {}) {
        return this.request({ ...options, method: 'post', url, data: body })
    }

    put(url, body, options = {}) {
        return this.request({ ...options, method: 'put', url, data: body })
    }

    delete(url, options = {}) {
        return this.request({ ...options, method: 'delete', url })
    }
}

export const httpClient = new HttpClient({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    session: authSession
})
