/*
 * ♻️ REFACTORING — Extract Class (BaseService)
 * Antes: cada arquivo *Api.js importava a instância global `api` do axios e
 * declarava funções soltas. Não havia nada em comum entre eles além do
 * copiar-e-colar.
 * Agora: todos os serviços herdam de BaseService e recebem o HttpClient pelo
 * construtor (injeção de dependência).
 * Benefícios:
 *   + Coesão
 *   - Acoplamento (serviços dependem de uma abstração, não do axios)
 *   + Testabilidade (basta passar um HttpClient falso)
 *   + Reuso
 */
export class BaseService {
    constructor(http) {
        this.http = http
    }
}
