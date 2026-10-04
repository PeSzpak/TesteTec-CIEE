# Desenvolvimento

## Organização do trabalho

Antes de escrever código, li o enunciado e usei IA para entender o escopo e montar um
plano em etapas: ambiente, banco de dados, API de candidatos, testes, extração do PDF,
frontend e documentação.

Desenvolvi o backend primeiro, porque o frontend depende da API pronta. Em cada etapa,
testei manualmente antes de seguir para a próxima e fiz commits pequenos, um por
funcionalidade, com push frequente. Fui registrando este documento durante o
desenvolvimento, e não só no final.

## Decisões técnicas

**Stack: React, Node.js com TypeScript e SQL Server.** Escolhi as opções que já domino
para reduzir o risco dentro do prazo. O SQL Server era a parte nova para mim.

**SQL Server via Docker.** Assim quem avaliar não precisa instalar o banco, basta um
`docker compose up`. Fixei `platform: linux/amd64` porque a imagem oficial só existe
para x86, e em Mac com chip Apple ela roda via Rosetta.

**Extração do PDF separada do cadastro.** O endpoint de leitura do PDF não salva nada:
ele só devolve sugestões para preencher o formulário. Quem salva é sempre o mesmo
endpoint, com o mesmo schema de validação, nos dois caminhos. Assim uma falha no PDF
nunca bloqueia o cadastro manual, e a validação fica em um lugar só.

**Validação com Zod em um schema único.** Além de validar, ele normaliza os dados:
remove espaços das pontas, converte o e-mail para minúsculas e transforma campos
opcionais vazios em `null`. Os limites de tamanho batem com as colunas do banco, para
que um texto grande demais gere uma mensagem clara em vez de erro do banco.

**E-mail único.** Defini o e-mail como `UNIQUE` para evitar candidatos duplicados. Em
caso de repetição, a API retorna 409 com mensagem clara.

**Tratamento central de erros.** As rotas tratam só o caminho feliz, e um middleware
único converte os erros em respostas padronizadas: 400 com erros por campo, 404, 409,
413, 422 e 500 genérico sem expor detalhes internos.

**Listagem sem o resumo.** A listagem traz só os campos necessários. O resumo, que
pode ser longo, só aparece na tela de detalhes.

**Separação entre `app.ts` e `server.ts`.** O `app` monta a aplicação e o `server` só
abre a porta. Nos testes, importo o `app` sem subir servidor.

**Versões fixadas.** Fixei Prisma 6, TypeScript 5 e Vitest 3 em vez das versões mais
novas. O Prisma 7 exige adapter e arquivo de configuração extra para SQL Server, o
TypeScript 7 removeu opções de configuração, e o Vitest 4 teve