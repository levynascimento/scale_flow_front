# ScaleFlow Frontend v4

## O que tem nessa versão

- Login e Cadastro integrados ao backend (/auth/login e /auth/register).
- Armazenamento de token JWT + rota protegida.
- Sidebar / Header / Layout escuro roxo.
- Dashboard protegido.
- Bandas:
  - Listar bandas do usuário
  - Criar banda
  - Ver detalhes da banda
  - Adicionar integrante por username
  - Ir direto pro repertório da banda
- Repertório da banda:
  - Listar músicas de uma banda
  - Criar nova música
  - Remover música

## Arquitetura (refatorada)

O projeto foi refatorado para orientação a objetos. A lógica de negócio, de
sessão e de acesso à API está em classes; os componentes React usam esses
objetos. Veja o catálogo completo em [REFACTORINGS.md](REFACTORINGS.md).

- `src/core/`: `HttpClient`, `AuthSession`, `BandSession`, validação e formatação
- `src/domain/`: modelos e regras (`Event`, `EventFilter`, `Lineup`, `Music`...)
- `src/services/`: uma classe por recurso da API, todas herdando de `BaseService`
- `tests/`: testes das classes (`npm test`)

## Rodar localmente

npm install
npm run dev

## Testes

npm test

Certifique-se que o backend está rodando em http://localhost:8080
ou defina um .env com:
VITE_API_BASE_URL=http://localhost:8080
