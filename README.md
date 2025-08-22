# Oliver Studio Suite

Sistema completo de gerenciamento para estúdio fotográfico, incluindo CRM, agendamento de eventos, gestão de clientes e fotógrafos.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral de eventos e receitas
- Métricas de performance
- Calendário integrado

### 📅 Eventos
- Agendamento e gestão de eventos
- Sistema de recorrência
- Atribuição de fotógrafos
- Controle de status (pendente, concluído, cancelado)

### 👥 Clientes
- Cadastro e gestão de clientes
- Sistema de leads com conversão
- Histórico de eventos por cliente

### 📸 Fotógrafos
- Gestão de equipe de fotógrafos
- Especialidades e disponibilidade
- Integração com usuários do sistema

### 📈 Analytics
- Relatórios de receita
- Métricas por cidade e tipo de evento
- Top 10 clientes por receita

### 🔐 Sistema de Usuários
- Controle de acesso baseado em roles
- Aprovação de novos usuários
- Gestão de permissões

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **React Router DOM** para navegação
- **React Query** para gerenciamento de estado

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **Zod** para validação

## 🚀 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- MongoDB
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd oliver-studio-suite
```

### 2. Configure o Backend
```bash
cd backend
npm install
cp .env.example .env
# Edite o arquivo .env com suas configurações
npm run dev
```

### 3. Configure o Frontend
```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)
```env
MONGODB_URI=mongodb://localhost:27017/oliver
PORT=3001
JWT_SECRET=sua-chave-secreta
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
SMTP_FROM=noreply@oliver.com
```

## 🔐 Sistema de Roles

### Fotógrafo
- Dashboard
- Eventos (visualização)

### Assistente
- Dashboard
- Leads
- Eventos
- Clientes

### Gerente
- Dashboard
- Leads
- Eventos
- Clientes
- Fotógrafos
- Analytics

### Admin
- Acesso completo ao sistema
- Gestão de usuários
- Todas as funcionalidades

## 📱 Rotas da API

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Perfil do usuário

### Eventos
- `GET /eventos` - Listar eventos
- `POST /eventos` - Criar evento
- `PUT /eventos/:id` - Atualizar evento
- `DELETE /eventos/:id` - Deletar evento

### Clientes
- `GET /clientes` - Listar clientes
- `POST /clientes` - Criar cliente
- `PUT /clientes/:id` - Atualizar cliente
- `DELETE /clientes/:id` - Deletar cliente

### Fotógrafos
- `GET /fotografos` - Listar fotógrafos
- `POST /fotografos` - Criar fotógrafo
- `PUT /fotografos/:id` - Atualizar fotógrafo
- `DELETE /fotografos/:id` - Deletar fotógrafo

## 🚀 Deploy

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy para Vercel
```

### Backend (Render)
```bash
cd backend
npm run build
# Deploy para Render
```

## 📝 Scripts Disponíveis

### Backend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Produção
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.

---

Desenvolvido com ❤️ para Oliver Studios 