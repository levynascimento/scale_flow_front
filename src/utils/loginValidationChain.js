// Classe base do padrão Chain of Responsibility
export class LoginValidator {
    setNext(validator) {
        this.next = validator
        return validator
    }

    handle(data) {
        if (this.next) {
            return this.next.handle(data)
        }
        return null
    }
}

// Valida e-mail
export class EmailValidator extends LoginValidator {
    handle(data) {
        const email = data.email?.trim()

        if (!email) {
            return 'O campo de e-mail é obrigatório.'
        }

        // Regex simples pra validar formato de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return 'Informe um e-mail válido.'
        }

        return super.handle(data)
    }
}

// Valida senha
export class PasswordValidator extends LoginValidator {
    handle(data) {
        const password = data.password?.trim()

        if (!password) {
            return 'A senha é obrigatória.'
        }

        if (password.length < 6) {
            return 'A senha deve ter pelo menos 6 caracteres.'
        }

        return super.handle(data)
    }
}
