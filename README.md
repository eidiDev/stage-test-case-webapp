# Stage Case Test Front

Front-end da aplicação **Stage Case Test**, desenvolvido para atender o cenário de **gestão de processos empresariais**.

Este projeto fornece interface web com:
- **Login com JWT**
- **Logout**
- **Dashboard**
- Páginas com **CRUD** de:
  - Áreas
  - Ferramentas
  - Pessoas
  - Documentos
  - Processos

---

## Stack

Principais tecnologias utilizadas (conforme `package.json`):

- **Vite** (build e dev server)
- **React 18** + **TypeScript**
- **React Router DOM** (roteamento)
- **@tanstack/react-query** (cache e gerenciamento de requests)
- **Axios** (HTTP client)
- **TailwindCSS** + **shadcn/ui** + **Radix UI** (UI e componentes)
- **React Hook Form** + **Zod** (formulários e validação)
- **Vitest** + Testing Library (testes)
- **ESLint** (lint)

---

## Funcionalidades

### Autenticação
- **Login JWT**: autentica via API e armazena o token para as chamadas autenticadas.
- **Logout**: remove o token/sessão e redireciona para a tela de login.
- **Rotas protegidas**: páginas internas exigem autenticação.

### Módulos (CRUD)
- **Áreas**: listagem, criação, edição e remoção.
- **Ferramentas**: listagem, criação, edição e remoção.
- **Pessoas**: listagem, criação, edição e remoção.
- **Documentos**: listagem, criação, edição e remoção.
- **Processos**: listagem, criação, edição e remoção.

### Dashboard
- Página inicial pós-login (visão geral do sistema).

---

## Requisitos

- **Node.js** (recomendado 18+)
- **npm** (ou yarn/pnpm, se preferir)

---

## Instalação

1. Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_PROJETO>
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente (crie um .env na raiz do projeto):

```bash
VITE_API_URL=http://localhost:3000
```

Ajuste a URL conforme a API do backend.

## Executando o projeto
### Ambiente de desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível normalmente em:
http://localhost:5173

#### Build de produção
```bash
npm run build
```

### Build em modo development
```bash
npm run build:dev
```

### Preview do build
```bash
npm run preview
```

## Scripts disponíveis

```bash
npm run dev — inicia o Vite em modo desenvolvimento

npm run build — gera build de produção

npm run build:dev — gera build em modo development

npm run preview — serve localmente o build gerado

npm run lint — executa ESLint

npm run test — executa testes (Vitest)

npm run test:watch — executa testes em modo watch
```

## Integração com a API

Este front consome a API através da variável de ambiente:

VITE_API_URL — URL base da API

As requisições autenticadas utilizam:

Authorization: Bearer <TOKEN>

## 👨‍💻 Autor

Lucas Eidi  
📧 lucaseidikumagai@gmail.com

---

## ℹ️ Observação sobre desenvolvimento

A estrutura inicial do projeto foi gerada com auxílio da ferramenta Lovable, 
sendo posteriormente adaptada e evoluída manualmente.

Foram implementadas customizações como:

- Integração completa com API backend (NestJS + PostgreSQL)
- Implementação de autenticação JWT
- Ajustes de regras de negócio
- Estruturação de rotas protegidas
- Integração com React Query
- Refatorações e organização de código

GitHub:  
https://github.com/eidiDev