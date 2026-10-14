import { httpClient } from '../core/http/HttpClient.js'
import { authSession } from '../core/session/AuthSession.js'

import { AuthService } from './AuthService.js'
import { BandService } from './BandService.js'
import { EventService } from './EventService.js'
import { EscalationService } from './EscalationService.js'
import { HolyricsService } from './HolyricsService.js'
import { LineupService } from './LineupService.js'
import { MusicService } from './MusicService.js'
import { RoleService } from './RoleService.js'
import { UserService } from './UserService.js'

/*
 * Ponto único de composição: aqui as dependências são "ligadas".
 * Os componentes importam as instâncias prontas; os testes podem criar as
 * classes com um HttpClient falso.
 */
export const authService = new AuthService(httpClient, authSession)
export const bandService = new BandService(httpClient)
export const eventService = new EventService(httpClient)
export const escalationService = new EscalationService(httpClient)
export const holyricsService = new HolyricsService(httpClient)
export const lineupService = new LineupService(httpClient)
export const musicService = new MusicService(httpClient)
export const roleService = new RoleService(httpClient)
export const userService = new UserService(httpClient)
