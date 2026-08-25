# PLANO_SEPARACAO_BACKEND.md — do demo frontend ao produto com backend e banco

> **O que este documento é:** um mapa de decisões. Cada uma traz o que está em jogo, as opções
> reais, uma recomendação e o custo de mudar de ideia depois. Nada aqui é implementação.
>
> **O que este documento não é:** um plano de sprint, uma especificação de API, nem parecer
> jurídico. A decisão **D10** (LGPD) precisa de revisão de advogado antes de virar contrato ou
> política de privacidade publicada.
>
> **Como usar:** ler, discutir decisão por decisão, preencher o **Quadro de decisões** no fim.
> Enquanto o quadro não estiver preenchido, não vale começar a Fase 1 do **Roteiro**.
>
> São 20 decisões, em duas partes: **Parte I** (D1–D13) trata do servidor, do banco e da proteção
> de dados; **Parte II** (D14–D20) trata do que acontece com o frontend que já existe.

---

## §1. Ponto de partida: o que existe hoje

Levantamento do repositório em 25/08/2026 (branch `front-ajustes`).

| Camada | Tamanho | Estado |
|---|---|---|
| Telas (`src/pages/`) | 19 componentes de tela | Completas, com estados de vazio/erro/carregando |
| Regras de negócio (`src/services/`) | 14 módulos, ~1.700 linhas | **Funções puras**, sem React dentro |
| Domínio (`src/types/`) | 18 arquivos de tipo | Modelo relacional já explícito |
| Dataset (`src/mocks/`) | 15 arquivos, ~1.100 linhas | Cenário completo da demonstração |
| Design system (`src/components/ui/`) | 26 componentes | Reaproveitável integralmente |
| `src/features/` | 9 pastas | **Vazias** — só `.gitkeep`. A estrutura do `CLAUDE.md` §12 foi planejada e nunca adotada |
| Regras documentadas | R1–R12 | Descritas em `docs/DEMO_GUIDE.md` §3 |

### §1.1 O que já está pronto para virar backend

Três coisas foram feitas certas e economizam semanas:

1. **Os serviços não conhecem React.** `compatibleCaregivers`, `confirmApplication`,
   `conflictingAttendance` e `caregiverRating` são funções de `(estado, argumentos) → estado`.
   Elas migram para o servidor quase sem reescrita — muda o que é "estado" (hoje um objeto em
   memória, amanhã uma transação no banco), não a regra.
2. **Os tipos já são um schema.** `src/types/` descreve tabelas, chaves estrangeiras e enums.
   O schema do banco sai daí quase por transcrição.
3. **O `localStorage` está isolado em um módulo.** `src/services/storage.ts` é o único ponto do
   projeto que fala com o navegador. Trocar esse módulo por um cliente HTTP é uma cirurgia
   localizada, não uma varredura pelo projeto inteiro.

### §1.2 O que vai ter que ser desfeito

Estas quatro coisas foram decisões corretas para uma demo e não sobrevivem à separação:

1. **O estado é um blob único no cliente.** `AppState` carrega *todas* as coleções de *todas* as
   empresas na memória do navegador. Com backend, cada tela passa a pedir só o que mostra. Isso é
   obrigatório por dois motivos: volume (nenhum navegador carrega o histórico de três anos de uma
   empresa) e privacidade (hoje a empresa 1 tem os dados da empresa 2 no navegador dela — o
   isolamento é apenas visual, feito no `filter`).
2. **A mutação é `setState(s => servico(s, ...))`.** São **27 pontos de mutação em 10 telas**, e
   **as 19 telas leem `useAppState`**. Cada leitura vira consulta, cada mutação vira chamada de
   rede com carregando, erro e revalidação. Esta é a parte mais cara da migração — está isolada na
   Fase 5 do roteiro por isso, e a Parte II deste documento existe para organizá-la.
3. **IDs gerados com `Date.now()`.** Duas ações no mesmo milissegundo colidem. No banco, ID é
   responsabilidade do banco.
4. **Senha em texto puro.** `src/mocks/users.ts` guarda senha legível e `services/auth.ts` compara
   por igualdade. Óbvio para uma demo, inaceitável fora dela.

### §1.3 Problemas que só aparecem quando existe servidor

Estes **não são defeitos do código atual** — são consequências de deixar de ter um único usuário
com uma cópia local dos dados. Cada um precisa de decisão explícita:

| Situação | Por que não existe hoje | O que passa a ser preciso |
|---|---|---|
| **R4 — dupla marcação** (`conflictingAttendance`) | Um navegador, uma thread, nada concorre | Duas aceitações simultâneas passam as duas na verificação. Precisa de transação com bloqueio ou de restrição de exclusão no banco |
| **`confirmApplication`** altera candidaturas + atendimento + notificações | Tudo acontece em um `setState` | Precisa ser **uma transação**. Falha no meio hoje não deixa rastro; no banco, deixa |
| **Fuso horário** | `new Date("2026-08-25T07:00")` usa o fuso da máquina de quem apresenta | O servidor roda em UTC. Sem decisão explícita de fuso, o plantão das 7h vira das 4h |
| **`syncAutomaticNotifications`** roda ao abrir o app | O relógio é o do apresentador | Vira tarefa agendada no servidor. Ninguém precisa abrir o app para o lembrete existir |
| **Relatório de horas** | Filtra um array em memória | Vira consulta com agregação; o CSV (§33 do `CLAUDE.md`, ainda não implementado) sai do servidor, não do navegador |
| **`loadAppState` mescla o salvo sobre o seed** | Estratégia de "migração" da demo | Deixa de existir. Migração de schema é do banco |

---

## §2. Como ler as recomendações

Duas perguntas guiam todas as escolhas abaixo, e as duas vêm da situação real do produto — **sem
clientes grandes ainda**:

**Reversibilidade.** Uma decisão é *barata* se dá para mudar em uma semana sem tocar em dados de
cliente; é *cara* se depende de migração de dados, de contrato assinado ou de reescrita de tela.
Decisão barata se toma rápido e se corrige depois. Decisão cara merece a discussão.

**Custo fixo.** Sem faturamento, o que importa não é o preço no plano de 10 mil usuários, é o
preço no plano de zero. Toda escolha abaixo foi filtrada por "quanto custa por mês enquanto o
produto não vende?".

---
---

# PARTE I — Backend, banco e proteção de dados

---

## D1 — Formato do repositório

**Em jogo:** onde o código do backend vai morar em relação ao frontend que já existe.

| Opção | Como fica | A favor | Contra |
|---|---|---|---|
| **A. Um repositório, dois aplicativos** (workspaces) | `apps/web` (o Vite atual, movido) + `apps/api` + `packages/shared` | Um `git clone`, um PR muda os dois lados juntos, tipos e validação compartilhados de verdade; deploy continua independente | Precisa configurar workspaces (uma tarde) |
| **B. Dois repositórios** | `acalento-web` e `acalento-api` separados | Fronteira clara; times independentes | Para 1–3 devs é atrito puro: PR duplo a cada mudança de contrato, versionamento do pacote compartilhado, dois CIs. Só compensa com times separados |
| **C. Um aplicativo full-stack** (Next.js) | Frontend e backend no mesmo framework | Menos peças; um deploy só | **Joga fora o que está pronto**: rotas, layouts e guardas do React Router seriam reescritos. Além disso amarra o backend ao ciclo de vida do framework de UI |

**Recomendação: A — um repositório, dois aplicativos.**

O aplicativo atual entra inteiro em `apps/web` sem uma linha mudada. `packages/shared` recebe os
tipos de `src/types/` e os esquemas de validação — é o que garante que backend e frontend nunca
discordem sobre o que é um `Attendance`. E `apps/api` nasce vazio, sem prazo, sem pressionar a
demo comercial que precisa continuar funcionando.

A opção C merece um parágrafo porque é a mais tentadora: ela é a resposta certa para quem está
começando do zero. Aqui não estamos. Existem 19 telas prontas, aprovadas visualmente e usadas em
apresentação comercial — reescrever a camada de roteamento delas para ganhar "menos peças" é
trocar valor entregue por elegância de arquitetura.

> **Reversibilidade: alta.** Sair de A para B depois é mover pastas. Sair de A ou B para C é caro.

---

## D2 — Runtime e framework do backend

**Em jogo:** em que o servidor é escrito.

A linguagem já está decidida na prática: **TypeScript**. As regras R1–R12 existem em TypeScript,
verificadas contra o dataset da demo. Reescrevê-las em outra linguagem significa reescrever *e*
reconferir o comportamento — sem nenhum ganho que justifique.

| Opção | Perfil | Quando escolher |
|---|---|---|
| **Fastify** | Minimalista, rápido, plugins oficiais para cookie, CORS, limite de requisições | Time pequeno, estrutura definida por quem escreve |
| **NestJS** | Opinativo, injeção de dependência, estrutura imposta | Time de 4+ pessoas ou rotatividade alta, onde estrutura imposta economiza revisão |
| **Hono** | Ultraleve, roda em qualquer runtime | Se houver intenção de rodar em edge/serverless |
| **Express** | Onipresente | Só por familiaridade — sem vantagem técnica sobre Fastify hoje |

**Recomendação: Fastify.**

Para o tamanho deste time, o custo de cerimônia do NestJS não se paga: ele resolve o problema de
organizar 40 desenvolvedores, não o de organizar 2. Fastify com uma convenção de pastas escrita
(rotas / casos de uso / repositórios) chega ao mesmo lugar com menos indireção.

> **Reversibilidade: alta**, se — e só se — as regras de negócio ficarem em módulos que não
> importam nada do framework. Isso é a mesma disciplina que o projeto já pratica em
> `src/services/`: manter a regra livre de framework é o que torna o framework descartável.

---

## D3 — Contrato entre frontend e backend

**Em jogo:** o formato das chamadas e quem garante que os dois lados concordam.

| Opção | A favor | Contra |
|---|---|---|
| **REST + Zod compartilhado** | Contrato explícito; qualquer cliente futuro consome (app nativo, integração de cliente, Postman); tipos vêm do `packages/shared` | Escrever rota e cliente é manual |
| **tRPC** | Tipagem ponta a ponta de graça, sem gerar nada; o mais rápido de escrever | Só serve cliente TypeScript. Um app nativo ou uma integração de cliente exigem uma segunda camada REST por cima |
| **GraphQL** | Cliente pede exatamente os campos | Complexidade (cache, N+1, autorização por campo) desproporcional a 19 telas conhecidas |

**Recomendação: REST + Zod compartilhado.**

O argumento decisivo não é técnico, é comercial: o produto vende para empresas de home care, e
empresa de home care mais cedo ou mais tarde pede integração ("exporta as horas para o meu sistema
de folha"). Um contrato REST atende esse pedido sem obra. tRPC não — ele é excelente enquanto o
único cliente for o próprio React.

O Zod entra em `packages/shared` e é usado **três vezes**: valida a entrada no servidor, valida o
formulário no navegador (**D19**) e tipa a resposta no cliente. Uma definição, três usos, zero
divergência.

> **Reversibilidade: média.** Trocar REST por tRPC depois obriga a reescrever a camada de acesso
> do frontend (não as telas). Fazer o inverso é pior.

---

## D4 — Banco de dados

**Em jogo:** o motor e onde ele roda.

### Motor

**Recomendação: PostgreSQL.** O modelo já é relacional — `CaregiverLink` é literalmente uma tabela
de junção com atributos, e R1 (quadro por empresa) só existe por causa dela. Além disso o Postgres
oferece, sem custo adicional, três coisas que este domínio vai usar: `tstzrange` com restrição de
exclusão para resolver R4 (dupla marcação) no próprio banco, `jsonb` para as partes flexíveis
(`availability`, observações do registro) e Row Level Security como segunda linha de isolamento
entre empresas (**D8**).

MySQL faria o trabalho; não faria esses três. SQLite não serve a partir do momento em que existem
dois processos gravando.

### Hospedagem

| Opção | Custo inicial | Observações |
|---|---|---|
| **Neon** | Plano gratuito real | Postgres gerenciado, ramificação de banco por PR (excelente para testar migração). Confirmar disponibilidade de região São Paulo na contratação |
| **Supabase** | Plano gratuito | Postgres + autenticação + armazenamento de arquivos no mesmo contrato. Resolve D4, D7 e D9 de uma vez |
| **Railway / Render** | Baixo, previsível | Simples. Banco e API no mesmo lugar |
| **AWS RDS (sa-east-1)** | O mais caro dos quatro | Região São Paulo garantida; a resposta certa quando existir cliente grande exigindo, não antes |
| **VPS próprio** (Hetzner, Contabo) | O mais barato | Você vira o DBA: backup, atualização de versão, monitoramento. Barato em dinheiro, caro em atenção |

**Recomendação: Neon ou Railway para começar; avaliar Supabase se a decisão for cortar D7 e D9
junto.**

> **Nota sobre o `CLAUDE.md`:** a proibição de Supabase, Firebase e afins vale para **este
> repositório de demonstração** e continua valendo (§2 e §48). Ela existe para que a demo rode
> offline na máquina de quem apresenta. Não é uma proibição sobre o produto de produção — são dois
> artefatos diferentes, e **D13** trata de mantê-los assim.

> **Reversibilidade: alta entre provedores** (é um `pg_dump`), **baixa entre motores.** Escolher
> Postgres agora é a decisão que não se revisita.

### Ponto de atenção que vale mais que a escolha do provedor

**Região.** Se o banco ficar fora do Brasil, cada dado de saúde de paciente armazenado nele é uma
transferência internacional sob o art. 33 da LGPD, com cláusulas contratuais e justificativa. Se
ficar em São Paulo, essa discussão inteira não acontece. Isso torna "tem região no Brasil?" um
critério de eliminação, não um detalhe — vale mais que preço na comparação acima.

---

## D5 — Acesso a dados

| Opção | A favor | Contra |
|---|---|---|
| **Prisma** | Schema declarativo, migrações versionadas, cliente tipado, `seed` embutido | Camada de abstração espessa; consultas complexas exigem escapar para SQL |
| **Drizzle** | SQL-first, tipado, leve | Migrações e ergonomia menos maduras que Prisma |
| **Kysely / SQL puro** | Controle total | Todo o resto é manual |

**Recomendação: Prisma.**

O argumento específico deste projeto: `prisma db seed` é exatamente a peça que falta para
transformar `src/mocks/` em cenário de banco. O dataset da demo — Beatriz com poucas avaliações
para demonstrar R10, Paulo Ricci em análise para demonstrar R1+R3 juntas, `at7` cancelado com 11h
de antecedência para demonstrar R8 — é ativo comercial, não dado de teste. O Prisma dá caminho
direto de `seed.ts` para banco recriável com um comando, que é o que a apresentação precisa.

Os relatórios de horas provavelmente pedirão SQL na mão. O Prisma permite (`$queryRaw`), e isso é
aceitável: são poucas consultas.

> **Reversibilidade: média.** Trocar de ORM é reescrever a camada de repositório — chato, não
> traumático, desde que a regra de negócio não chame o ORM direto.

---

## D6 — Modelagem: sete pontos que precisam de decisão explícita

Estes não são "detalhes de implementação". Cada um é escolha de dados, e dado escolhido errado
custa migração depois.

### D6.1 Identificadores
Hoje: `cg_1`, `at7`, `` `log_${Date.now()}` ``.
Opções: `uuid v4` · `uuid v7` (ordenável por tempo, melhor para índice) · `cuid2`.
**Recomendação: uuid v7**, gerado no banco.

### D6.2 Dinheiro
Hoje: `value: number` (ponto flutuante).
`0.1 + 0.2 !== 0.3` — em relatório de horas isso vira centavo perdido que alguém vai reclamar.
**Recomendação: inteiro em centavos** (`value_cents int`), formatado só na exibição.

### D6.3 Data, hora e fuso — o ponto mais perigoso da lista
Hoje: `startDate: "2026-08-25"` + `startTime: "07:00"`, interpretados no fuso da máquina.
São **duas naturezas diferentes** de tempo e merecem tratamento diferente:

- **Instantes** (`checkinAt`, `checkoutAt`, `createdAt`): `timestamptz`, sempre em UTC. Isso é
  prova — a hora do check-in tem valor de registro e não pode depender de onde o servidor roda.
- **Compromissos** (`startDate` + `startTime`): mantidos como data local + hora local, com fuso do
  atendimento explícito. Um plantão marcado para as 7h é às 7h de quem trabalha, mesmo que o
  horário de verão volte a existir.

**Recomendação:** as duas coisas acima, e `America/Sao_Paulo` gravado explicitamente — nunca
inferido do servidor, nunca inferido do navegador.

### D6.4 Isolamento entre empresas no próprio modelo
`Patient` e `Attendance` já têm `companyId`. `Caregiver` **não tem** — o cuidador é global e se
liga às empresas por `CaregiverLink`. Isso está certo e é o coração da R1 (o mesmo cuidador
aprovado numa empresa e em análise em outra).
**Consequência a decidir:** um dado global visto por vários controladores exige regra explícita de
*quem vê o quê*. Ver **D10.3**.

### D6.5 O documento do cuidador é conferido por empresa ou uma vez só?
Hoje `Caregiver.verified` é um booleano **global**, e `councilRegistrationStatus` também. Mas a
aprovação do quadro é **por empresa**. Há uma inconsistência latente: se a empresa A confere o RG e
marca verificado, a empresa B herda uma conferência que não fez.

**Opções:** (a) conferência global, uma vez, valendo para todas — mais simples, mas cada empresa
está confiando na diligência da outra; (b) conferência por vínculo — coerente com a filosofia do
produto ("a empresa é dona do seu quadro", `PRODUCT.md`), porém mais trabalho repetido para o
cuidador; (c) híbrido: documento enviado uma vez, conferido por empresa.

**Recomendação: (c).** É o único que respeita o princípio do produto sem obrigar o cuidador a
enviar o mesmo RG cinco vezes. Exige mover `verified` de `Caregiver` para `CaregiverLink`.
**Esta é uma mudança de modelo, não de tela — por isso está aqui e não na Fase 5.**

### D6.6 Exclusão
**Recomendação: exclusão lógica em toda entidade com histórico** (`deleted_at`), e
**anonimização, não exclusão física**, para pedidos de titular (**D10.5**). Um atendimento
concluído é prova de horas trabalhadas: apagá-lo apaga o comprovante de quem trabalhou.

### D6.7 Auditoria (R12)
Já existe `AuditLogEntry`, e já é o que o `PRODUCT.md` chama de diferencial ("rastreabilidade das
decisões"). No banco ela ganha duas responsabilidades novas: **somente inserção** (sem `UPDATE`,
sem `DELETE`) e registro de **acesso a dado sensível**, não só de decisões — quem abriu a ficha de
qual paciente, quem baixou qual documento. Isso é exigência prática do art. 46 da LGPD e é o que se
apresenta quando um cliente perguntar "como vocês controlam o acesso?".

---

## D7 — Autenticação e sessão

**Em jogo:** como alguém prova quem é, e onde essa prova fica.

| Opção | Custo | LGPD | Esforço |
|---|---|---|---|
| **Sessão própria** (cookie + tabela `sessions` + argon2id) | Zero | Nenhum operador novo | ~1 semana com recuperação de senha e verificação de e-mail |
| **Better Auth** (biblioteca, auto-hospedada, mesmo banco) | Zero | Nenhum operador novo — os dados ficam no seu Postgres | ~2 dias; já traz sessão, verificação, recuperação, 2FA |
| **Clerk / Auth0** (serviço) | Gratuito até um limite, depois por usuário ativo | **Operador internacional** a declarar, com dados de identificação saindo do país | ~1 dia |
| **Supabase Auth** | Incluído se D4 = Supabase | Um operador (o mesmo do banco) | ~1 dia |

**Recomendação: Better Auth (ou sessão própria, se a preferência for não depender de biblioteca).**

O motivo é de proteção de dados, não de preço. Cada serviço externo adicionado é um **operador**
que precisa entrar na lista de sub-operadores, no contrato com cada empresa cliente e na política
de privacidade — e é uma pergunta a mais no primeiro cliente que tiver departamento jurídico.
Autenticação aqui é simples (e-mail e senha, dois papéis); não vale importar essa conversa para
dentro do produto por dois dias de economia.

### Decisões que acompanham

- **Formato da sessão: token opaco em cookie `httpOnly` + `Secure` + `SameSite=Lax`, com registro
  no banco.** Não JWT. A razão é do domínio: quando a empresa **bloqueia** um cuidador, o acesso
  dele precisa cair *naquele momento*. JWT vale até expirar; sessão em banco se revoga. Cookie
  `httpOnly` também tira o token do alcance de qualquer script — e não existe token guardado em
  `localStorage` para vazar. **Consequência direta no frontend: ver D16 e D17.**
- **Senha: argon2id.** Nunca MD5, nunca SHA sozinho, nunca texto puro.
- **Limite de tentativas de login** por e-mail e por IP, desde o primeiro dia.
- **Segundo fator: opcional para Empresa, adiar para Cuidador.** Quem coordena vê a base inteira de
  pacientes; o cuidador vê os plantões dele. Risco diferente, exigência diferente.
- **As contas de demonstração (`empresa@demo.com` / `123456`) não podem existir em produção.** Um
  seed que roda nos dois ambientes é um backdoor com senha publicada no README.

> **Reversibilidade: média.** Trocar de mecanismo depois obriga a redefinição de senha por todo
> mundo — mas com poucos usuários isso é um e-mail, não uma crise. Por isso não vale travar a
> decisão: escolher e seguir.

---

## D8 — Autorização e isolamento entre empresas

Hoje o isolamento é `filter(a => a.companyId === companyId)` dentro do serviço. Funciona porque não
há atacante — todos os dados já estão no navegador de qualquer forma. Com backend, **este é o
controle de segurança mais importante do sistema**: uma falha aqui expõe pacientes de um cliente
para outro cliente.

**Recomendação — três camadas, nesta ordem:**

1. **A empresa vem sempre da sessão, nunca da requisição.** Nenhuma rota aceita `companyId` no
   corpo, na URL ou na query. É a regra mais barata e a que elimina a classe inteira de falhas de
   referência direta a objeto.
2. **O filtro por empresa mora no repositório, não no manipulador de rota.** Se o filtro depende de
   o desenvolvedor lembrar de escrevê-lo em cada rota, um dia alguém esquece.
3. **Testes de isolamento como critério de pronto.** Para cada recurso, um teste que autentica como
   Empresa B e tenta ler um registro da Empresa A esperando 404. Isso não é zelo excessivo: é o
   teste que se mostra para o cliente que perguntar.

**Row Level Security do Postgres** é uma quarta camada possível e boa (o banco recusa a leitura
mesmo que o código erre), mas custa disciplina de conexão. **Recomendação: deixar preparado no
schema, ativar quando houver o primeiro cliente que exija auditoria formal.**

Sobre o **Cuidador**, o recorte é outro e precisa ser dito por escrito: ele vê os atendimentos em
que está confirmado ou convidado, e nada mais. Em particular, o **endereço completo só depois da
confirmação** — isso é a R5, já implementada em `canSeeFullAddress`, e no backend ela deixa de ser
uma escolha de renderização e passa a ser **omissão do campo na resposta**. Enviar o endereço e
escondê-lo na tela é o mesmo que não esconder.

---

## D9 — Arquivos: documentos, selfie e fotos do registro

Hoje: simulados (`CLAUDE.md` §35, `DEMO_GUIDE.md` §4). No produto real, isso passa a ser
**armazenamento de documento de identidade** — o dado mais sensível que o sistema vai guardar
depois da saúde do paciente.

**Recomendação:**

- **Armazenamento compatível com S3, balde privado.** Cloudflare R2 (sem taxa de saída) ou AWS S3
  em `sa-east-1`. Nunca no banco, nunca em pasta pública do servidor web.
- **Nenhuma URL pública.** Acesso só por URL assinada de vida curta (minutos), emitida depois de
  verificar a autorização — a mesma pergunta de **D8**: *esta empresa tem vínculo com este
  cuidador?*
- **Todo download entra na auditoria.** Quem baixou o documento de quem, e quando.
- **Limite de tipo e tamanho na entrada**, e o nome do arquivo enviado pelo usuário nunca vira
  caminho no disco.
- **Não fazer reconhecimento facial com a selfie.** Comparação automática de rosto transforma a
  foto em **dado biométrico**, que é dado sensível com regime próprio na LGPD. A conferência humana
  ("esta foto é a pessoa do documento?") não tem esse efeito. É uma linha inteira de obrigação legal
  que se evita simplesmente não construindo a funcionalidade.

---

## D10 — LGPD e proteção de dados

> Esta decisão organiza os pontos e aponta os artigos. **Não substitui advogado** — política de
> privacidade publicada e contrato com cliente precisam de revisão jurídica.

Este produto trata **dado pessoal sensível** (Lei 13.709/2018, art. 5º, II): saúde do paciente —
mobilidade, uso de oxigênio, uso de sonda, sinais vitais, observações do registro do atendimento.
Isso não é um detalhe do modelo; é o que define o regime jurídico do produto inteiro.

### D10.1 Quem é controlador de quê — a decisão que precede todas as outras

| Dado | Provável papel da plataforma |
|---|---|
| Cadastro de cuidadores e usuários (CPF, documento, contato) | **Controladora** |
| Dados dos pacientes, inseridos pela empresa cliente | **Operadora** — a empresa de home care é a controladora |
| Registro de atendimento, check-in/check-out, avaliações | A definir: provavelmente controle conjunto |

Isso importa porque muda o que se assina e quem responde. Como operadora, é preciso um **contrato
de operador (DPA)** com cada empresa cliente, dizendo o que se pode fazer com os dados dela.
**Decisão a tomar antes do primeiro contrato**, não depois.

### D10.2 Base legal
- Cuidadores e usuários: execução de contrato (art. 7º, V).
- **Pacientes (dado de saúde):** art. 11 — ou consentimento específico e destacado (inciso I) ou
  tutela da saúde (inciso II, alínea "f"). **Escolher com advogado.** A arquitetura precisa suportar
  as duas: se for consentimento, o sistema tem que **registrar e permitir revogar**, o que significa
  tabela de consentimento e efeito prático quando ele cai.

### D10.3 Minimização — a decisão que o modelo atual deixa em aberto
O `Caregiver` é global e carrega CPF. Hoje qualquer empresa enxerga a ficha inteira de qualquer
cuidador na fila de análise dela.

**Recomendação:** (a) CPF exposto **apenas** para empresa com vínculo ativo (`pending`, `approved`
ou `blocked` — não para quem nunca teve relação); (b) **mascarado na interface** por padrão
(`***.456.789-**`), com revelação sob registro de auditoria; (c) o campo nunca sai em listagem, só
na ficha individual.

### D10.4 Retenção — preencher, não deixar em branco
"Guardar para sempre" é a decisão padrão de quem não decidiu, e é a que dá multa. Precisa de prazo
por tipo:

| Dado | Prazo sugerido | Motivo |
|---|---|---|
| Registro de atendimento e horas | 5 anos | Prazo de discussão trabalhista/cível |
| Registro de auditoria (R12) | 5 anos | Prova de conformidade |
| Documento de identidade do cuidador | Enquanto houver vínculo ativo + 6 meses | Depois disso não serve a mais nada |
| Cadastro de cuidador sem nenhum vínculo | 12 meses de inatividade, depois anonimizar | Não há relação a manter |
| Mensagens | 2 anos | Contexto operacional |
| Sessões e registros de acesso | 6 meses | Investigação de incidente |

### D10.5 Direitos do titular (art. 18)
Cuidador e paciente podem pedir acesso, correção, portabilidade e eliminação.

**Recomendação:** rotina administrativa que (a) **exporta** tudo que se sabe de um titular em JSON e
(b) **anonimiza** em vez de apagar — substitui nome, CPF, contato e endereço por marcadores,
preservando o atendimento como fato contábil. Apagar a linha inteira destrói o comprovante de horas
de outra pessoa. **Prazo de resposta: 15 dias.**

### D10.6 Segurança (art. 46)
TLS obrigatório e HSTS · criptografia em repouso (provedores gerenciados já entregam; **confirmar no
contrato**) · segredos fora do repositório · acesso ao banco de produção nominal e registrado (quem
da equipe pode, e fica gravado) · dependências atualizadas · **dado real nunca em ambiente de
desenvolvimento** — o seed de desenvolvimento continua sendo o dataset fictício da demo, que já
existe e já é fictício por regra (`CLAUDE.md` §35).

### D10.7 Incidentes (art. 48)
Precisa existir procedimento escrito **antes** de acontecer: quem detecta, quem decide, quem comunica
ANPD e titulares. O prazo definido em resolução da ANPD é curto (hoje, 3 dias úteis) — **confirmar o
prazo vigente com assessoria jurídica na data da decisão.** Não dá para escrever o procedimento
durante o incidente.

### D10.8 Encarregado (DPO) e canal do titular
A Resolução CD/ANPD nº 2/2022 dá tratamento simplificado a agentes de pequeno porte — que é a
situação de hoje — mas **o canal de comunicação com o titular continua obrigatório**.
**Recomendação:** indicar uma pessoa responsável e publicar um e-mail de contato na política de
privacidade. Custo: zero. Ausência: achado imediato em qualquer diligência de cliente.

### D10.9 Registro das operações (art. 37)
Documento separado (ROPA): que dado se trata, com que base legal, por quanto tempo, com quem se
compartilha. É o primeiro documento que um cliente com jurídico vai pedir. Escreve-se uma vez e se
atualiza quando o tratamento muda.

### D10.10 Sub-operadores
Cada serviço contratado (hospedagem, banco, armazenamento, e-mail transacional, monitoramento de
erro) é um operador a declarar. **Manter a lista desde o primeiro serviço** — reconstruí-la depois é
arqueologia. Este é o argumento concreto por trás das recomendações de **D7** e **D9**: menos
fornecedores é menos superfície jurídica, não só menos conta a pagar.

---

## D11 — Ambientes, deploy, segredos e backup

- **Três ambientes:** desenvolvimento (Postgres local via Docker — Docker como conveniência de
  desenvolvimento, não como requisito de execução da demo), homologação, produção.
- **Segredos:** `.env` local fora do Git; em homologação e produção, gerenciador do provedor.
  Nenhuma chave no repositório, em nenhum momento — chave commitada e depois removida continua no
  histórico.
- **Migrações:** versionadas no Git, aplicadas no deploy, **nunca alteração manual em produção**.
- **Backup:** recuperação para um ponto no tempo (PITR) do provedor gerenciado — é um dos motivos de
  preferir gerenciado a VPS enquanto o time for pequeno.
- **Restauração testada.** Backup que nunca foi restaurado não é backup, é esperança. Sugestão:
  teste trimestral, com o resultado anotado.

---

## D12 — Observabilidade

Mínimo viável, sem construir plataforma:

- **Logs estruturados** (pino, que já vem com Fastify), com identificador de requisição.
- **Rastreamento de erro** (Sentry ou equivalente). **Atenção:** monitoramento de erro captura corpo
  de requisição, e corpo de requisição neste produto contém dado de saúde. Configurar a remoção de
  campos sensíveis **antes** de apontar para produção, e lembrar que a ferramenta entra na lista de
  sub-operadores (**D10.10**).
- **Verificação de disponibilidade** externa apontando para uma rota de saúde.

Métricas, painéis e rastreamento distribuído: **depois**. Não há volume que justifique.

---

## D13 — O que acontece com a demo comercial

**Esta decisão tem valor de negócio, não de arquitetura.** O `apps/web` de hoje é a ferramenta de
venda: roda offline, na máquina de quem apresenta, sem rede, sem login real, com reset entre
reuniões (`PRODUCT.md`). Um backend introduz exatamente aquilo que a apresentação não pode ter:
dependência de rede e de servidor de pé.

| Opção | Consequência |
|---|---|
| **A. Manter o adaptador de mocks vivo** | O `web` fala com uma interface; uma implementação chama a API, a outra é o `AppState` atual. Um sinalizador de build escolhe. **Custo próximo de zero, porque o código já existe** |
| **B. Ambiente de demonstração com dados semeados** | Realista, mas depende de rede na sala do cliente e de alguém lembrar de resetar o banco entre reuniões |
| **C. Abandonar a demo** | Perde-se a ferramenta comercial durante todos os meses da migração — justamente os meses em que é preciso vender |

**Recomendação: A agora, B quando houver cliente em piloto.** Não são excludentes.

Esta é, na prática, a maior recompensa de a camada de serviços já existir separada: a demo não morre
na migração — ela vira o *adaptador de mocks* de uma interface que o produto real também implementa.
Vale escrever isso como restrição de projeto: **nenhuma tela pode importar `services/storage` nem
`mocks/` diretamente.** Hoje isso já é verdade e precisa continuar sendo.

**A forma concreta dessa interface é uma decisão do frontend — ver D15 e D16.**

---
---

# PARTE II — Frontend

O frontend não é vítima passiva da separação: ele tem sete decisões próprias, e a maior parte do
esforço do projeto está aqui. Antes das decisões, o recorte honesto:

### O que **não** muda

Vale dizer primeiro, porque é a maior parte do trabalho já feito e nada disso está em risco:

- **O design system inteiro.** Os 26 componentes de `src/components/ui/`, os tokens do
  `src/index.css`, a tipografia, a escala, o `DESIGN_SYSTEM.md`. Nenhum deles sabe de onde vêm os
  dados. Melhor ainda: `Input` já tem `error`, `Button` já tem `loading`, e já existem `Skeleton`,
  `Vazio`, `Aviso`, `Toast` e `TelaCarregando` — **os estados de rede não precisam de componente
  novo, precisam de fiação** (**D20**).
- **As URLs e a estrutura de rotas.** `/empresa/atendimentos/:id/cuidadores` continua sendo isso.
- **Os layouts por perfil**, a navegação, a responsividade e a acessibilidade.
- **Tailwind, Vite e o build.** Não há motivo para trocar nada disso.

### O que muda

- **De onde vêm os dados** em todas as 19 telas.
- **Como a tela sabe quem está logado** (o cookie `httpOnly` de **D7** não é legível por JavaScript).
- **Quem filtra as listas** — hoje é o navegador, em cima de tudo que ele já tem.
- **Como os formulários validam** — hoje é manual, e o maior deles tem 26 `useState`.

---

## D14 — Estrutura de pastas do `apps/web`

**Em jogo:** onde mora o código que fala com a API.

O achado que motiva a decisão: **`src/features/` tem nove pastas e todas contêm apenas
`.gitkeep`.** A estrutura prevista no `CLAUDE.md` §12 foi criada e nunca usada — o que emergiu de
verdade foi `pages/` + `services/` + `components/`, e funcionou bem para uma demo. A pergunta agora
é onde colocar ~14 módulos novos de acesso a rede sem transformar `services/` numa pasta sem dono.

| Opção | Como fica | Contra |
|---|---|---|
| **A. Manter plano** | `services/` deixa de ter regra de negócio e passa a ter chamadas de API | Vira uma pasta de 14 arquivos sem agrupamento; o nome "services" passa a significar outra coisa |
| **B. Adotar `features/` de verdade** | `features/atendimentos/` com `api.ts`, `hooks.ts`, componentes próprios | Move telas de lugar — mexe em coisa que está funcionando |
| **C. Híbrido** | `pages/` fica onde está; `services/` é esvaziado e vira `features/<domínio>/` com `api.ts` + `hooks.ts` + helpers que continuam sendo do cliente | Duas convenções convivendo por um tempo |

**Recomendação: C.**

As telas ficam onde estão — elas funcionam, foram aprovadas visualmente e mexer nelas por motivo de
organização é risco sem retorno. O que se reorganiza é a camada que **vai ser reescrita de qualquer
jeito**: cada domínio ganha uma pasta com o acesso à API, os hooks de consulta e mutação, e os
poucos helpers que continuam fazendo sentido no navegador (formatação, ordenação de lista já
carregada).

E as pastas de `features/` que não forem usadas ao fim da migração **são apagadas**. Pasta vazia
versionada é uma promessa que o projeto não cumpriu; nove delas é um mapa que aponta para o lugar
errado.

> **Reversibilidade: alta.** É movimentação de arquivo, sem efeito em dados nem em contrato.

---

## D15 — Camada de dados no cliente

**Em jogo:** o que substitui o `AppStateProvider`.

| Opção | A favor | Contra |
|---|---|---|
| **TanStack Query** | Cache, revalidação, invalidação por chave, estados de carregando/erro prontos; feito exatamente para dado que vem de servidor | Uma dependência a aprender |
| **SWR** | Mais leve, mesma ideia | Menos recursos para mutação e invalidação |
| **`fetch` + `useState` na tela** | Zero dependências | Reescrever cache, revalidação e sincronização entre telas à mão, 19 vezes |
| **Redux / Zustand** | Estado global previsível | **Resolve o problema errado.** Estado de servidor não é estado global do cliente; guardá-lo num store dá o mesmo blob de hoje, só que com mais cerimônia |

**Recomendação: TanStack Query.**

O argumento é o domínio, não a moda. Este produto é cheio de efeito cruzado: confirmar uma
candidatura muda o atendimento, as outras candidaturas **e** as notificações; aprovar um cuidador
muda o quadro, a busca de compatíveis **e** o registro de atividade. É exatamente o que o modelo de
invalidação por chave resolve — a mutação declara o que ficou velho, e as telas afetadas se
atualizam sozinhas. Escrito à mão, isso vira 27 lugares lembrando de recarregar as coisas certas.

**Decisão que acompanha: não entra gerenciador de estado global.** Depois da migração sobram três
tipos de estado, e cada um tem lugar próprio: dado de servidor (TanStack Query), sessão (**D16**) e
estado de tela — filtro, aba aberta, modal — que continua em `useState` local, como já está hoje.

> **Reversibilidade: média.** Trocar por SWR depois é reescrever os hooks de `features/`, não as
> telas — desde que as telas consumam `useAtendimentos()`, e não a biblioteca direto. **Essa regra
> vale a pena escrever:** nenhuma tela importa TanStack Query; ela importa o hook do domínio.

---

## D16 — Sessão no cliente

**Em jogo:** como o navegador sabe quem está logado, quando o token deixa de ser legível.

Hoje `SessionProvider` chama `useState(loadSession)` e lê o `localStorage` de forma **síncrona** —
na primeira renderização o app já sabe quem é, e já tem `companyId` e `caregiverId` na mão. Com
cookie `httpOnly` (**D7**) isso acaba: o JavaScript **não consegue ler o cookie**. A identidade
passa a vir de uma chamada, `GET /me`, e isso tem três consequências concretas:

1. **O app ganha um estado de "ainda não sei".** Entre abrir e a resposta do `/me` chegar, não dá
   para decidir entre a tela de entrada e o painel. Sem cuidado, isso vira um piscar da tela de
   login em toda recarga. **Recomendação:** `TelaCarregando` — que já existe e já é usada em
   `LoginPage` — enquanto o `/me` não responde.
2. **`ProtectedRoute` muda de fonte.** Hoje ela chama `isCaregiverActive(state, ...)` sobre o estado
   inteiro para aplicar R1. Com backend, quem responde isso é o servidor: o `/me` devolve o papel e
   se o cuidador tem algum vínculo ativo. A guarda deixa de calcular a regra e passa a **ler o
   veredito** — que é o certo, porque a regra tem que valer mesmo para quem chamar a API direto.
3. **Sair da conta vira uma requisição.** Limpar `localStorage` não invalida nada; é o servidor que
   apaga a sessão.

**Recomendação:** `/me` como uma consulta do TanStack Query, com o resultado exposto por um
`useSession()` que mantém a mesma forma de hoje. As telas que hoje fazem
`const { session } = useSession()` **não mudam** — muda o que está por trás.

> **Reversibilidade: alta.** É uma consulta a mais.

---

## D17 — Domínio, cookie e CORS

**Em jogo:** se `web` e `api` respondem no mesmo domínio. Parece detalhe de infra; é decisão de
frontend porque muda a segurança do cookie e a complexidade de toda chamada.

| Opção | Consequência |
|---|---|
| **A. Mesma origem** — `acalento.com` serve o app, e `acalento.com/api` vai para o backend por proxy reverso | Cookie continua `SameSite=Lax`. **Não existe CORS**, não existe preflight, não existe requisição com `credentials` explícito. O `vite.config.ts` ganha um `server.proxy` no desenvolvimento — hoje ele não tem nenhuma configuração além dos plugins |
| **B. Domínios separados** — `app.acalento.com` e `api.acalento.com` | Cookie tem que ser `SameSite=None; Secure`, o que é justamente a configuração que abre espaço para CSRF; CORS com `credentials` em toda rota; preflight em toda mutação; e um token anti-CSRF passa a ser obrigatório |

**Recomendação: A — mesma origem, com o backend atrás de `/api`.**

Isso não é preferência estética: `SameSite=Lax` é uma proteção contra CSRF que se ganha de graça, e
a opção B a entrega em troca de nada que o produto precise. Separar por subdomínio resolve um
problema de escala e de time que este produto não tem.

**Decisão que acompanha:** a URL da API vem de `import.meta.env.VITE_API_URL`, com padrão `/api`.
Hoje **não existe nenhum uso de `import.meta.env` no projeto** — este é o primeiro, e é o que
permite o mesmo build apontar para desenvolvimento, homologação e produção.

> **Reversibilidade: média.** Sair de A para B depois obriga a rever cookie, CORS e CSRF de uma vez.

---

## D18 — Filtros, busca e paginação

**Em jogo:** quem filtra — o navegador ou o banco.

Hoje tudo é no navegador, porque tudo já está nele: `filterCaregivers` em `CaregiversPage`,
`filterMatches` em `MatchingPage`, `buildReport` em `ReportsPage`. Isso não sobrevive a uma base
real.

**Recomendação — uma regra, não uma lista de exceções:**

> **Filtra no servidor a lista que cresce sem limite; filtra no cliente a lista que o próprio
> contexto da tela já limita.**

Na prática:

| Lista | Onde filtrar | Por quê |
|---|---|---|
| Atendimentos, quadro de cuidadores, agenda, notificações | **Servidor** (parâmetros de query) | Crescem com o tempo e com o tamanho da empresa |
| Relatório de horas | **Servidor**, sempre | É agregação, e o CSV sai de lá (**§1.3**) |
| Cuidadores compatíveis (`MatchingPage`) | **Servidor** — a compatibilidade é R1+R2+R3, regra de negócio | Nunca no cliente: enviar quem não é compatível para o navegador filtrar é vazar quem a empresa não devia ver |
| Candidaturas de um atendimento, mensagens de um atendimento, atividades marcadas | **Cliente** | Já vêm limitadas pelo atendimento; são dezenas, não milhares |

**Paginação:** decidir **cursor** (baseado em data) para as listas ordenadas por tempo —
atendimentos, notificações, registro de atividade. Offset é mais simples e aceitável nas listas
curtas. A escolha precisa ser feita **antes** de escrever o primeiro endpoint de listagem, porque
muda a forma da resposta.

> **Reversibilidade: média.** Mudar um filtro de lugar depois mexe no endpoint e na tela juntos.

---

## D19 — Formulários e validação

**Em jogo:** como o formulário valida, agora que existe um schema Zod compartilhado (**D3**).

Hoje é tudo manual: `NewAttendancePage` tem **26 `useState`**, `ProfilePage` tem 12,
`RegisterPage` tem 10. Funciona, mas duplica a regra — o formulário decide o que é válido, e o
servidor vai decidir de novo.

| Opção | A favor | Contra |
|---|---|---|
| **react-hook-form + `zodResolver`** | O **mesmo** schema de `packages/shared` valida o formulário e a requisição; menos renderização; erro por campo pronto | Uma dependência |
| **Manter `useState` manual** | Zero dependências | A regra de validação vive em dois lugares e vai divergir |

**Recomendação: react-hook-form com `zodResolver`.**

O ganho concreto está no componente que já existe: `Input`, `Select` e `Textarea` já recebem
`error` e já ligam `aria-invalid` e `aria-describedby` (`src/components/ui/field.ts`). Ou seja, a
mensagem de erro que o resolver produz **cai num componente pronto, com acessibilidade já
resolvida** — não há nada de UI para construir, só para conectar.

> **Reversibilidade: alta.** Formulário a formulário, sem efeito em contrato nem em dados.

---

## D20 — Estados de rede na interface

**Em jogo:** o que a tela mostra enquanto espera, e o que mostra quando dá errado.

Nada disso precisa ser desenhado — `Skeleton`, `Vazio`, `Aviso`, `Toast`, `TelaCarregando` e o
`loading` do `Button` já existem e já respeitam o design system. Falta **decidir a convenção**, para
que 19 telas não resolvam a mesma pergunta de 19 maneiras.

**Recomendação — a convenção:**

| Situação | Tratamento |
|---|---|
| Primeira carga da tela | `Skeleton` com a forma do conteúdo, não um spinner centralizado |
| Revalidação (dado já na tela) | **Mantém o dado antigo visível.** Não pisca, não volta para skeleton |
| Lista vazia de verdade | `Vazio`, com a ação principal da tela dentro |
| Erro de leitura | `Aviso` na área do conteúdo, com "tentar de novo" |
| Erro de mutação | `Toast` — a tela não se desmonta por causa de um botão que falhou |
| Mutação em andamento | `Button` com `loading`, que já desabilita e já marca `aria-busy` |
| Sessão expirada (401) | Tratamento **global** no cliente HTTP: limpa a sessão e manda para a entrada. Não pode ser resolvido tela a tela |

**Decisão explícita: sem mutação otimista, por padrão.**

Este é o ponto em que o domínio decide contra o reflexo técnico. Neste produto a mutação **pode ser
recusada pela regra**: R4 barra horário sobreposto, R1 barra quem não está no quadro, R6 barra
check-out sem check-in. Mostrar "convite aceito" e voltar atrás três décimos depois é pior que
esperar — e pior ainda no celular do cuidador, que é onde essas ações acontecem, muitas vezes com
sinal ruim na porta da casa do paciente. Otimismo fica reservado para o que não pode falhar, como
marcar notificação como lida.

> **Reversibilidade: alta.** É convenção, e convenção se ajusta.

---

## §3. O que muda em cada grupo de telas

A ordem é a da Fase 5 do roteiro, e cada linha é uma entrega que pode ir para produção sozinha.

| Grupo | Telas | Vira consulta | Vira mutação | Cuidado especial |
|---|---|---|---|---|
| **1. Autenticação** | Entrada, Cadastro, Cadastro em análise | `GET /me` | Login, logout, cadastro de cuidador | **D16** inteiro: o piscar da tela de entrada e a guarda de rota |
| **2. Quadro e cuidadores** | Cuidadores (3 abas), Ficha do cuidador | Quadro, fila, inativos, ficha | Aprovar, recusar, bloquear, reativar, favoritar | Filtro vai para o servidor (**D18**); CPF mascarado (**D10.3**) |
| **3. Atendimentos** | Atendimentos (empresa e cuidador), Novo atendimento | Listagens com filtro e paginação | Publicar atendimento | Formulário maior do projeto — 26 `useState` (**D19**) |
| **4. Convites e candidaturas** | Compatíveis, Candidaturas, Convites | Compatíveis, candidaturas do atendimento | Convidar, aceitar, recusar, candidatar-se, confirmar | Compatibilidade **nunca** no cliente (**D18**); erro de R4 chega do servidor e vira `Toast` |
| **5. Check-in e registro** | Detalhe do atendimento | Atendimento, registro | Check-in, check-out, tarefas, observação | Tela com mais mutações do projeto (8 pontos); sem otimismo (**D20**) |
| **6. Avaliações e relatórios** | Detalhe, Relatórios | Relatório com filtros | Avaliar | Relatório e CSV saem do servidor |
| **7. Mensagens e notificações** | Detalhe, Notificações | Mensagens do atendimento, notificações | Enviar mensagem, marcar lidas | Sem WebSocket: revalidação por intervalo resolve a demo e o MVP |

---
---

# PARTE III — Execução

---

## §4. Roteiro de migração

Cada fase tem critério de pronto. A demo comercial permanece funcionando da Fase 0 à Fase 5.

### Fase 0 — Decidir (este documento)
Preencher o quadro de §5. Sem isso, as fases seguintes viram retrabalho.
**Pronto quando:** as 20 decisões têm dono e resposta.

### Fase 1 — Reorganizar o repositório
Mover o aplicativo atual para `apps/web`. Criar `packages/shared` com os tipos de `src/types/`.
Criar `apps/api` vazio. Nenhuma linha de lógica muda.
**Pronto quando:** `npm install && npm start` continua abrindo a demo exatamente como hoje.

### Fase 2 — Banco e schema
Schema Prisma derivado de `src/types/`. Migração inicial. Seed traduzido de `src/mocks/`.
Aqui entram as decisões de **D6**: IDs, centavos, fuso, `verified` no vínculo, exclusão lógica.
**Pronto quando:** um comando recria o cenário da demonstração no banco, com os casos de borda
propositais (Beatriz, Paulo Ricci, `at7`) preservados.

### Fase 3 — Esqueleto do backend e autenticação
Fastify, sessão, cadastro, login, logout, recuperação de senha. Middleware de sessão e de empresa.
**Pronto quando:** existe login com senha em argon2id, cookie `httpOnly`, e o teste de isolamento
entre duas empresas passa.

### Fase 4 — Mudar as regras de lugar
`src/services/` viram casos de uso no backend, com transação. R1–R12 ganham teste automatizado —
**os primeiros testes automatizados do projeto**, e eles nascem no lugar certo: sobre a regra, não
sobre a tela. Aqui se resolvem os problemas de §1.3 (R4 sob concorrência, `confirmApplication` em
transação, notificações automáticas como tarefa agendada).
**Pronto quando:** R1–R12 rodam e passam no backend sem React envolvido.

### Fase 5 — Trocar o transporte no frontend (a fase cara)
Sai o blob `AppState`; entram as decisões da Parte II. São 27 pontos de mutação e 19 telas lendo
estado. A ordem e o recorte de cada entrega estão em **§3** — grupo por grupo, cada um podendo ir
para produção sozinho.
**Pronto quando:** `apps/web` funciona contra a API **e** o adaptador de mocks (**D13**) continua
funcionando para a apresentação.

### Fase 6 — Produção
Arquivos (**D9**), rotina de exportação e anonimização (**D10.5**), backup com restauração testada,
observabilidade, deploy, política de privacidade e ROPA.
**Pronto quando:** existe procedimento escrito de incidente e um restore de backup foi feito de
verdade uma vez.

---

## §5. Quadro de decisões

Preencher em reunião. Enquanto houver linha em branco, a Fase 1 não começa.

### Parte I — Backend, banco e proteção de dados

| # | Decisão | Recomendação | Reversibilidade | Escolhido | Dono |
|---|---|---|---|---|---|
| D1 | Formato do repositório | Um repo: `apps/web` + `apps/api` + `packages/shared` | Alta | | |
| D2 | Framework do backend | Fastify + TypeScript | Alta | | |
| D3 | Contrato front/back | REST + Zod compartilhado | Média | | |
| D4 | Banco | PostgreSQL gerenciado, **região São Paulo** | Motor: baixa · Provedor: alta | | |
| D5 | Acesso a dados | Prisma | Média | | |
| D6 | Modelagem (7 pontos) | uuid v7 · centavos · fuso explícito · `verified` no vínculo · exclusão lógica · auditoria só-inserção | **Baixa** | | |
| D7 | Autenticação | Better Auth ou sessão própria; cookie `httpOnly`, argon2id | Média | | |
| D8 | Isolamento entre empresas | Empresa vem da sessão · filtro no repositório · teste de isolamento | Alta | | |
| D9 | Arquivos | S3-compatível privado, URL assinada, sem reconhecimento facial | Alta | | |
| D10 | LGPD | Papéis definidos · base legal do dado de saúde · retenção por tabela · canal do titular | **Baixa** | | |
| D11 | Ambientes e backup | Três ambientes · PITR · restore testado | Alta | | |
| D12 | Observabilidade | pino + Sentry com remoção de campos sensíveis | Alta | | |
| D13 | Futuro da demo | Manter o adaptador de mocks vivo | Alta | | |

### Parte II — Frontend

| # | Decisão | Recomendação | Reversibilidade | Escolhido | Dono |
|---|---|---|---|---|---|
| D14 | Estrutura do `apps/web` | Telas ficam; `services/` vira `features/<domínio>/`; apagar pastas vazias | Alta | | |
| D15 | Camada de dados no cliente | TanStack Query · sem gerenciador de estado global | Média | | |
| D16 | Sessão no cliente | `GET /me` como consulta; `TelaCarregando` no arranque; guarda lê o veredito do servidor | Alta | | |
| D17 | Domínio, cookie e CORS | **Mesma origem**, backend em `/api`; `SameSite=Lax`; `VITE_API_URL` | Média | | |
| D18 | Filtros e paginação | Servidor para lista que cresce; cliente para lista que a tela já limita; compatibilidade nunca no cliente | Média | | |
| D19 | Formulários | react-hook-form + `zodResolver`, com o schema de `packages/shared` | Alta | | |
| D20 | Estados de rede | Convenção única · **sem mutação otimista** | Alta | | |

**As duas linhas de reversibilidade baixa — D6 e D10 — merecem a maior parte do tempo da reunião.**
As outras dezoito se corrigem depois; estas duas se pagam em migração de dados e em conversa com
advogado.

---

## §6. O que continua fora de escopo

Confirmado do `CLAUDE.md` §36 e do `PRODUCT.md`, e que segue valendo depois da separação:
pagamentos, prontuário eletrônico completo, aplicativo da família, teleatendimento, integrações
contábeis, consulta automática ao conselho de classe, contrato assinado digitalmente.

Fora de escopo **da migração** especificamente, mesmo sendo produto legítimo depois: notificação por
push, tempo real por WebSocket, aplicativo nativo, múltiplos idiomas, funcionamento offline do
check-in, e reescrita de qualquer tela por motivo estético — a Parte II troca a origem dos dados,
não o desenho.
