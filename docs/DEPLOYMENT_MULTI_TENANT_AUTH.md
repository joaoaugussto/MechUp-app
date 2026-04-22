## Objetivo

Publicar o app com:

- **Um único banco Postgres**
- **Várias oficinas (tenants) no mesmo banco**
- **Dados isolados por `shopId`**
- **Login com usuário/senha**
- **Token JWT contendo `shopId`** (o backend usa isso para filtrar tudo)

---

## Passo a passo (banco + backend)

### 1) Criar banco Postgres

- Crie um Postgres (Neon/RDS/etc.).
- Pegue a connection string.

### 2) Configurar variáveis do backend

No servidor (produção), defina:

- `DATABASE_URL`: conexão do Postgres
- `SETUP_SECRET`: segredo para provisionar oficinas/usuários iniciais
- `JWT_SECRET`: segredo para assinar/verificar JWT

Exemplo (ver `.env.example`):

- `DATABASE_URL="postgresql://..."`
- `SETUP_SECRET="..."` (**forte**)
- `JWT_SECRET="..."` (**forte**)

### 3) Migrations do Prisma

O schema do Prisma fica em:

- `server/prisma/schema.prisma`

Comandos úteis:

- Gerar client:
  - `npm run prisma:generate`
- Aplicar migrations (produção):
  - `npm run db:migrate`

As migrations ficam em:

- `server/prisma/migrations/*`

### 4) Subir o backend

- `npx ts-node server/index.ts`

O backend expõe:

- `POST /api/shops` (provisionamento de oficina)
- `POST /api/auth/register` (provisionamento do 1º usuário)
- `POST /api/auth/login` (login)
- `GET /api/auth/me` (perfil)
- `GET /api/admin/shops` (listar oficinas + métricas)
- `PATCH /api/admin/shops/:id/active` (ativar/inativar oficina)
- `POST /api/admin/shops/:id/users` (criar mais usuários na mesma oficina)
- `POST /api/admin/shops/:id/reset-password` (resetar senha de usuário da oficina)
- `GET/POST/PUT/DELETE /api/clientes`
- `GET/POST/PUT/DELETE /api/cars`
- `GET/POST/PUT/DELETE /api/services`

> Observação: `/api/clientes`, `/api/cars`, `/api/services` exigem `Authorization: Bearer <JWT>`.

---

## Provisionamento de uma nova oficina (tenant)

### 1) Criar oficina

Requisição:

- `POST /api/shops`
- header: `x-setup-secret: <SETUP_SECRET>`
- body: `{ "name": "Oficina X" }`

Resposta:

- `apiKey` da oficina (guarde)

### 2) Criar o primeiro usuário da oficina

Requisição:

- `POST /api/auth/register`
- header: `x-setup-secret: <SETUP_SECRET>`
- body:
  - `shopApiKey`: `<apiKey da oficina>`
  - `name`, `email`, `password`

### 3) Fazer login e obter JWT

Requisição:

- `POST /api/auth/login`
- body:
  - `shopApiKey`
  - `email`
  - `password`

Resposta:

- `token` (JWT)

---

## App (Expo)

### Fluxo do app

- O app abre em `app/login.tsx` quando não há token salvo.
- A partir do login existe o atalho `Criar nova oficina (admin)` para `app/onboarding.tsx`.
- A partir do login existe o atalho `Painel administrativo (sócio)` para `app/admin.tsx`.
- O onboarding cria `Shop` + primeiro `User` e mostra a `shopApiKey`.
- O onboarding valida campos (secret, nome, e-mail válido, senha mínima).
- Após criar oficina, há ações de:
  - copiar `shopApiKey`
  - compartilhar dados por WhatsApp
  - compartilhar dados por e-mail
- Após login, o token JWT é salvo com `expo-secure-store`.
- O `AuthProvider` carrega o token no boot e valida com `GET /api/auth/me`.
- Sem token válido, as telas internas redirecionam para `/login`.
- Em "Mais" existe ação de logout que remove token seguro e volta ao login.

### Painel administrativo (`app/admin.tsx`)

- Acessado pelo atalho da tela de login usando `EXPO_PUBLIC_MASTER_SECRET`.
- Permite:
  - listar oficinas
  - copiar `shopApiKey`
  - ativar/inativar oficina (`isActive`)
  - criar usuários adicionais da mesma oficina
  - resetar senha de usuário (por e-mail)

> Quando uma oficina é inativada, novos acessos por JWT retornam `shop_inactive`.

### Variáveis do app (opcional para debug)

- `EXPO_PUBLIC_API_URL`: URL pública do backend (`https://.../api`)
- `EXPO_PUBLIC_AUTH_TOKEN`: fallback opcional para debug

> Em produção, o normal é usar somente login + SecureStore (sem token fixo em env).

---

## O que foi alterado no banco (resumo)

### Multi-tenant

- `Shop` (tenant)
- `Client.shopId`, `Car.shopId`, `Service.shopId`
- `Car` placa única por oficina: `UNIQUE(shopId, plate)`

### Auth

- `User` com:
  - `shopId`, `email`, `passwordHash`, `name`
- `UNIQUE(shopId, email)`

---

## Limpar banco (dev)

- `npm run db:clear`

Apaga: services, cars, clients, users, shops.

---

## Checklist completo (o que foi feito)

1. **Remoção de mock no app**
   - `lib/mock-data.ts` removido.
   - Telas passaram a consumir `lib/api.ts`.
2. **API real e conexão de rede**
   - `lib/api.ts` com descoberta de host LAN no Expo.
   - Tratamento de erro amigável nos formulários.
3. **Banco sem seed para produção**
   - Seed automático removido do `package.json`.
   - Script `db:clear` criado para zerar tabelas.
4. **Multi-tenant (Option A)**
   - `Shop` criada no Prisma.
   - `shopId` adicionado em `Client`, `Car`, `Service`.
   - Índices e constraints por tenant (ex.: placa única por shop).
5. **Auth com JWT**
   - `User` criada no Prisma.
   - Rotas: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
   - Middleware valida JWT e injeta `req.user.shopId`.
   - CRUD protegido por tenant via token.
6. **Sessão no app**
   - `AuthProvider` + `expo-secure-store`.
   - Redirecionamento automático login/home.
   - Logout em "Mais".
7. **Onboarding operacional para equipe**
   - Tela `app/onboarding.tsx` para seu sócio criar oficina sem código.
   - Cria oficina + usuário admin em um fluxo.
   - Copiar/compartilhar credenciais.
8. **Painel administrativo para operação**
   - Tela `app/admin.tsx` para suporte administrativo central.
   - Controle de status da oficina, criação de usuários e reset de senha.

---

## Perguntas comuns

### Já existe login/senha pronta de admin?

- **Não existe Gmail/senha fixa hardcoded** para clientes.
- No modo dev, existem apenas segredos de provisionamento com fallback:
  - `SETUP_SECRET=dev-setup`
- Em produção, você define seus próprios secrets no ambiente.

### O app já está pronto para publicar?

- **Base está pronta** (multi-tenant + auth + onboarding + painel administrativo).
- Antes de publicar, recomendo checklist final:
  1. Definir secrets fortes em produção (`SETUP_SECRET`, `JWT_SECRET`).
  2. Usar HTTPS na API.
  3. Remover/debugar fallbacks de dev no ambiente de produção (já não valem com `NODE_ENV=production`).
  4. Fazer teste E2E em device real (login, criar oficina, criar usuário, CRUD, inativar/ativar).
  5. Configurar backup e monitoramento do banco.

