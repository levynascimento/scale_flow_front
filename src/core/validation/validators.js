import { ValidationHandler, ValidationError } from './ValidationHandler.js'

/*
 * ♻️ REFACTORING — Extract Class (RequiredFieldValidator)
 * Antes: EmailValidator, PasswordValidator, TitleValidator e ArtistValidator
 * repetiam a mesma checagem "campo vazio?" com pequenas variações
 * (`!x?.trim()`, `!x || x.trim() === ''`).
 * Agora: a regra "obrigatório" virou uma classe; as outras herdam dela.
 * Benefícios:
 *   - Duplicação
 *   + Coesão
 *   + Reuso
 *   + Consistência (todas tratam espaço em branco igual)
 */
export class RequiredFieldValidator extends ValidationHandler {
    constructor(field, requiredMessage) {
        super()
        this.field = field
        this.requiredMessage = requiredMessage
    }

    /*
     * ♻️ REFACTORING — Extract Method (valueOf / fail)
     * Benefícios:
     *   - Duplicação (trim e criação de erro em um só ponto)
     *   + Legibilidade
     */
    valueOf(data) {
        return String(data[this.field] ?? '').trim()
    }

    fail(message) {
        return new ValidationError(this.field, message)
    }

    handle(data) {
        if (!this.valueOf(data)) return this.fail(this.requiredMessage)
        return this.validate(this.valueOf(data)) ?? super.handle(data)
    }

    // Gancho para as subclasses acrescentarem regras próprias.
    validate() {
        return null
    }
}

export class EmailValidator extends RequiredFieldValidator {
    /*
     * ♻️ REFACTORING — Extract Variable → Move Field (EMAIL_PATTERN)
     * Antes: a regex era recriada como variável local a cada chamada de handle().
     * Agora: é um campo estático com nome.
     * Benefícios:
     *   + Legibilidade
     *   + Desempenho (regex criada uma vez)
     */
    static EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    constructor() {
        super('email', 'O campo de e-mail é obrigatório.')
    }

    validate(email) {
        return EmailValidator.EMAIL_PATTERN.test(email) ? null : this.fail('Informe um e-mail válido.')
    }
}

export class PasswordValidator extends RequiredFieldValidator {
    static MIN_LENGTH = 6

    constructor() {
        super('password', 'A senha é obrigatória.')
    }

    validate(password) {
        return password.length >= PasswordValidator.MIN_LENGTH
            ? null
            : this.fail(`A senha deve ter pelo menos ${PasswordValidator.MIN_LENGTH} caracteres.`)
    }
}

/*
 * ♻️ REFACTORING — Move Method (checagem de "senhas coincidem")
 * Antes: Register.jsx fazia o `if (form.password !== form.confirm)` dentro do
 * handleSubmit, fora do padrão de validação que o projeto já usava.
 * Agora: virou um elo da mesma Chain of Responsibility.
 * Benefícios:
 *   + Consistência
 *   + Coesão (regras de validação juntas)
 *   - Responsabilidades no componente
 */
export class PasswordConfirmationValidator extends ValidationHandler {
    handle(data) {
        if (data.password !== data.confirm) {
            return new ValidationError('confirm', 'As senhas não coincidem.')
        }
        return super.handle(data)
    }
}

export class TitleValidator extends RequiredFieldValidator {
    constructor() {
        super('title', 'O título da música é obrigatório.')
    }
}

export class ArtistValidator extends RequiredFieldValidator {
    constructor() {
        super('artist', 'O artista da música é obrigatório.')
    }
}
