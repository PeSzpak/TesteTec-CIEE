# Cadastro de currículos

Desafio técnico de cadastro e consulta de candidatos. Dá para cadastrar de dois jeitos: preenchendo o formulário na mão ou enviando um currículo em PDF. No caso do PDF, o backend lê o arquivo e tenta achar nome, e-mail e telefone para já preencher o formulário. Os dados podem ser corrigidos antes de salvar.

Os dois caminhos usam o mesmo formulário e as mesmas validações. O PDF é opcional, então se a leitura falhar dá para seguir com o cadastro manual normalmente.

Expliquei como desenvolvi, as decisões que tomei e como usei IA no [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).

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

Os erros voltam sempre em JSON com uma mensagem. Os principais são 400 para dados ou arquivo inválido, 404 para candidato que não existe, 409 para e-mail já cadastrado, 413 para arquivo acima de 5 MB e 422 para PDF que não deu para ler.

## Limitações

A leitura do PDF funciona por heurística, então não vai acertar em todo currículo. Quando não encontra alguma informação, o campo fica vazio para preencher na mão.

Os casos que sei que não funcionam bem: PDF escaneado (só imagem, sem texto), nome que não está nas primeiras linhas, currículo com layout em colunas e telefone fora do formato brasileiro. O nome também pode ser confundido com uma frase curta no topo do documento. Detalhei isso no [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md).

## Se algo der errado

`P1000: Authentication failed`: a senha do `backend/.env` não bate com a do container. O SQL Server só lê a senha quando o volume é criado, então se ela foi trocada depois, precisa recriar com `docker compose down -v` e `docker compose up -d`. Isso apaga os dados.

`P1001: Can't reach database server`: o container não está rodando ou ainda está iniciando. Dá para conferir com `docker ps`.
