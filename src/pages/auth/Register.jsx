import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/Input.jsx'
import Button from '../../components/Button.jsx'
import AuthCard from '../../components/AuthCard.jsx'
import api, {  setAuthToken } from '../../services/api.js'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirm: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value })

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (form.password !== form.confirm) {
            setError('As senhas não coincidem.')
            return
        }

        try {
            setLoading(true)

            // cadastro
            await api.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password
            })

            // login automático
            const { data } = await api.post('/auth/login', {
                email: form.email,
                password: form.password
            })

            if (data?.token) {
                setAuthToken(data.token)
                navigate('/bands/select', { replace: true }) // redireciona pro seletor de bandas
            } else {
                navigate('/auth/login', { replace: true })
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Erro ao cadastrar. Verifique os dados.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sf-primary/20 via-transparent to-transparent pt-24">
            <AuthCard subtitle="Crie sua conta para começar a usar o ScaleFlow.">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome completo"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <Input
                        label="Senha"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <Input
                        label="Confirmar senha"
                        name="confirm"
                        type="password"
                        value={form.confirm}
                        onChange={handleChange}
                    />

                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Criar conta'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-sf-muted">Já tem conta?</span>{' '}
                    <Link
                        to="/auth/login"
                        className="font-medium text-sf-primary hover:underline"
                    >
                        Entrar
                    </Link>
                </div>
            </AuthCard>
        </div>
    )
}
