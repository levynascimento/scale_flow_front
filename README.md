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

## Rodar localmente

npm install
npm run dev

Certifique-se que o backend está rodando em http://localhost:8080
ou defina um .env com:
VITE_API_BASE_URL=http://localhost:8080
