/*
 * ♻️ REFACTORING — Extract Class (MembershipRole)
 * Antes: o tipo de participação na banda (ADMIN / MEMBER / OBSERVER) era uma
 * string, e cada tela traduzia com ternários aninhados:
 *   - BandLayout: um ternário de 3 níveis para a cor do badge e outro para o rótulo
 *   - BandSelect: um ternário de 4 níveis para o rótulo
 * Agora: cada tipo é um objeto que sabe seu rótulo e seu estilo.
 * Benefícios:
 *   + Coesão
 *   - Duplicação
 *   - Complexidade ciclomática nos componentes (fim dos ternários aninhados)
 *   + Extensibilidade (novo tipo = nova instância, sem caçar ternários)
 */
export class MembershipRole {
    constructor(type, label, badgeClass) {
        this.type = type
        this.label = label
        this.badgeClass = badgeClass
    }

    get isAdmin() {
        return this.type === 'ADMIN'
    }

    static ADMIN = new MembershipRole(
        'ADMIN',
        'Administrador',
        'text-[#cbb6ff] border-[#7c5fff]/40 bg-[#7c5fff]/10'
    )

    static MEMBER = new MembershipRole(
        'MEMBER',
        'Membro',
        'text-[#a7d4ff] border-[#4ea1ff]/40 bg-[#4ea1ff]/10'
    )

    static OBSERVER = new MembershipRole(
        'OBSERVER',
        'Observador',
        'text-gray-400 border-gray-600/40 bg-gray-600/10'
    )

    static UNKNOWN = new MembershipRole(
        null,
        'Desconhecido',
        'text-gray-400 border-gray-600/40 bg-gray-600/10'
    )

    static from(type) {
        return [MembershipRole.ADMIN, MembershipRole.MEMBER, MembershipRole.OBSERVER]
            .find(role => role.type === type) ?? MembershipRole.UNKNOWN
    }
}
