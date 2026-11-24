# Cadastro de currículos

Desafio técnico de cadastro e consulta de candidatos. Dá para cadastrar de dois jeitos: preenchendo o formulário na mão ou enviando um currículo em PDF. No caso do PDF, o backend lê o arquivo e tenta achar nome, e-mail e telefone para já preencher o formulário. Os dados podem ser corrigidos antes de salvar.

Os dois caminhos usam o mesmo formulário e as mesmas validações. O PDF é opcional, então se a leitura falhar dá para seguir com o cadastro manual normalmente.

Expliquei como desenvolvi, as decisões que tomei e como usei IA no [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).

![Lista de candidatos](docs/media/lista.webp)

| Importação do PDF | Validação no formulário | Detalhes |
| --- | --- | --- |
| ![Formulário preenchido a partir do currículo fictício](docs/media/importacao-pdf.webp) | ![Erros de campos obrigatórios](docs/media/validacao.webp) | ![Página de detalhes do candidato](docs/media/detalhe.webp) |

Os candidatos das imagens são fictícios; o PDF importado é o `docs/curriculo-ficticio.pdf`.

## Como funciona

```mermaid
flowchart LR
  F[Frontend React<br/>Vite :5173] -- "/api (proxy do Vite)" --> B[Backend Express<br/>:3333]
  B -- Zod --> V{válido?}
  V -- sim --> P[Prisma Client] --> DB[(SQL Server<br/>banco curriculos)]
  F -- "PDF (multipart)" --> R[POST /api/resumes/parse]
  R -- "Multer em memória<br/>pdf-parse + regex" --> F
```

O PDF nunca é salvo: o Multer guarda em memória, o `pdf-parse` extrai o texto e `services/resume-parser.ts` procura e-mail e telefone por regex e o nome nas primeiras linhas. O frontend só usa a resposta para preencher o formulário; o cadastro em si sempre passa por `POST /api/candidates`.

Banco (uma tabela, migration em `backend/prisma/migrations`):

```mermaid
erDiagram
  Candidates {
    int id PK "identity"
    nvarchar_200 fullName "obrigatório"
    nvarchar_255 email UK "obrigatório, minúsculas"
    nvarchar_30 phone "opcional"
    nvarchar_150 area "opcional"
    nvarchar_max summary "opcional (até 4000 pela validação)"
    datetime2 createdAt "default now()"
  }
```

## Tecnologias

|          | Tecnologia         | Versão                       |
| -------- | ------------------ | ---------------------------- |
| Frontend | React              | 19.3                         |
|          | Vite               | 8.3                          |
|          | React Router       | 8.4                          |
|          | TypeScript         | 6.0                          |
| Backend  | Node.js            | 20 ou superior (usei a 24.7) |
|          | Express            | 5.2                          |
|          | Prisma             | 6.19                         |
|          | Zod                | 4.6                          |
|          | Multer             | 2.4                          |
|          | pdf-parse          | 2.4                          |
|          | TypeScript         | 5.9                          |
| Banco    | SQL Server         | 2022, via Docker             |
| Testes   | Vitest e Supertest | 3.2 e 7.3                    |

## O que precisa ter instalado

- Node.js 20 ou superior
- Docker com Docker Compose

Se for Mac com chip Apple, precisa ativar o Rosetta no Docker Desktop (Settings > General > Use Rosetta for x86_64/amd64 emulation), porque a imagem do SQL Server só existe para x86.

## Configurando

### Banco de dados

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No `.env`, coloque uma senha para o usuário `sa`. O SQL Server pede pelo menos 8 caracteres e três destes tipos: maiúscula, minúscula, número e símbolo. Se a senha for fraca, o container desliga sozinho sem um erro claro.

```
MSSQL_SA_PASSWORD=SuaSenhaForte@123
```

Depois é só subir:

```bash
docker compose up -d
```

O SQL Server leva uns 20 segundos para começar a aceitar conexões.

### Backend

```bash
cd backend
cp .env.example .env
cp .env.test.example .env.test
```

Nos dois arquivos, troque `SUA_SENHA_AQUI` pela mesma senha do passo anterior. Deixei a senha entre chaves na URL para não ter problema com caracteres especiais:

```
DATABASE_URL="sqlserver://localhost:1433;database=curriculos;user=sa;password={SuaSenhaForte@123};trustServerCertificate=true"
```

O `.env.test` aponta para outro banco, o `curriculos_test`, que é usado só nos testes.

Instale as dependências e crie a estrutura do banco:

```bash
npm ci
npm run db:deploy
```

O `npm ci` já gera o Prisma Client no final. O `db:deploy` cria o banco `curriculos` e aplica as migrations que estão em `prisma/migrations`.

### Frontend

```bash
cd frontend
npm ci
```

## Rodando

Precisa de dois terminais, com o SQL Server de pé.

Backend, na porta 3333:

```bash
cd backend
npm run dev
```

Frontend, na porta 5173:

```bash
cd frontend
npm run dev
```

Depois é só abrir http://localhost:5173.

Para testar a importação, deixei um currículo fictício em `docs/curriculo-ficticio.pdf`.

## Testes

Com o SQL Server rodando:

```bash
cd backend
npm test
```

Antes de rodar, o banco `curriculos_test` é apagado e recriado com as migrations, então o banco de desenvolvimento não é afetado.

Fiz testes de unidade para as regras de validação e para a extração dos dados do texto, e testes de integração para os endpoints, rodando contra o banco de testes. Nos testes do upload usei PDFs com situações diferentes (currículo completo, sem contato, escaneado e corrompido), que ficam em `backend/tests/fixtures`.

No frontend dá para rodar o lint:

```bash
cd frontend
npm run lint
```

## Endpoints

| Método | Rota                  | O que faz                                                                     |
| ------ | --------------------- | ----------------------------------------------------------------------------- |
| POST   | `/api/candidates`     | Cadastra um candidato                                                         |
| GET    | `/api/candidates`     | Lista os candidatos, do mais recente para o mais antigo                       |
| GET    | `/api/candidates/:id` | Mostra os detalhes de um candidato                                            |
| POST   | `/api/resumes/parse`  | Recebe o PDF no campo `file` e devolve os dados que encontrou. Não salva nada |

Os erros voltam sempre em JSON com uma mensagem. Os principais são 400 para dados ou arquivo inválido, 404 para candidato que não existe, 409 para e-mail já cadastrado, 413 para arquivo acima de 5 MB e 422 para PDF que não deu para ler. Erro de validação vem com os erros por campo:

```json
{ "message": "Dados inválidos", "errors": { "fullName": ["Nome completo é obrigatório"], "email": ["Formato de e-mail inválido"] } }
```

Também existe `GET /health`, que devolve `{ "status": "ok" }`.

### Documentação da API

- OpenAPI 3.0: [`docs/openapi.yaml`](docs/openapi.yaml), com schemas, exemplos e todos os códigos de erro. Para ver: cole em https://editor.swagger.io ou rode `npx @redocly/cli@1.34.3 preview-docs docs/openapi.yaml`.
- Postman: importe [`docs/postman/TesteTec-CIEE.postman_collection.json`](docs/postman/TesteTec-CIEE.postman_collection.json). A variável `baseUrl` aponta para `http://localhost:3333`; o cadastro guarda o `id` criado em `candidateId` para o detalhe.

Exemplos com curl:

```bash
curl -X POST http://localhost:3333/api/candidates \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Marina Albuquerque Teles","email":"marina.teles@exemplo.com"}'

curl -F file=@docs/curriculo-ficticio.pdf http://localhost:3333/api/resumes/parse
# {"fullName":"Isabelle da Cruz","email":"isabelle.cruz@email.com","phone":"(41) 99876-5432"}
```

## Estrutura

```
.
├── docker-compose.yml        # SQL Server 2022
├── backend/
│   ├── prisma/               # schema.prisma e migrations
│   ├── src/
│   │   ├── app.ts            # Express, rotas e handler de erros
│   │   ├── routes/           # candidates.routes.ts, resumes.routes.ts
│   │   ├── schemas/          # validação Zod do candidato
│   │   ├── services/         # resume-parser.ts (pdf-parse + heurísticas)
│   │   └── middlewares/      # upload (Multer) e error-handler
│   └── tests/                # Vitest + Supertest, PDFs de teste em fixtures/
├── frontend/src/
│   ├── pages/                # lista, novo cadastro, detalhes
│   ├── components/           # CandidateForm, PdfImport, Alert
│   ├── validation/           # mesmas regras do backend no formulário
│   └── api/client.ts         # chamadas à API
└── docs/                     # openapi.yaml, coleção Postman, PDF fictício, imagens
```

## Limitações

A leitura do PDF funciona por heurística, então não vai acertar em todo currículo. Quando não encontra alguma informação, o campo fica vazio para preencher na mão.

Os casos que sei que não funcionam bem: PDF escaneado (só imagem, sem texto), nome que não está nas primeiras linhas, currículo com layout em colunas e telefone fora do formato brasileiro. O nome também pode ser confundido com uma frase curta no topo do documento. Detalhei isso no [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).

Outros pontos conhecidos no código:

- Em `middlewares/error-handler.ts`, o ramo de `MulterError` que não é de tamanho (por exemplo, dois arquivos no campo `file`) responde 400 mas não tem `return`, então o código segue e tenta responder 500 de novo. O cliente recebe o 400, mas o servidor registra `ERR_HTTP_HEADERS_SENT` no log.
- `npm test` roda antes um `prisma migrate reset --force` no banco do `.env.test`. Confira que ele aponta para `curriculos_test`, nunca para o banco de desenvolvimento.
- Sobra um `import { string } from "zod"` sem uso em `routes/resumes.routes.ts`.

## Se algo der errado

`P1000: Authentication failed`: a senha do `backend/.env` não bate com a do container. O SQL Server só lê a senha quando o volume é criado, então se ela foi trocada depois, precisa recriar com `docker compose down -v` e `docker compose up -d`. Isso apaga os dados.

`P1001: Can't reach database server`: o container não está rodando ou ainda está iniciando. Dá para conferir com `docker ps`.
