# Desenvolvimento

## Como organizei o trabalho

Antes de começar a programar, li o desafio inteiro e usei a IA para entender o que precisava ser entregue e montar um plano. Dividi em etapas: ambiente, banco, API de candidatos, testes, leitura do PDF, frontend e documentação.

Fiz o backend primeiro, porque o frontend depende da API pronta. Em cada etapa eu testava antes de seguir para a próxima, primeiro na mão e depois com testes automatizados. Tentei manter um commit por funcionalidade, para o histórico mostrar a evolução do projeto. Fui anotando este documento durante o desenvolvimento, para não ter que lembrar de tudo no final.

## Principais decisões

Escolhi React e Node.js com TypeScript porque é a stack que eu mais uso e tem uma ótima comunidade para resolução de erros e possíveis dúvidas, além de estar bem atual com o mercado. E com o prazo curto não fazia sentido arriscar com algo que eu não conheço. O SQL Server era a parte nova para mim.

Coloquei o SQL Server no Docker para quem for avaliar não precisar instalar o banco. Como a imagem oficial só existe para x86, deixei o `platform: linux/amd64` no compose, já que desenvolvi num Mac com chip Apple.

A decisão que mais pesou foi separar a leitura do PDF do cadastro. O endpoint do PDF não salva nada, ele só devolve o que encontrou para preencher o formulário. Quem salva é sempre o mesmo endpoint, com a mesma validação. Assim, se o PDF der problema, o cadastro manual continua funcionando, e as regras ficam num lugar só.

No frontend, o formulário não guarda os dados sozinho, quem guarda é a página. Fiz assim para a importação do PDF conseguir preencher o mesmo formulário do cadastro manual. Quando o PDF não encontra algum campo, o que a pessoa já tinha digitado não é apagado.

Usei o Zod para validar no backend. Além de validar, ele limpa os dados: tira espaços das pontas, deixa o e-mail em minúsculas e transforma campo vazio em `null`. No frontend fiz uma validação mais simples, só para mostrar o erro na hora, mas quem decide é sempre o backend.

Deixei o e-mail como único no banco para evitar candidato duplicado. Quando acontece, a API devolve 409 e a mensagem aparece embaixo do campo de e-mail.

Todos os erros do backend passam por um middleware só, que devolve sempre um JSON com mensagem. Isso deixou as rotas mais limpas e facilitou o frontend, que só precisa tratar um formato de erro.

Na listagem não trago o resumo profissional, porque pode ser um texto grande. Ele só aparece nos detalhes.

Para os testes, criei um banco separado, o `curriculos_test`, que é recriado do zero antes de cada execução. Assim os testes não mexem nos dados de desenvolvimento.

Usei CSS puro em vez de Tailwind, porque o desafio pede uma interface simples e eu já tinha tido problema com dependências nativas no projeto.

## Uso de IA

Usei o Claude Opus 5.5 pelo claude.ai, em formato de conversa, do começo ao fim do projeto.

Usei a IA como um assistente. Para cada etapa, ela me auxiliava com erros que eu não conseguia solucionar e também na geração de alguns itens, como os testes práticos para eu revisar se validei o que construí corretamente. Também a usei para gerar os PDFs para poupar tempo e focar nas etapas. No geral, a IA foi usada como bússola para não travar e sempre ter um norte no desenvolvimento do projeto.

Ao final, passei os arquivos .md para ela revisar.

Alguns exemplos:

- No início pedi para me ajudar a entender o sistema antes de programar. Daí saiu a divisão dos endpoints, a estrutura da tabela e a ideia de separar o PDF do cadastro, que eu adotei.
- Validei a estrutura que tinha em mente, pedi outros exemplos para comparar e entender qual a melhor para o prazo e tamanho do projeto.
- Perguntei a respeito de algumas sintaxes que não recordava como usar.
- Pedi para gerar PDFs de teste, um para cada situação: currículo completo, nome em maiúsculas com cabeçalho, sem contato, escaneado e corrompido. Uso esses arquivos nos testes automatizados, e o completo é o currículo fictício da entrega.
- Pedi para corrigir possíveis erros de português na documentação.

## O que precisei corrigir, adaptar ou descartar

Boa parte do tempo de correção foi com versão de ferramenta, não com a lógica do sistema.

O Prisma veio na versão 7, que mudou a configuração e exige um adapter para o SQL Server. Voltei para a 6 e apaguei o `prisma.config.ts`, que estava impedindo a leitura do `.env`. A extensão do VS Code também continuou acusando erro, porque validava com as regras da 7, então instalei a versão 6 dela.

Tive erro de autenticação no banco e descobri que o SQL Server só lê a senha quando o volume é criado. Recriei o volume e passei a colocar a senha entre chaves na URL.

O Prisma Client dava erro dizendo que não tinha sido gerado, mesmo depois do `prisma generate`. A IA achou que era cache do `tsx`, mas não era. Acabei trocando o `tsx` pelo `tsc-watch`, que ainda tem a vantagem de checar os tipos a cada alteração.

Para carregar o `.env.test` usei o `dotenv-cli`, mas depois de recriar o `package-lock.json` o comando `dotenv` começou a rodar um programa em Python que eu tinha instalado no Mac pelo Homebrew. A IA errou o motivo na primeira tentativa. No fim tirei o `dotenv-cli` e usei o `node --env-file`, que é do próprio Node.

O Vitest 4 não rodava por um bug do npm com dependências opcionais. Recriar o lock não resolveu, então fixei o Vitest 3. Depois o Vite 8 do frontend funcionou com a mesma tecnologia por baixo, o que me fez achar que o problema era o `node_modules` do backend, que tinha passado por muitas trocas de versão.

Fixei também o TypeScript 5 no backend, porque o npm instalou a 7, que mudou bastante. No frontend ficou a 6, que veio com o template do Vite e funciona sem problema.

Na lógica, os testes pegaram alguns erros de verdade:

- A regex do telefone recusava `(41) 99999-0000`. O hífen estava numa posição que criava um intervalo de caracteres. Corrigi e criei um teste para esse caso.
- O PDF escaneado não dava o erro esperado, porque a biblioteca coloca um marcador de página no texto e ele nunca vinha vazio. Passei a remover esse marcador.
- Com o backend desligado, o frontend mostrava "erro inesperado" em vez de erro de conexão, porque o proxy do Vite respondia no lugar da API. Como a API sempre responde em JSON, tratei resposta sem JSON como falha de conexão.
- Percebi que a heurística do nome aceita qualquer linha curta só com letras no topo do documento, então uma frase curta pode ser confundida com o nome. Deixei isso registrado como limitação.

Também errei algumas coisas no caminho: um e-mail sem `.com` nos dados de teste que derrubou quatro testes em cascata, uma rota duplicada no `App.tsx` e uma função colada dentro da outra. Passei a mostrar o corpo da resposta nas mensagens dos testes, o que ajudou a achar esses problemas mais rápido.

Uma coisa que estranhei foi o ID do candidato pular de 1 para 1004. Pesquisei e é um comportamento do SQL Server, que reserva IDs em lotes de 1000 e descarta os que sobraram quando o servidor reinicia. Não afeta nada.

Descartei o Prisma 7, o TypeScript 7, o Vitest 4, o `tsx` e o `dotenv-cli`.

## Como verifiquei

Testei a conexão com o banco pelo `sqlcmd` e conferi se as tabelas foram criadas.

Cada endpoint eu testei com `curl` antes de escrever os testes, passando pelo caminho certo e pelos erros: dados inválidos, e-mail repetido com maiúsculas, ID que não existe, ID inválido, arquivo que não é PDF, arquivo disfarçado de PDF e arquivo acima de 5 MB.

Os testes automatizados cobrem a validação, as heurísticas da extração e todos os endpoints, rodando contra um banco real separado. Além do status, alguns testes conferem o que ficou gravado no banco.

No frontend, testei cada tela na mão, inclusive com o backend desligado, e o fluxo completo de importar o PDF, completar os dados, salvar e encontrar o candidato na listagem.

## Tempo

Dediquei cerca de 25 horas, entre 29/09 e 04/10, divididas em sessões durante a semana. Uma parte grande disso foi resolvendo problemas de ambiente e versão das ferramentas, mais do que escrevendo a lógica da aplicação.

## Dificuldades, limitações e melhorias

A maior dificuldade foram as incompatibilidades entre versões. Várias ferramentas tinham acabado de lançar versão nova com mudanças grandes, e algumas vezes o problema estava num detalhe da instalação e não no código.

A leitura do PDF funciona por heurística e tem limitações. Não lê PDF escaneado, procura o nome só nas primeiras linhas e pode confundir com uma frase curta, pode se perder em layout com colunas e só reconhece telefone no formato brasileiro. Por isso o formulário sempre deixa corrigir tudo antes de salvar.

Com mais tempo, eu faria:
- a extração da área e do resumo profissional dos PDFs
- testes no frontend, principalmente do formulário e da importação
- lint no backend
- editar e excluir candidatos
- busca e paginação na listagem
- OCR para conseguir ler PDF escaneado
- uma heurística melhor para o nome, por exemplo pelo tamanho da fonte
- revisar os avisos do `npm audit`
- subir tudo, backend e frontend, com um único `docker compose up`
- rodar os testes automaticamente no GitHub a cada push