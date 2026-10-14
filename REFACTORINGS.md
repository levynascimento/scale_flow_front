# Catálogo de Refactorings — ScaleFlow Frontend

Este documento lista **onde** cada refactoring da disciplina foi aplicado, **o que mudou** e **quais benefícios** trouxe.
No código, cada ponto está marcado com um comentário `♻️ REFACTORING — <nome>` contendo o "antes", o "agora" e os benefícios no formato:

```
Benefícios:
  + Coesão
  - Acoplamento
  - Duplicação
```

> `+` indica o que **aumentou** e `-` o que **diminuiu**.

---

## 1. Visão geral: de funções soltas para orientação a objetos

### Por que os componentes React continuam sendo funções

Em React moderno, componentes de **classe** (`class X extends React.Component`) são a API legada. Converter as telas para classes seria um retrocesso técnico.
A abordagem usada no mercado, e adotada aqui, é: **a lógica de negócio, de acesso a dados e de sessão vira classes**, e os componentes (funções) apenas **usam esses objetos**.

### Nova estrutura

```
src/
├── core/                      ← infraestrutura, sem React
│   ├── http/HttpClient.js         classe que encapsula o axios
│   ├── http/errorMessage.js
│   ├── session/AuthSession.js     dona do token JWT
│   ├── session/BandSession.js     dona da "banda atual" (id, papel, nome)
│   ├── validation/                Chain of Responsibility unificada
│   └── format/DateFormatter.js
├── domain/                    ← regras de negócio, sem React
│   ├── Event.js, EventFilter.js, EventStatePresenter.js
│   ├── Escalation.js, Lineup.js, LineupDraft.js
│   ├── Music.js, SkillLevel.js, MembershipRole.js, Paginator.js
├── services/                  ← uma classe por recurso da API
│   ├── BaseService.js             classe base (recebe o HttpClient)
│   ├── AuthService, BandService, EventService, EscalationService,
│   ├── HolyricsService, LineupService, MusicService, RoleService, UserService
│   └── index.js                   instâncias prontas (composição)
├── hooks/useAnimatedClose.js
├── components/  pages/        ← UI (funções React), agora mais finas
tests/                         ← 28 testes das classes (npm test)
```

### Conceitos de OO aplicados

| Conceito | Onde |
|---|---|
| **Herança** | Todos os `*Service` estendem `BaseService`; `EmailValidator`, `PasswordValidator`, `TitleValidator` e `ArtistValidator` estendem `RequiredFieldValidator`, que estende `ValidationHandler` |
| **Polimorfismo** | Cada `EventFilter` tem seu próprio `compare`; cada validador sobrescreve `validate()`/`handle()` |
| **Encapsulamento** | `localStorage` só é acessado dentro de `AuthSession` e `BandSession` (antes: 10 arquivos) |
| **Injeção de dependência** | Serviços recebem o `HttpClient` no construtor; sessões recebem o `storage` — por isso os testes usam objetos falsos |
| **Objetos de valor** | `MembershipRole`, `SkillLevel`, `EventFilter` |
| **Imutabilidade** | `LineupDraft` devolve um novo objeto a cada alteração |

---

## 2. Refactorings por tipo

### Extract Method
Trecho de código com um propósito claro vira uma função/componente com nome.

| Arquivo | O que foi extraído |
|---|---|
| `core/http/HttpClient.js` | `attachToken`, `handleError`, `isSessionExpired`, `onSessionExpired`; `request()` elimina ~60 repetições de `const { data } = await api...; return data` |
| `core/validation/ValidationHandler.js` | `chain(...)`, que monta a cadeia de validadores em uma linha |
| `core/validation/validators.js` | `valueOf`, `fail` |
| `core/http/errorMessage.js` | `errorMessageFrom` (repetido em Login e Register) |
| `core/session/BandSession.js` | `enter()` (o trio de `setItem` era repetido 3x em BandSelect) |
| `services/AuthService.js` | `registerAndLogin` |
| `services/EscalationService.js` | `roleQuery` (objeto de params repetido 3x) |
| `services/EventService.js` | `listByFilter` (substitui 4 funções quase iguais) |
| `domain/Event.js` | `nextUpcoming`, `escalationOf` |
| `domain/EventFilter.js` | `byStartAsc`, `byStartDesc`, `byRelevance` (antes: lambdas anônimas de 20 linhas) |
| `domain/Lineup.js` | `toPending` |
| `domain/LineupDraft.js` | `removedItems`, `addedItems` |
| `domain/Music.js` | `themesLabel`, `parseThemes` |
| `App.jsx` | `protectedPage()`, `adminOnly()` |
| `components/Button.jsx` | `overridesColor()` |
| `components/FieldError.jsx` | componentes `FieldError` e `FormError` (repetidos em 3 telas) |
| `components/layout/SidebarLink.jsx` | componente `SidebarLink` (6 blocos `NavLink` iguais) |
| `hooks/useAnimatedClose.js` | hook com a lógica de fechar com animação (duplicada em 2 modais) |
| `pages/auth/Login.jsx`, `RepertoireForm.jsx` | `inputClass(hasError)` |
| `pages/bands/BandSelect.jsx` | `openBand`, componente `FloatingNotes` |
| `pages/bands/BandSettings.jsx` | `displayedJoinCode` |
| `pages/bands/BandHome.jsx` | `loadDashboard`, `reloadEvents` |
| `pages/events/Events.jsx` | `closeForm`, `saveEvent` |
| `pages/events/EventFormModal.jsx` | `formFromEvent` |
| `pages/events/EventViewModal.jsx` | `runAndRefresh` (3 try/catch iguais viraram 1), componente `MusicInfo` |
| `pages/events/EventEscalationModal.jsx` | `saveEscalation`, `updatePending`, `changeDraftRole` |
| `pages/events/components/EscalationDraftForm.jsx` | componente que substitui 2 formulários de ~70 linhas quase idênticos |
| `pages/events/components/EventCard.jsx` | componente `CounterBadge` |
| `pages/events/components/SelectMusicModal.jsx` | `close()` |
| `pages/lineups/Lineups.jsx` | `openDetails`, `closeDeleteDialog` |
| `pages/repertoires/Repertoires.jsx` | `repertoirePath` |
| `pages/repertoires/RepertoireEdit.jsx` | componente `LabeledInput` |
| `pages/repertoires/MusicDifficultyModal.jsx` | componente `DifficultyRow`, `difficultyOf`, `startEditing` |
| `pages/roles/Roles.jsx` | `openFormFor` (unificou `handleOpenCreate` e `handleOpenEdit`) |
| `pages/roles/RoleFormModal.jsx` | `save()`, `parseRoleNames`, componente `ModeTab` |
| `pages/users/UserSettings.jsx` | `toLevelInputs`, `applySkills`, `validateNewSkill`, `hasSkill`, `roleNameBySlug`, `handleLevelTyping`, `handleLevelBlur`, componente `SettingsCard` |

**Benefícios típicos:** + Legibilidade · + Reuso · + Coesão · − Duplicação · + Testabilidade

---

### Inline Method
Função cujo corpo é tão claro quanto o nome vira a própria expressão.

| Arquivo | O que foi incorporado |
|---|---|
| `pages/events/Events.jsx` | `run()` dentro do `useEffect`, que só chamava `loadEvents()` |
| `pages/events/EventEscalationModal.jsx` | `getCurrentBandId()`, que só fazia `localStorage.getItem("bandId")` |
| `pages/roles/Roles.jsx` | `getFiltered()`, chamada uma única vez na linha seguinte |
| `services/BandService.js` | `getBandJoinCode()`, que tinha corpo **idêntico** a `getBandWithJoinCode()` |

**Benefícios:** − Indireção desnecessária · + Legibilidade · − Duplicação

---

### Extract Variable
Expressão complexa ganha um nome.

| Arquivo | Variável |
|---|---|
| `main.jsx` | `TOASTER_OPTIONS` (20 linhas de configuração tiradas do JSX) |
| `components/Input.jsx` | `INPUT_BASE_CLASS` |
| `components/RequireAdmin.jsx` | `fallbackPath` |
| `components/layout/BandLayout.jsx` | `NAV_ITEMS`, `visibleNavItems` |
| `pages/bands/BandSelect.jsx` | `CARD_CLASS`, `INPUT_CLASS` |
| `pages/bands/BandHome.jsx` | `upcomingCount` |
| `pages/events/EventViewModal.jsx` | botão único "Adicionar/Sugerir música" (antes: 2 blocos com `isAdmin`/`!isAdmin`) |
| `pages/repertoires/RepertoireEdit.jsx` | `themeName` (`newTheme.trim()` era calculado 3x) |
| `pages/roles/RoleFormModal.jsx` | `showSingle`, `showMulti`, `submitLabel` |
| `domain/Event.js` | `startDate` / `endDate` (`new Date(event.startingTime)` repetido ~10x) |
| `core/validation/validators.js` | `EMAIL_PATTERN` |

**Benefícios:** + Legibilidade · − Lógica no JSX · − Duplicação

---

### Inline Variable
Variável que não acrescenta significado (ou nem é usada) é removida.

| Arquivo | Variável |
|---|---|
| `components/ProtectedRoute.jsx` | estados `checking` e `authenticated` + `useEffect` (o `localStorage` é síncrono) |
| `components/Button.jsx` | `let finalStyle` mutável |
| `pages/bands/BandHome.jsx` | `membersCount`, `musicsCount` (eram só `lista.length`), `allIntegrants`, `allRoles` |
| `pages/bands/BandSettings.jsx` | `deleting` (atualizado, nunca lido) |
| `pages/users/UserSettings.jsx` | `deleting` (atualizado, nunca lido) |
| `pages/events/Events.jsx` | `today` (calculado a cada render, nunca usado) |
| `pages/events/EventEscalationModal.jsx` | `adding`, `selectedRole`, `selectedIntegrant` → um único `manualDraft` |
| `pages/lineups/Lineups.jsx` | `roles` (buscava `GET /roles` e nunca usava) |
| `pages/lineups/LineupCreateModal.jsx` | `loading` (nunca lido) e `role` dentro do `map` |
| `pages/lineups/LineupDetailsModal.jsx` | `roles = lineup?.roles ?? []` |

**Benefícios:** − Código morto · − Estado redundante · − Renders e requisições desnecessários

---

### Change Function Declaration
Mudança de nome ou de parâmetros de uma função para revelar a intenção.

| Antes | Depois | Motivo |
|---|---|---|
| `setAuthToken(token \| null)` | `saveToken(token)` / `clear()` | parâmetro "flag" fazia coisas opostas |
| `loginUser()` | `authService.login()` | o contexto já é a classe |
| `getBands()`, `getBandById()`, `createBand()`... | `bandService.list()`, `getById()`, `create()` | nomes sem redundância |
| `getPriorityList(roleId, bandId)` | `getPriorityList(roleSlug, bandId)` | o valor enviado era o **slug**, não o id |
| `updateLineupName(id, { name })` | `rename(id, name)` | a função passa a receber o que o nome promete |
| `createSuggestion()` | `suggestMusic()` | descreve a ação do usuário |
| `updateMusicInfo()` | `update()` | consistência com os outros serviços |
| `getUserHabilities()`... | `listSkills()`, `addSkill()`... | "hability" não existe em inglês |
| `getPriorityOnlyIntegrants()` | `integrantsAllowedFor()` | o nome descreve o resultado |
| `toInputValue()` | `DateFormatter.toDateTimeInput()` | diz para qual input serve |
| `EventFilterBar` (`onChange("now")`) | `onChange(EventFilter.NOW)` | objeto no lugar de *magic string* |
| `SelectMusicModal` | prop `onResetSearch` removida | nunca foi lida pelo componente |

**Benefícios:** + Legibilidade · − Bugs por uso incorreto · − Magic strings

---

### Rename Variable
| Arquivo | Antes → Depois |
|---|---|
| `components/layout/BandLayout.jsx` | `role` → `membership` (colidia com os "papéis" musicais) |
| `pages/repertoires/Repertoires.jsx` | `selectedMusic` → `musicToDelete` |
| `pages/users/UserSettings.jsx` | `habilities` → `skills`, `newRole` → `newRoleSlug` |
| `services/EscalationService.js` | parâmetro `roleId` → `roleSlug` |

**Benefícios:** + Legibilidade · − Ambiguidade

---

### Rename Field
| Arquivo | Antes → Depois |
|---|---|
| `core/session/BandSession.js` | `"bandRole"` (string comparada à mão) → campo `membershipRole` (objeto `MembershipRole`) |

**Benefícios:** + Legibilidade · + Expressividade do domínio · − Ambiguidade

---

### Move Method
Método que usa mais dados de outra classe vai para ela (combate o *Feature Envy*).

| De | Para |
|---|---|
| `utils/authUtils.logoutUser()` | `AuthSession.endSession()` |
| `BandLayout.leaveBand()` (localStorage) | `BandSession.leave()` |
| `EventCard.getEventState()` | `Event.state` |
| `EventCard.formatDateTime()` | `DateFormatter.short()` |
| `EventFormModal.toInputValue()` | `DateFormatter.toDateTimeInput()` |
| sort de `Events.loadEvents()` | `EventFilter` (cada filtro sabe ordenar) |
| busca de escalação em `BandHome` | `Event.escalationOf()` / `isUserEscalated()` |
| ordenação em `EventEscalationModal` | `Escalation.sortByRoleThenUser()` |
| `EventEscalationModal.applyFormationAsSuggestions` (parte de cálculo) | `Lineup.toPendingEscalations()` |
| diff e chamadas de `LineupEditModal.handleSaveRoles` | `LineupDraft` + `LineupService.applyDraft()` |
| filtro de busca do `SelectMusicModal` | `Music.matches()` |
| ordenação de `Roles.loadRoles` | `RoleService.listSortedByName()` |
| `api.post('/auth/register')` dentro de `Register.jsx` | `AuthService.register()` |
| `eventApi.importHolyricsEvents` (duplicada) | `HolyricsService.importEvents()` |
| `if (password !== confirm)` em `Register.jsx` | `PasswordConfirmationValidator` |
| checagem `role === "ADMIN"` (4 arquivos) | `BandSession.isAdmin` |
| `localStorage.clear()` em `UserSettings` | `bandSession.leave()` + `authSession.endSession()` |

**Benefícios:** + Coesão · − Acoplamento · − Feature Envy · + Testabilidade

---

### Move Field
| De | Para |
|---|---|
| `window.localStorage` usado globalmente | campo `storage` das sessões (injetável) |
| campo do erro **deduzido do texto** (`msg.includes("e-mail")`) | `ValidationError.field` |
| array `options` dentro de `EventFilterBar` | `EventFilter.values()` |
| `base`/`styles` recriados a cada render em `Button` | constantes do módulo |
| regex local em `EmailValidator.handle()` | campo estático `EMAIL_PATTERN` |

**Benefícios:** + Encapsulamento · + Robustez · + Coesão

---

### Extract Class
Responsabilidade espalhada ganha uma classe própria.

| Classe nova | Responsabilidade que antes estava espalhada |
|---|---|
| `HttpClient` | axios + token + interceptor (`services/api.js`) |
| `AuthSession` | token em 5 arquivos |
| `BandSession` | `bandId`/`bandRole`/`bandName` em 7 arquivos |
| `BaseService` + 9 serviços | 11 arquivos `*Api.js` com funções soltas |
| `RequiredFieldValidator` | checagem "obrigatório" duplicada em 4 validadores |
| `DateFormatter` | 4 jeitos diferentes de formatar data |
| `Event` | regras de data/estado em EventCard, Events e BandHome |
| `EventFilter` | 2 if/else sobre a string do filtro em Events |
| `EventStatePresenter` | `getCardColor` + `getBadge` com o mesmo if/else |
| `MembershipRole` | ternários aninhados em BandLayout e BandSelect |
| `Lineup` | navegação pelos dados da formação no modal de escalação |
| `LineupDraft` | estados paralelos `items`/`draftItems` no modal de edição |
| `Music` | busca, rótulo e parse de temas em 3 telas |
| `SkillLevel` | regra 0–10 repetida 3x (e ausente no modal de dificuldade) |
| `Paginator` | 4 variáveis de paginação soltas em Roles |
| `MODES` (`SelectMusicModal`) | 4 ternários `isSuggestion ? ... : ...` |

**Benefícios:** + Coesão · + Encapsulamento · − Duplicação · + Testabilidade · + Extensibilidade

---

### Inline Class
Classe/módulo sem responsabilidade própria é absorvido por outro.

| Classe removida | Absorvida por | Motivo |
|---|---|---|
| `services/integrantsApi.js` | `BandService.listMembers()` | arquivo inteiro com **uma** função, idêntica a `getBandMembers()` |
| `Handler` (`musicValidationChain.js`) | `ValidationHandler` | era uma cópia exata de `LoginValidator` |

**Benefícios:** − Duplicação · − Indireção · + Coesão

---

## 3. Refactorings complementares (fora da lista da disciplina)

Marcados no código como **"refactoring complementar"**, para não confundir com os da lista:

- `EventFormModal.jsx`: 4 `useState` que mudavam juntos viraram um objeto `form` (tratamento de *Data Clump*, parente do *Introduce Parameter Object*).
- `RoleFormModal.jsx`: *Consolidate Duplicate Conditional Fragments* no `useEffect`.

---

## 4. Bugs encontrados durante o refactoring

Refatorar com atenção costuma revelar defeitos. Estes foram corrigidos e estão comentados no código:

| Onde | Problema | Correção |
|---|---|---|
| `BandLayout` ("Sair da Banda") | removia a chave `currentBand`, que não existe; a banda nunca era esquecida | `BandSession.leave()` apaga as chaves corretas |
| `BandHome` ("Você está escalado em") | lia `localStorage.getItem("userId")`, mas **nenhuma tela grava essa chave**; o bloco ficava sempre vazio | o id vem de `GET /users` |
| `LineupEditModal` (botão "+") | `roles.find(r => r.id === newRole)` comparava número com a string do `<select>`; o papel nunca era adicionado | comparação por `String` em `LineupDraft.addRole` |
| 3 modais de formação | usavam `toast` do **react-toastify**, mas o app só monta o `<Toaster>` do **react-hot-toast**; nenhum aviso aparecia | unificado em react-hot-toast |
| `MusicDifficultyModal` | salvava `Number(input)` sem validar (vazio virava 0; 99 era aceito) | usa `SkillLevel.parse` (0–10) |
| `BandHome` | buscava `/bands/{id}/integrants` **duas vezes** (via `getBandMembers` e `getBandIntegrants`) | uma chamada só, e as 6 requisições agora rodam em paralelo |

---

## 5. Arquivos sem refactoring

- `components/AuthCard.jsx` e `components/ConfirmDialog.jsx`: já estavam pequenos, coesos e sem duplicação. Nenhum refactoring da lista traria benefício.
- `components/Unauthorized.jsx`: **não é usado em nenhuma rota**. Foi mantido para você decidir se remove (seria *Remove Dead Code*, que não está na lista).

---

## 6. Como verificar

```bash
npm install
npm test        # 28 testes das classes de domínio, validação, sessões e serviços
npm run dev
```

Os testes usam o *test runner* nativo do Node (sem dependências novas). Os serviços são testados com um `HttpClient` falso, o que só é possível porque eles recebem o cliente pelo construtor.
