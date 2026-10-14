import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import AuthCard from '../../components/AuthCard.jsx'
import FieldError, { FormError } from '../../components/FieldError.jsx'
import { authService } from '../../services/index.js'
import { errorMessageFrom } from '../../core/http/errorMessage.js'
import { ValidationHandler } from '../../core/validation/ValidationHandler.js'
import { EmailValidator, PasswordValidator } from '../../core/validation/validators.js'

/*
 * ♻️ REFACTORING — Extract Method (inputClass)
 * Antes: a mesma template string de 5 linhas (borda vermelha se houver erro,
 * roxa se não) era repetida nos campos de e-mail e senha.
 * Benefícios:
 *   - Duplicação
 *   + Legibilidade do JSX
 */
function inputClass(hasError) {
    return `w-full border rounded-lg p-2 ${
        hasError
            ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-500/30'
            : 'border-[#3a3a3f] focus:ring-[#7c5fff]'
    }`
}

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setErrors({})

        /*
         * ♻️ REFACTORING — Extract Method (ValidationHandler.chain) + Move Field (error.field)
         * Antes: criava 2 validadores, encadeava à mão e depois descobria o
         * campo do erro procurando "e-mail" ou "senha" dentro da mensagem.
         * Agora: a cadeia é montada numa linha e o erro já diz seu campo.
         * Benefícios:
         *   - Complexidade (o if/else if/else de 3 ramos sumiu)
         *   + Robustez (mudar o texto da mensagem não quebra a tela)
         *   - Acoplamento entre texto e lógica
         */
        const validationError = ValidationHandler
            .chain(new EmailValidator(), new PasswordValidator())
            .handle({ email, password })

        if (validationError) {
            setErrors(validationError.toFieldErrors())
            return
        }

        try {
            setLoading(true)
            await authService.login({ email, password })
            toast.success('Login realizado com sucesso!')
            navigate('/bands/select', { replace: true })
        } catch (err) {
            console.error(err)
            const msg = errorMessageFrom(err, 'Credenciais inválidas ou erro no servidor.')
            toast.error(msg)
            setErrors({ general: msg })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sf-primary/20 via-transparent to-transparent pt-24">
            <AuthCard subtitle="Entre para gerenciar suas bandas e repertórios.">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="voce@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass(errors.email)}
                        />
                        <FieldError message={errors.email} />
                    </div>

                    <div>
                        <Input
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass(errors.password)}
                        />
                        <FieldError message={errors.password} />
                    </div>

                    <FormError message={errors.general} />

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-sf-muted">Não tem conta?</span>{' '}
                    <Link to="/auth/register" className="font-medium text-sf-primary hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </AuthCard>
        </div>
    )
}
