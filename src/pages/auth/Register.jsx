import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import AuthCard from '../../components/AuthCard.jsx'
import { FormError } from '../../components/FieldError.jsx'
import { authService } from '../../services/index.js'
import { PasswordConfirmationValidator } from '../../core/validation/validators.js'
import { errorMessageFrom } from '../../core/http/errorMessage.js'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        /*
         * ♻️ REFACTORING — Move Method (confirmação de senha → PasswordConfirmationValidator)
         * Antes: `if (form.password !== form.confirm)` escrito no componente,
         * fora do padrão Chain of Responsibility que o Login já usava.
         * Benefícios:
         *   + Consistência
         *   + Coesão (validações juntas)
         *   + Reuso
         */
        const validationError = new PasswordConfirmationValidator().handle(form)
        if (validationError) {
            setError(validationError.message)
            return
        }

        try {
            setLoading(true)

            /*
             * ♻️ REFACTORING — Move Method + Extract Method (authService.registerAndLogin)
             * Antes: 25 linhas aqui chamando `api.post('/auth/register')`,
             * `api.post('/auth/login')` e `setAuthToken()` direto, ou seja,
             * a tela conhecia URLs e a mecânica do token.
             * Benefícios:
             *   - Acoplamento (tela não conhece mais o axios nem as URLs)
             *   - Duplicação (reusa o login do AuthService)
             *   + Coesão
             */
            const data = await authService.registerAndLogin(form)
            const destination = data?.token ? '/bands/select' : '/auth/login'
            navigate(destination, { replace: true })
        } catch (err) {
            setError(errorMessageFrom(err, 'Erro ao cadastrar. Verifique os dados.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sf-primary/20 via-transparent to-transparent pt-24">
            <AuthCard subtitle="Crie sua conta para começar a usar o ScaleFlow.">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nome completo" name="name" value={form.name} onChange={handleChange} />
                    <Input label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} />
                    <Input label="Senha" name="password" type="password" value={form.password} onChange={handleChange} />
                    <Input label="Confirmar senha" name="confirm" type="password" value={form.confirm} onChange={handleChange} />

                    <FormError message={error} />

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Criar conta'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-sf-muted">Já tem conta?</span>{' '}
                    <Link to="/auth/login" className="font-medium text-sf-primary hover:underline">
                        Entrar
                    </Link>
                </div>
            </AuthCard>
        </div>
    )
}
