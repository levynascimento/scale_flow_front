// Testes de validação, sessões e serviços.
// Os serviços são testados com um HttpClient FALSO, o que só é possível porque
// eles recebem o cliente HTTP pelo construtor (♻️ Extract Class BaseService).
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { ValidationHandler, ValidationError } from '../src/core/validation/ValidationHandler.js'
import {
    EmailValidator, PasswordValidator, PasswordConfirmationValidator, TitleValidator, ArtistValidator
} from '../src/core/validation/validators.js'
import { AuthSession } from '../src/core/session/AuthSession.js'
import { BandSession } from '../src/core/session/BandSession.js'
import { DateFormatter } from '../src/core/format/DateFormatter.js'
import { errorMessageFrom } from '../src/core/http/errorMessage.js'
import { AuthService } from '../src/services/AuthService.js'
import { BandService } from '../src/services/BandService.js'
import { EventService } from '../src/services/EventService.js'
import { EscalationService } from '../src/services/EscalationService.js'
import { LineupService } from '../src/services/LineupService.js'
import { RoleService } from '../src/services/RoleService.js'
import { EventFilter } from '../src/domain/EventFilter.js'
import { Event } from '../src/domain/Event.js'
import { LineupDraft } from '../src/domain/LineupDraft.js'
import { MemoryStorage } from './MemoryStorage.js'

// HttpClient falso: grava as chamadas e devolve respostas programadas.
class FakeHttp {
    constructor(responses = {}) {
        this.calls = []
        this.responses = responses
    }
    record(method, url, body, options) {
        this.calls.push({ method, url, body, options })
        return Promise.resolve(this.responses[`${method} ${url}`])
    }
    get(url, options) { return this.record('get', url, undefined, options) }
    post(url, body, options) { return this.record('post', url, body, options) }
    put(url, body, options) { return this.record('put', url, body, options) }
    delete(url, options) { return this.record('delete', url, undefined, options) }
}

const loginChain = () => ValidationHandler.chain(new EmailValidator(), new PasswordValidator())

test('cadeia de login: o erro já vem com o campo (fim do includes("e-mail"))', () => {
    assert.deepEqual(loginChain().handle({ email: '', password: '' }).toFieldErrors(), { email: 'O campo de e-mail é obrigatório.' })
    assert.equal(loginChain().handle({ email: 'x@', password: '123456' }).field, 'email')
    assert.equal(loginChain().handle({ email: 'a@b.co', password: '   ' }).message, 'A senha é obrigatória.')
    assert.equal(loginChain().handle({ email: 'a@b.co', password: '123' }).field, 'password')
    assert.equal(loginChain().handle({ email: 'a@b.co', password: '123456' }), null)
})

test('cadeia de música e confirmação de senha', () => {
    const music = ValidationHandler.chain(new TitleValidator(), new ArtistValidator())
    assert.equal(music.handle({ title: ' ', artist: 'x' }).field, 'title')
    assert.equal(music.handle({ title: 'x', artist: '' }).field, 'artist')
    assert.equal(music.handle({ title: 'x', artist: 'y' }), null)

    const confirm = new PasswordConfirmationValidator()
    assert.ok(confirm.handle({ password: 'a', confirm: 'b' }) instanceof ValidationError)
    assert.equal(confirm.handle({ password: 'a', confirm: 'a' }), null)
})

test('AuthSession guarda e limpa o token', () => {
    const session = new AuthSession(new MemoryStorage())
    assert.equal(session.isAuthenticated(), false)
    session.saveToken('abc')
    assert.equal(session.getToken(), 'abc')
    assert.ok(session.isAuthenticated())
    session.clear()
    assert.equal(session.isAuthenticated(), false)
})

test('BandSession: enter, isAdmin e leave (apaga as chaves certas)', () => {
    const storage = new MemoryStorage()
    const band = new BandSession(storage)
    band.enter({ id: 5, role: 'ADMIN', name: 'Louvor' })
    assert.equal(band.bandId, '5')
    assert.equal(band.bandName, 'Louvor')
    assert.ok(band.isAdmin)
    band.leave()
    assert.equal(band.bandId, null)
    assert.equal(band.isAdmin, false)
    assert.equal(storage.data.size, 0)
})

test('DateFormatter', () => {
    assert.equal(DateFormatter.toDateTimeInput('2026-10-14T19:30:00Z'), '2026-10-14T19:30')
    assert.equal(DateFormatter.toDateTimeInput(null), '')
    assert.equal(DateFormatter.short(null), '-')
    assert.match(DateFormatter.range('2026-01-01T10:00:00', '2026-01-01T12:00:00'), / → /)
})

test('errorMessageFrom usa a mensagem do backend ou o fallback', () => {
    assert.equal(errorMessageFrom({ response: { data: { message: 'x' } } }, 'fb'), 'x')
    assert.equal(errorMessageFrom(new Error('boom'), 'fb'), 'fb')
})

test('AuthService.login salva o token UMA vez na sessão; registerAndLogin encadeia', async () => {
    const session = new AuthSession(new MemoryStorage())
    const http = new FakeHttp({ 'post /auth/login': { token: 't1' } })
    const auth = new AuthService(http, session)

    await auth.registerAndLogin({ name: 'Ana', email: 'a@b.co', password: '123456', confirm: '123456' })
    assert.deepEqual(http.calls.map(c => `${c.method} ${c.url}`), ['post /auth/register', 'post /auth/login'])
    assert.deepEqual(http.calls[0].body, { name: 'Ana', email: 'a@b.co', password: '123456' }) // sem "confirm"
    assert.equal(session.getToken(), 't1')
})

test('BandService.listMembers (Inline Class de integrantsApi) usa /integrants', async () => {
    const http = new FakeHttp()
    await new BandService(http).listMembers(3)
    assert.equal(http.calls[0].url, '/bands/3/integrants')
})

test('EventService.listByFilter escolhe o endpoint, cria Events e ordena', async () => {
    const http = new FakeHttp({
        'get /bands/1/events/past': [
            { id: 'a', startingTime: '2020-01-01T10:00:00Z', endingTime: '2020-01-01T11:00:00Z' },
            { id: 'b', startingTime: '2021-01-01T10:00:00Z', endingTime: '2021-01-01T11:00:00Z' }
        ]
    })
    const events = await new EventService(http).listByFilter(1, EventFilter.PAST)
    assert.equal(http.calls[0].url, '/bands/1/events/past')
    assert.ok(events[0] instanceof Event)
    assert.deepEqual(events.map(e => e.id), ['b', 'a'])
})

test('EscalationService manda roleSlug (antes o parâmetro se chamava roleId)', async () => {
    const http = new FakeHttp()
    await new EscalationService(http).getPriorityList('guitarra', 9)
    assert.deepEqual(http.calls[0].options, { params: { roleSlug: 'guitarra', bandId: 9 } })
})

test('LineupService.applyDraft remove e depois adiciona', async () => {
    const http = new FakeHttp()
    const roles = [{ id: 1, name: 'Voz' }]
    const draft = LineupDraft.of([{ id: 'lr9', role: { id: 2 } }]).removeItem('lr9').addRole('1', roles)
    await new LineupService(http).applyDraft(4, draft)
    assert.deepEqual(
        http.calls.map(c => `${c.method} ${c.url} ${JSON.stringify(c.body ?? null)}`),
        ['delete /lineups-roles/lr9 null', 'post /lineups/4/roles {"roleId":1}']
    )
})

test('RoleService: ordenação e buscas estáticas', async () => {
    const http = new FakeHttp({ 'get /roles': [{ name: 'Voz', slug: 'voz', id: 2 }, { name: 'Baixo', slug: 'baixo', id: 1 }] })
    const sorted = await new RoleService(http).listSortedByName()
    assert.deepEqual(sorted.map(r => r.name), ['Baixo', 'Voz'])
    assert.equal(RoleService.findBySlug(sorted, 'voz').id, 2)
    assert.equal(RoleService.findById(sorted, '1').name, 'Baixo')
})
