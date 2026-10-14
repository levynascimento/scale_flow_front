import { Event } from './Event.js'

/*
 * ♻️ REFACTORING — Extract Class (EventStatePresenter)
 * Antes: EventCard.jsx tinha getCardColor(state) e getBadge(state), duas
 * funções com o MESMO if/else sobre o estado do evento, cada uma devolvendo
 * um pedaço da aparência.
 * Agora: uma tabela única liga cada estado à sua aparência completa.
 * Benefícios:
 *   - Duplicação (um único "switch" em vez de dois)
 *   + Coesão (toda a aparência de um estado fica junta)
 *   - Acoplamento (o modelo Event não conhece classes CSS)
 */
export class EventStatePresenter {
    static STYLES = {
        [Event.STATE.PAST]: {
            cardClass: 'bg-[#2e1b1b] border-[#472525]',
            badgeClass: 'bg-red-800/40 text-red-300 border-red-700/40',
            badgeLabel: '🔴 Passado'
        },
        [Event.STATE.NOW]: {
            cardClass: 'bg-[#1b2e1b] border-[#254725]',
            badgeClass: 'bg-green-800/40 text-green-300 border-green-700/40',
            badgeLabel: '🟢 Agora'
        },
        [Event.STATE.FUTURE]: {
            cardClass: 'bg-[#1b1b2e] border-[#252547]',
            badgeClass: 'bg-blue-800/40 text-blue-300 border-blue-700/40',
            badgeLabel: '🔵 Futuro'
        }
    }

    static for(event) {
        return EventStatePresenter.STYLES[event.state]
    }
}
