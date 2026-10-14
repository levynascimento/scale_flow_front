import { MembershipRole } from '../../domain/MembershipRole.js'

/*
 * ♻️ REFACTORING — Extract Class (BandSession)
 * Antes: as chaves "bandId", "bandRole" e "bandName" eram lidas/gravadas com
 * localStorage em BandSelect (3x a mesma sequência de setItem), BandLayout,
 * BandHome, Events, RequireAdmin, UserSettings e EventEscalationModal.
 * Agora: uma classe representa "a banda em que o usuário está agora".
 * Benefícios:
 *   + Coesão
 *   - Acoplamento (7 arquivos deixaram de conhecer o localStorage)
 *   - Duplicação
 *   + Encapsulamento
 *   + Testabilidade (storage injetável)
 */
export class BandSession {
    static KEYS = {
        id: 'bandId',
        role: 'bandRole',
        name: 'bandName'
    }

    constructor(storage = null) {
        this.injectedStorage = storage
    }

    // Lido só quando usado (não na importação), para funcionar fora do navegador.
    get storage() {
        return this.injectedStorage ?? window.localStorage
    }

    get bandId() {
        return this.storage.getItem(BandSession.KEYS.id)
    }

    get bandName() {
        return this.storage.getItem(BandSession.KEYS.name)
    }

    /*
     * ♻️ REFACTORING — Rename Field (bandRole → membershipRole)
     * Antes: a string "bandRole" ("ADMIN"/"MEMBER") era comparada à mão em
     * vários componentes. "Role" também é o nome dos papéis musicais
     * (guitarrista, baterista...), o que gerava ambiguidade.
     * Agora: o campo exposto se chama membershipRole e devolve um objeto
     * MembershipRole, não uma string solta.
     * Benefícios:
     *   + Legibilidade (fim da ambiguidade "role de banda" x "papel musical")
     *   + Expressividade do domínio
     */
    get membershipRole() {
        return MembershipRole.from(this.storage.getItem(BandSession.KEYS.role))
    }

    /*
     * ♻️ REFACTORING — Extract Variable → Move Method (isAdmin)
     * Antes: `const isAdmin = role === "ADMIN"` aparecia em BandLayout,
     * BandHome, Events e RequireAdmin.
     * Agora: a pergunta "sou admin?" é respondida pela própria sessão.
     * Benefícios:
     *   - Duplicação
     *   + Coesão
     *   - Magic strings ("ADMIN" espalhado)
     */
    get isAdmin() {
        return this.membershipRole.isAdmin
    }

    /*
     * ♻️ REFACTORING — Extract Method (enter)
     * Antes: BandSelect repetia 3 vezes o bloco de 3 setItem (ao entrar,
     * ao criar e ao usar join code), cada vez com nomes de campos diferentes.
     * Agora: um método recebe os dados já normalizados.
     * Benefícios:
     *   - Duplicação
     *   + Coesão
     *   + Legibilidade
     */
    enter({ id, role, name }) {
        this.storage.setItem(BandSession.KEYS.id, id)
        this.storage.setItem(BandSession.KEYS.role, role)
        this.storage.setItem(BandSession.KEYS.name, name)
    }

    /*
     * Correção encontrada durante o refactoring: o "Sair da Banda" do
     * BandLayout removia a chave "currentBand", que não existe. A banda
     * nunca era de fato esquecida. Agora as chaves certas são apagadas.
     */
    leave() {
        Object.values(BandSession.KEYS).forEach(key => this.storage.removeItem(key))
    }
}

export const bandSession = new BandSession()
