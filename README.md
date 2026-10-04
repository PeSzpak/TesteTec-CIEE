# Cadastro de Currículos

Aplicação para cadastro e consulta de candidatos, com cadastro manual ou importação de dados de um currículo em PDF.

## Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Node.js + Express + TypeScript | Node 20+, Express 5 |
| ORM / migrations | Prisma | 6.x |
| Validação | Zod | 4.x |
| Banco | SQL Server (Docker) | 2022 |
| Testes | Vitest + Supertest | 3.x |

## Requisitos

- Node.js 20 ou superior
- Docker e Docker Compose

## Configuração

```bash
# 1. Subir o SQL Server
cp .env.example .env
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env      # a senha deve ser a mesma do .env da raiz
npm install
npm run db:migrate        # cria o banco e as tabelas
npm run dev               # API em http://localhost:3333
```

## Testes

```bash
cd backend
npm test
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/health | Status da API |
| GET | /api/candidates | Listagem de candidatos |
| GET | /api/candidates/:id | Detalhes de um candidato |
| POST | /api/candidates | Cadastro de candidato |
