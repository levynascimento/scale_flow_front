// Testes das classes de domínio. Rodam com o test runner nativo do Node:
//   npm test
// Nenhuma dependência extra: só existem porque a lógica saiu dos componentes
// React e foi para classes (Extract Class / Move Method).
import { test } from 'node:test'
import assert from 'node:assert/strict'

import { Event } from '../src/domain/Event.js'
import { EventFilter } from '../src/domain/EventFilter.js'
import { EventStatePresenter } from '../src/domain/EventStatePresenter.js'
import { Escalation } from '../src/domain/Escalation.js'
import { Lineup } from '../src/domain/Lineup.js'
import { LineupDraft } from '../src/domain/LineupDraft.js'
import { Music } from '../src/domain/Music.js'
import { SkillLevel } from '../src/domain/SkillLevel.js'
import { Paginator } from '../src/domain/Paginator.js'
import { MembershipRole } from '../src/domain/MembershipRole.js'

const HOUR = 60 * 60 * 1000
const at = offsetHours => new Date(Date.now() + offsetHours * HOUR).toISOString()
const event = (id, startH, endH, extra = {}) =>
    new Event({ id, name: `E${id}`, startingTime: at(startH), endingTime: at(endH), ...extra })

test('Event.state classifica passado, agora e futuro', () => {
    assert.equal(event(1, -5, -3).state, Event.STATE.PAST)
    assert.equal(event(2, -1, 1).state, Event.STATE.NOW)
    assert.equal(event(3, 2, 4).state, Event.STATE.FUTURE)
})

test('Event.nextUpcoming devolve o futuro mais próximo', () => {
    const events = [event(1, 10, 11), event(2, -1, 1), event(3, 3, 4)]
    assert.equal(Event.nextUpcoming(events).id, 3)
    assert.equal(Event.nextUpcoming([event(1, -3, -2)]), undefined)
})

test('Event.escalationOf compara ids como string', () => {
    const e = event(1, 1, 2, { escalations: [{ user: { id: 7 }, role: { name: 'Baixo' } }] })
    assert.equal(e.escalationOf('7').role.name, 'Baixo')
    assert.equal(e.isUserEscalated(8), false)
    assert.equal(event(2, 1, 2).isUserEscalated(7), false) // sem escalations
})

test('Event.with mantém a classe (o spread antigo perdia os métodos)', () => {
    const updated = event(1, 1, 2).with({ suggestionsCount: 3 })
    assert.ok(updated instanceof Event)
    assert.equal(updated.suggestionsCount, 3)
    assert.equal(updated.state, Event.STATE.FUTURE)
})

test('Event e Lineup ignoram campos do backend com nome de getter', () => {
    const e = new Event({ id: 1, startingTime: at(1), endingTime: at(2), state: 'xyz', formattedRange: 'x' })
    assert.equal(e.state, Event.STATE.FUTURE)
    assert.equal(new Lineup({ roles: [{}], roleCount: 99 }).roleCount, 1)
})

test('EventFilter.ALL ordena: agora → próximos (asc) → encerrados (desc)', () => {
    const events = [event('old', -50, -49), event('soon', 1, 2), event('now', -1, 1), event('later', 5, 6), event('recent', -5, -4)]
    const ids = EventFilter.ALL.sort(events).map(e => e.id)
    assert.deepEqual(ids, ['now', 'soon', 'later', 'recent', 'old'])
})

test('EventFilter.PAST ordena do mais recente para o mais antigo e não muta a entrada', () => {
    const input = [event('a', -50, -49), event('b', -5, -4)]
    assert.deepEqual(EventFilter.PAST.sort(input).map(e => e.id), ['b', 'a'])
    assert.equal(input[0].id, 'a')
})

test('EventFilter expõe os 4 filtros com rótulos e endpoints', () => {
    assert.deepEqual(EventFilter.values().map(f => f.key), ['now', 'future', 'past', 'all'])
    assert.equal(EventFilter.ALL.pathSuffix, '')
    assert.equal(EventFilter.NOW.pathSuffix, '/now')
})

test('EventStatePresenter tem estilo para cada estado', () => {
    assert.match(EventStatePresenter.for(event(1, -5, -3)).badgeLabel, /Passado/)
    assert.match(EventStatePresenter.for(event(2, -1, 1)).badgeLabel, /Agora/)
    assert.match(EventStatePresenter.for(event(3, 2, 3)).badgeLabel, /Futuro/)
})

test('Escalation.sortByRoleThenUser ordena por papel e depois por nome', () => {
    const list = [
        { id: 1, role: { name: 'Voz' }, user: { name: 'Ana' } },
        { id: 2, role: { name: 'Baixo' }, user: { name: 'Zé' } },
        { id: 3, role: { name: 'Baixo' }, user: { name: 'Bia' } }
    ]
    assert.deepEqual(Escalation.sortByRoleThenUser(list).map(e => e.id), [3, 2, 1])
    assert.deepEqual(Escalation.sortByRoleThenUser(null), [])
})

test('Lineup.toPendingEscalations ignora papéis já escalados e já pendentes', () => {
    const lineup = Lineup.from({
        name: 'Domingo',
        roles: [{ role: { id: 1, name: 'Voz' } }, { role: { id: 2, name: 'Guitarra' } }, { role: { id: 2, name: 'Guitarra' } }, { role: null }]
    })
    const firstRound = lineup.toPendingEscalations([{ role: { id: 1 } }], [])
    assert.deepEqual(firstRound.map(p => p._key), ['2|1', '2|2']) // 2 guitarras, voz já escalada
    assert.equal(lineup.toPendingEscalations([{ role: { id: 1 } }], firstRound).length, 0)
    assert.equal(Lineup.from(null), null)
})

test('LineupDraft: adiciona com id em string (bug antigo), remove e calcula o diff', () => {
    const roles = [{ id: 10, name: 'Voz' }, { id: 20, name: 'Bateria' }]
    const original = [{ id: 'lr1', role: roles[0] }]
    const draft = LineupDraft.of(original)
        .addRole('20', roles) // <select> entrega string; o código antigo comparava com ===
        .removeItem('lr1')

    assert.deepEqual(draft.removedItems().map(i => i.id), ['lr1'])
    assert.deepEqual(draft.addedItems().map(i => i.role.name), ['Bateria'])
    assert.equal(draft.addRole('999', roles), draft) // papel inexistente: nada muda
    assert.equal(original.length, 1) // imutável
})

test('Music: busca, rótulo de temas e parse de temas', () => {
    const m = { title: 'Graça Infinita', artist: 'Fulano', themes: [{ name: 'Louvor' }, { name: 'Adoração' }] }
    assert.ok(Music.matches(m, 'graça'))
    assert.ok(Music.matches(m, 'FULANO'))
    assert.ok(!Music.matches(m, 'rock'))
    assert.equal(Music.themesLabel(m), 'Louvor, Adoração')
    assert.equal(Music.themesLabel({}), '—')
    assert.deepEqual(Music.parseThemes(' a, ,b ,c'), ['a', 'b', 'c'])
})

test('SkillLevel valida o intervalo 0–10', () => {
    assert.equal(SkillLevel.parse('0'), 0)
    assert.equal(SkillLevel.parse('10'), 10)
    assert.equal(SkillLevel.parse('11'), null)
    assert.equal(SkillLevel.parse(''), null)
    assert.equal(SkillLevel.parse('2.5'), null)
    assert.ok(SkillLevel.isTypingAllowed(''))
    assert.ok(SkillLevel.isTypingAllowed('12'))
    assert.ok(!SkillLevel.isTypingAllowed('123'))
    assert.ok(!SkillLevel.isTypingAllowed('a'))
})

test('Paginator calcula páginas e limita a página pedida', () => {
    const items = Array.from({ length: 23 }, (_, i) => i)
    const p = new Paginator(items, 10, 3)
    assert.equal(p.totalPages, 3)
    assert.deepEqual(p.pageItems, [20, 21, 22])
    assert.ok(p.hasPrevious && !p.hasNext)
    assert.equal(p.nextPage(), 3)
    assert.equal(new Paginator(items, 10, 99).currentPage, 3)
    assert.equal(new Paginator([], 10, 1).totalPages, 1)
    assert.ok(!new Paginator([1, 2], 10, 1).needsPagination)
})

test('MembershipRole traduz os tipos e cai em UNKNOWN', () => {
    assert.equal(MembershipRole.from('ADMIN').label, 'Administrador')
    assert.ok(MembershipRole.from('ADMIN').isAdmin)
    assert.equal(MembershipRole.from('MEMBER').label, 'Membro')
    assert.equal(MembershipRole.from('OBSERVER').label, 'Observador')
    assert.equal(MembershipRole.from('xyz'), MembershipRole.UNKNOWN)
    assert.ok(!MembershipRole.from(null).isAdmin)
})
