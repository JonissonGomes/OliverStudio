# Fluxo do Sistema Oliver

Este documento resume o fluxo ponta a ponta: do site público (landing) até a operação diária no CRM (clientes, eventos, fotógrafos, analytics), incluindo aprovação de usuários e papéis.

## Visão Geral do Fluxo (Landing → CRM)

```mermaid
flowchart LR
  subgraph Site Público
    A[/Home (/)\]
    B[/Sobre (/sobre)\]
    C[/Serviços (/servicos)\]
    D[/Fotos (/fotos)\]
    E[/Contato (/contato)\]
  end

  subgraph Autenticação
    L["/login"]
    R["/register"]
    RS["/register-success"]
  end

  subgraph CRM (Área Autenticada)
    direction LR
    ADM["/app/admin-usuarios\n(Gerenciar usuários/roles)"]
    CLI["/app/clientes\n(CRUD clientes)"]
    EVT["/app/eventos\n(CRUD eventos)"]
    FOT["/app/fotografos\n(CRUD fotógrafos)"]
    ANA["/app/analytics\n(Insights)"]
  end

  A --> E
  B --> E
  C --> E
  D --> E

  E -- CTA "Acessar CRM" --> L
  L --> |"Não tem conta?"| R --> RS

  R --> |Cria usuário (status: pending)| RS
  RS --> |Aguardar aprovação do admin| L

  L --> |Login (JWT) \nSe approved == true| CLI
  L --> |Se approved == false| RS

  ADM -. aprova/rejeita .-> L

  CLI --> EVT --> ANA
  FOT --> EVT
  CLI --> ANA
```

## Fluxo de Aprovação de Usuário (Admin)

```mermaid
sequenceDiagram
  actor Admin
  participant FE as Frontend
  participant API as Backend API
  participant DB as MongoDB

  Admin->>FE: Acessa /app/admin-usuarios
  FE->>API: GET /users (JWT)
  API->>DB: find users
  API-->>FE: Lista de usuários (status, roles)

  Admin->>FE: Aprovar usuário X (opcional: definir cargo)
  FE->>API: POST /users/:id/roles (role)
  API->>DB: addToSet role
  API-->>FE: ok

  FE->>API: POST /users/:id/status { approved }
  API->>DB: update status=approved
  API-->>FE: ok
  API->>API: send email (nodemailer) [opcional]
```

## Fluxo de Criação de Evento (Funcionário)

```mermaid
sequenceDiagram
  actor Staff as Funcionário
  participant FE as Frontend
  participant API as Backend API
  participant DB as MongoDB

  Staff->>FE: Abre /app/eventos
  FE->>API: GET /clientes, GET /eventos
  API->>DB: query clientes/eventos (userId)
  API-->>FE: dados

  Staff->>FE: Seleciona Cliente (clienteId) e preenche dados
  FE->>API: POST /eventos { clienteId, ... , data: YYYY-MM-DD }
  API->>DB: insert Evento { data: Date, clienteId, ... }
  API-->>FE: ok

  FE->>API: (se recorrência) múltiplos POST /eventos
  API->>DB: inserts em lote
  API-->>FE: ok
```

## Analytics (Agregações + Cache)

```mermaid
sequenceDiagram
  participant FE as Frontend (/app/analytics)
  participant API as Backend API (/analytics/summary)
  participant DB as MongoDB
  participant Cache as In-memory Cache

  FE->>API: GET /analytics/summary?from&to&city (JWT)
  API->>Cache: lookup key (userId, from, to, city)
  alt HIT
    Cache-->>API: hit
    API-->>FE: summary (X-Cache: HIT)
  else MISS
    API->>DB: aggregate (match userId/date, lookups por cidade, group by)
    DB-->>API: result
    API->>Cache: set(key, ttl=30s)
    API-->>FE: summary (X-Cache: MISS)
  end

  Note over FE: Fallback local se API indisponível (Maps, timestamps)
```

## Papéis e Permissões

```mermaid
flowchart LR
  subgraph Roles
    A[admin]
    B[moderator]
    C[user]
  end

  A --> |/app/admin, /app/admin-usuarios| P1[Admin Pages]
  A --> |/app/clientes, /app/eventos, /app/fotografos, /app/analytics| P2[Operação]
  B --> |/app/clientes, /app/eventos, /app/fotografos, /app/analytics| P2
  C --> |/app/clientes, /app/eventos, /app/fotografos, /app/analytics| P2

  style P1 fill:#fde68a,stroke:#f59e0b
  style P2 fill:#d1fae5,stroke:#10b981
```

## Modelo de Dados (Simplificado)

```mermaid
classDiagram
  class User {
    +_id: ObjectId
    +email: string
    +fullName: string
    +passwordHash: string
    +roles: string[]
    +status: 'pending'|'approved'|'rejected'
  }

  class Cliente {
    +_id: ObjectId
    +userId: string
    +nome: string
    +email: string
    +telefone: string
    +cidade: string
  }

  class Evento {
    +_id: ObjectId
    +userId: string
    +clienteId: string
    +cliente: string
    +tipoEvento: enum
    +data: Date
    +inicio: string
    +termino: string
    +local: string
    +descricao: string
    +preco: number
    +fotografos: string[]
  }

  class Fotografo {
    +_id: ObjectId
    +userId: string
    +nome: string
    +email: string
    +contato: string
    +especialidades: string[]
  }

  User "1" --> "*" Cliente : owns
  User "1" --> "*" Evento : owns
  User "1" --> "*" Fotografo : owns
  Cliente "1" --> "*" Evento : referenced by clienteId
```

## Regras de Negócio-Chave

- Registro cria `User` como `pending`; acesso às rotas `"/app/*"` somente após `approved`.
- Admin gerencia status e cargos em `/users` API, com proteção para não remover a própria role admin; e‑mail de aprovação opcional (SMTP).
- Eventos exigem `clienteId`; `data` persistida como `Date` no Mongo.
- Analytics usa agregações com índices e cache curto (30s); fallback local no FE.

## Melhorias Futuras

- Integrar `/contato` do site público a `/leads` no backend e tela de leads no CRM para conversão → cliente.
- Migrar exibição de eventos para usar sempre `clienteId` (já enviado) e retirar dependências do `cliente` (nome) em consultas.
- Adicionar cache distribuído (Redis) se necessário. 