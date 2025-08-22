# Oliver Backend (Node + Express + MongoDB)

API do CRM (autenticação JWT, clientes, eventos, fotógrafos, usuários/admin e analytics).

## Requisitos
- Node.js >= 18
- MongoDB Atlas (ou MongoDB compatível)

## Setup
```bash
npm i
cp .env.example .env
# Edite .env com seus valores
npm run dev
```

## Variáveis de ambiente (.env)
```
MONGODB_URI=
PORT=8081
JWT_SECRET=
CORS_ORIGIN=http://localhost:8080
# E-mail (opcional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Oliver Estudios <no-reply@oliver.com>"
```

## Scripts
- `npm run dev`: desenvolvimento (tsx watch)
- `npm run build`: compila TypeScript
- `npm run start`: roda `dist/index.js`

## Rotas principais
- Auth
  - POST `/auth/register` { email, password, fullName }
  - POST `/auth/login` { email, password }
  - GET `/auth/me` (Bearer JWT)
- Clientes (Bearer JWT)
  - GET `/clientes`
  - POST `/clientes`
  - PUT `/clientes/:id`
  - DELETE `/clientes/:id`
- Eventos (Bearer JWT)
  - GET `/eventos`
  - POST `/eventos` (data: YYYY-MM-DD; persistido como Date)
  - PUT `/eventos/:id`
  - DELETE `/eventos/:id`
- Fotógrafos (Bearer JWT)
  - GET `/fotografos`
  - POST `/fotografos`
  - PUT `/fotografos/:id`
  - DELETE `/fotografos/:id`
- Usuários/Admin (Bearer JWT + role admin)
  - GET `/users`
  - POST `/users/:id/status` { status: approved|rejected|pending }
  - POST `/users/:id/roles` { role }
  - DELETE `/users/:id/roles` { role }
- Analytics (Bearer JWT)
  - GET `/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&city=<nome|all>`

## Autenticação
- Use o Bearer Token retornado por `/auth/login` ou `/auth/register`.
- Ex.: header `Authorization: Bearer <token>`

## Postman
Um Postman Collection JSON está disponível em `postman_collection.json`.
- Variáveis:
  - `{{baseUrl}}` (padrão: http://localhost:8081)
  - `{{token}}` (Bearer JWT)
- Importe no Postman: File → Import → arraste o JSON.

## Deploy (exemplo Render + Vercel)
- Backend (Render): configure `MONGODB_URI`, `JWT_SECRET`, `PORT` (Render define), `CORS_ORIGIN` (ex.: https://seu-front.vercel.app) e SMTP_*
- Frontend (Vercel): configure `VITE_API_URL` apontando para a URL do backend 