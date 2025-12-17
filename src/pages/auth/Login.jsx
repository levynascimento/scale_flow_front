import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import AuthCard from '../../components/AuthCard.jsx'
import { loginUser } from '../../services/authApi.js'
import toast from 'react-hot-toast'
import { EmailValidator, PasswordValidator } from '../../utils/loginValidationChain.js'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setErrors({})

        // 🧩 Cria a cadeia de validadores
        const emailValidator = new EmailValidator()
        const passwordValidator = new PasswordValidator()
        emailValidator.setNext(passwordValidator)

        // 🧠 Executa as validações
        const validationError = emailValidator.handle({ email, password })

        if (validationError) {
            if (validationError.toLowerCase().includes('e-mail')) {
                setErrors({ email: validationError })
            } else if (validationError.toLowerCase().includes('senha')) {
                setErrors({ password: validationError })
            } else {
                setErrors({ general: validationError })
            }
            return
        }

        try {
            setLoading(true)
            await loginUser({ email, password })
            toast.success('Login realizado com sucesso!')
            navigate('/bands/select', { replace: true })
        } catch (err) {
            console.error(err)
            const msg =
                err?.response?.data?.message ||
                'Credenciais inválidas ou erro no servidor.'
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
                    {/* Campo de e-mail */}
                    <div>
                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="voce@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full border rounded-lg p-2 ${
                                errors.email
                                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-500/30'
                                    : 'border-[#3a3a3f] focus:ring-[#7c5fff]'
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Campo de senha */}
                    <div>
                        <Input
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full border rounded-lg p-2 ${
                                errors.password
                                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-500/30'
                                    : 'border-[#3a3a3f] focus:ring-[#7c5fff]'
                            }`}
                        />
                        {errors.password && (
                            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Erro geral */}
                    {errors.general && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {errors.general}
                        </div>
                    )}

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-sf-muted">Não tem conta?</span>{' '}
                    <Link
                        to="/auth/register"
                        className="font-medium text-sf-primary hover:underline"
                    >
                        Cadastre-se
                    </Link>
                </div>
            </AuthCard>
        </div>
    )
}
