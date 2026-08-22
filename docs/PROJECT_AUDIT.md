# PROJECT_AUDIT.md — Auditoria do estado atual do projeto

> Rodada de auditoria (sem implementação de novas funcionalidades), conforme solicitado. Compara
> o que existe no repositório com o `CLAUDE.md` (regras vigentes do projeto, carregado como
> instrução de sistema) e com o `docs/IMPLEMENTATION_PLAN.md` existente. Resultado: **descompasso
> estrutural entre a arquitetura exigida e a arquitetura entregue**, descrito em detalhe abaixo.
> As correções de status já aplicadas ao plano estão na seção 7; a próxima etapa recomendada está
> na seção 8.

---

## 1. Resumo executivo

- O `CLAUDE.md` da raiz do projeto — que rege este trabalho e cujas instruções têm prioridade —
  exige um **projeto frontend real, executável com `npm install` + `npm run dev`**, em
  **React + TypeScript + Vite + Tailwind CSS**, com estrutura modular (`src/components`,
  `src/features`, `src/mocks`, `src/services`, `src/types` etc.) e persistência via
  **`localStorage`**.
- O que existe hoje é **um único artifact React (`app_acalento_homecare.jsx`, 1970 linhas) mais
  um segundo arquivo de showcase (`componentes_base_design_system.jsx`, 534 linhas)**, escritos
  para rodar dentro do ambiente de artifacts do Claude.ai — não como um projeto npm. Não há
  `package.json`, não há `src/`, não há `vite.config`, não há `tsconfig`, não há `node_modules`.
  **`npm install` e `npm run dev` não funcionam neste projeto hoje** — não porque falte instalar
  algo, mas porque não existe projeto npm nenhum para instalar.
- O `docs/IMPLEMENTATION_PLAN.md` documenta essa escolha como uma **decisão de arquitetura
  deliberada** (seção 2.2 do plano): o artifact single-file foi escolhido porque, na sessão em que
  foi construído, o ambiente de desenvolvimento não tinha acesso de rede para `npm install`. Essa
  decisão é anterior ao `CLAUDE.md` atual (que não estava versionado no repositório até esta
  auditoria — ver seção 6) e **hoje contradiz diretamente a regra mais importante do `CLAUDE.md`**
  (seção 2: "O projeto precisa funcionar localmente com `npm install` / `npm run dev`").
- Além do empacotamento, há quatro divergências adicionais de stack: **zero TypeScript** (arquivos
  são `.jsx`, sem tipos/enums/interfaces), **zero Tailwind** (o plano afirma "Tailwind (classes
  core)" na seção 2.1, mas o código usa CSS customizado via `<style>{STYLE}</style>` com prefixo
  `ac-*` — 179 ocorrências, 0 classes Tailwind), **persistência via `window.storage`** (API que não
  existe em um navegador/projeto Vite comum — precisa virar `localStorage`, exatamente como o
  `CLAUDE.md` seção 15 já pedia), e **arquitetura não-modular** (tudo em 1-2 arquivos, sem
  `src/mocks`, `src/services`, `src/types` etc. exigidos na seção 12/13/14/17 do `CLAUDE.md`).
- **Nenhuma das 22 etapas marcadas `[x] Concluída` foi de fato executada em um navegador.** O
  próprio `docs/DEMO_GUIDE.md` (seção 3, nota final) admite isso: a validação foi "por revisão
  cuidadosa do código e checagem de balanceamento sintático", não por cliques reais — porque não
  havia como rodar a aplicação. Isso viola diretamente o critério de conclusão do processo atual
  (uma etapa só é `[x]` quando está implementada **e executando e testada e validada**). Corrigido
  na seção 7 abaixo.
- **O que existe é valioso e não deve ser descartado**: a lógica de negócio (R1–R12), o dataset
  seed, a cobertura dos 4 perfis e a documentação (`IMPLEMENTATION_PLAN.md`, `DESIGN_SYSTEM.md`,
  `DEMO_GUIDE.md`) são consistentes, bem pensados e alinhados ao domínio do Home Care. O trabalho a
  fazer não é "recomeçar do zero" — é **portar esse conteúdo já validado para a arquitetura real**
  que o `CLAUDE.md` exige. Ver seção 4.

---

## 2. Inventário do que existe hoje

```
mvp_acalento_homecare/
├── CLAUDE.MD                          ← regras vigentes do projeto (não versionado — ver seção 6)
├── README.md                          ← descreve o projeto como "artifact, sem build local"
├── app_acalento_homecare.jsx          ← app completo, 1970 linhas, arquivo único
├── componentes_base_design_system.jsx ← showcase de componentes, 534 linhas, arquivo único
└── docs/
    ├── IMPLEMENTATION_PLAN.md         ← plano com 22 etapas, todas marcadas [x] Concluída
    ├── DESIGN_SYSTEM.md               ← paleta, tipografia, layout (documento, sem código)
    ├── DEMO_GUIDE.md                  ← roteiro comercial + checklist de validação
    └── PROJECT_AUDIT.md               ← este documento (novo)
```

Não existem: `package.json`, `vite.config.*`, `tsconfig*.json`, `tailwind.config.*`, `src/`,
`node_modules/`, `.gitignore`, testes, arquivos `.ts`/`.tsx`. Não foi localizado no repositório o
`MVP_Home_Care.docx` citado como fonte principal de requisitos pelo `CLAUDE.md` (seção 1) e pelo
`IMPLEMENTATION_PLAN.md` (que diz tê-lo usado para a Revisão 2) — provavelmente foi enviado em uma
conversa anterior e não ficou salvo como arquivo no projeto. Isso não invalida o conteúdo do plano
(ele é internamente consistente e detalhado o bastante para ser usado como fonte), mas deve ser
registrado: se o `.docx` reaparecer, vale reconferir o plano contra ele diretamente.

---

## 3. Divergências entre `CLAUDE.md` (regra vigente) e o projeto atual

| # | Exigência do `CLAUDE.md` | Estado atual | Severidade |
|---|---|---|---|
| 1 | "O projeto precisa funcionar localmente com `npm install` / `npm run dev`" (seção 2) | Não existe `package.json`. Não há como instalar nem rodar. | **Bloqueante** |
| 2 | Stack: React, **TypeScript**, Vite, **Tailwind CSS**, Lucide (seção 4) | React ok. Lucide ok (`lucide-react` importado corretamente). TypeScript: 0%. Vite: inexistente. Tailwind: 0 classes usadas — CSS customizado via template string injetado em `<style>`. | **Bloqueante** |
| 3 | Persistência: `localStorage`, "não tratar como banco de produção" (seção 15) | Código usa `window.storage.get/set` (7 chamadas), uma API que **não existe** em um app Vite/React comum — quebraria imediatamente em um navegador real fora do ambiente de artifacts do Claude.ai. | **Bloqueante** |
| 4 | Arquitetura modular: `src/components`, `src/features/*`, `src/mocks/*`, `src/services/*`, `src/types/*`, `src/hooks`, `src/utils`, `src/constants` (seção 12) | Tudo em 2 arquivos `.jsx` no root do projeto. Nenhuma pasta `src/`. Mocks, serviços, tipos, componentes UI e regras de negócio estão todos misturados no mesmo arquivo. | **Alta** |
| 5 | "Criar tipos para, no mínimo: User, Company, Caregiver, Patient, Attendance..." + enums (seção 17) | Nenhum tipo declarado — nem via TypeScript, nem via JSDoc, nem via `PropTypes`. Objetos JS soltos. | **Alta** |
| 6 | "Serviços mockados" com interface (`PatientService` etc.) para separar UI de armazenamento, trocável por `ApiService` no futuro (seção 14) | Não existe camada de serviço. As telas chamam `persist()` diretamente e leem `state.*` diretamente — lógica de negócio, acesso a dados e UI estão todos no mesmo componente. | **Média** |
| 7 | Mobile first **de verdade**, responsivo em mobile/tablet/desktop/notebook (seção 8) | A "responsividade" implementada é uma **moldura decorativa de celular fixa em 320px** (`ac-phone-frame`) com um layout de admin fixo para desktop — não há breakpoints reais, `@media`, nem teste em larguras variadas. É um recurso de apresentação adequado para um artifact estático, mas **não é responsividade real** de uma página web. | **Média** — precisa virar responsividade de verdade quando a UI for reconstruída como página web real. |
| 8 | Design system consistente (seção 6) e direção visual "Healthcare Premium + Human SaaS", evitando roxo/gradiente genérico (seção 5) | **Bom alinhamento aqui.** Paleta (`--ink #16241F`, `--accent #E8A33D` etc.), tipografia (Fraunces/Work Sans/IBM Plex Mono) e o elemento de assinatura (o "crachá") documentados em `DESIGN_SYSTEM.md` respeitam as restrições do `CLAUDE.md` (nada de roxo/gradiente/glassmorphism). Esse conteúdo é reaproveitável quase 1:1 ao portar para Tailwind (tokens → `tailwind.config`). | Sem problema — apenas precisa ser reimplementado em Tailwind. |
| 9 | README com instalação, contas de demo, arquitetura, mocks, `localStorage`, reset, limitações (seção 45) | `README.md` existe mas descreve o projeto como artifact "sem necessidade de build local", o que hoje contradiz a regra 2 do `CLAUDE.md`. Corrigido nesta rodada (seção 7.3). | Baixa (documentação) |

---

## 4. O que já está pronto e deve ser reaproveitado (não descartar)

O `CLAUDE.md` é explícito: "Não apague código funcional sem necessidade" e "preserve o trabalho
funcional existente". Nada foi apagado nesta auditoria. Pontos fortes que devem servir de base
para a reimplementação:

- **Regras de negócio (R1–R12)** estão centralizadas em funções puras e testáveis
  (`cuidadoresCompativeis`, `categoriaExigida`, `temSobreposicao`, `notaMediaCuidador`,
  `horasFechadas`) — isso já segue a regra do `CLAUDE.md` seção 18 ("regras centralizadas em
  funções/serviços de domínio, não espalhadas por componentes"). Ao portar, essas funções migram
  quase sem alteração para `src/features/*/services` ou `src/utils`.
- **Dataset seed (`seedData()`)** cobre os quatro perfis, as três categorias de cuidador, estados
  variados de atendimento, e casos de borda propositais para cada regra (ex.: Beatriz com 1
  avaliação só para mostrar R10, atendimento a7 cancelado com 11h de antecedência para mostrar R8).
  Isso atende à seção 13 do `CLAUDE.md` quase integralmente.
- **Cobertura de telas**: as 17 telas do documento de produto + área de administração existem e
  têm navegação entre si coerente com os fluxos descritos no `CLAUDE.md` (seções 19, 26–34).
- **Documentação de produto** (`IMPLEMENTATION_PLAN.md`, `DESIGN_SYSTEM.md`, `DEMO_GUIDE.md`) é
  detalhada, rastreável às regras de negócio, e não precisa ser recriada do zero — precisa ser
  corrigida quanto a status de execução (feito nesta rodada) e depois mantida etapa a etapa durante
  a reimplementação.

**Conclusão prática:** os arquivos `.jsx` atuais devem ser tratados como **protótipo/UX de
referência** — a fonte da verdade para "como cada tela deve se comportar" — e não como o código
final. A reimplementação porta a lógica e a UX para dentro da arquitetura real, não reinventa o
comportamento do zero.

---

## 5. Bugs/inconsistências pontuais notadas (não bloqueantes, registrar para a etapa certa)

Estes não fazem parte do gap arquitetural, são notas de revisão de código encontradas ao ler
`app_acalento_homecare.jsx` — relevantes para quando a tela correspondente for reimplementada:

- `EmpresaEscala` e outras telas usam `cuidadorPorId` sem checar `null` quando
  `a.cuidadorConfirmadoId` é `undefined`; funciona hoje porque o código sempre guarda com `? :`,
  mas vale um tipo estrito (`Caregiver | null`) para o TypeScript pegar isso automaticamente na
  reimplementação.
- O botão "Publicar" em `NovoAtendimento` não valida `data`/`hora` no passado nem duração ≤ 0 —
  aceitável para demo, mas vale decidir explicitamente se isso é intencional ao portar.
- `RegistroAtendimento` permite anexar "fotos simuladas" mesmo após o registro estar com tarefas
  100% concluídas mas antes do check-out — comportamento aparentemente correto, só não está coberto
  no `DEMO_GUIDE.md` checklist.

Nenhuma correção de código foi feita para esses pontos nesta rodada (fora do escopo desta
auditoria).

---

## 6. Nota sobre governança de documentos

O `CLAUDE.md` da raiz (todo em maiúsculas no arquivo, `CLAUDE.MD`) está **presente no disco mas
não commitado** (`git status` mostra como *untracked*, junto de `.claude/` e `.impeccable/`). Ele é
carregado como instrução de sistema com prioridade sobre qualquer comportamento padrão, e é mais
recente/abrangente do que as decisões de arquitetura registradas no `IMPLEMENTATION_PLAN.md`
(que foi escrito e commitado — commit único `f85edfc` — antes de `CLAUDE.md` existir no repo).
**Nesta auditoria, `CLAUDE.md` foi tratado como a fonte de regras vigente**, e o plano foi corrigido
para refletir isso. Esta auditoria não commitou nada — os commits ficam a critério do usuário.

---

## 7. Correções já aplicadas nesta rodada

Conforme o processo ("corrigir o IMPLEMENTATION_PLAN.md" + "eventuais pequenas correções
estruturais para deixar o projeto consistente" + "NÃO implemente novas funcionalidades"), esta
rodada aplicou apenas correções documentais, sem tocar em código de aplicação:

1. **`docs/IMPLEMENTATION_PLAN.md`**
   - Nova **Etapa 0 — Bootstrap do Projeto Real**, inserida antes da Etapa 1, marcada
     `[ ] Não iniciada` — é o próximo passo obrigatório (ver seção 8).
   - Status das Etapas 1–22 corrigidos para refletir a realidade de execução (nenhuma rodou em
     navegador de verdade). Critério aplicado: só é `[x] Concluída` uma etapa que roda no projeto
     real, foi testada e atende aos critérios de aceite. Resumo das mudanças:
     - Etapas 1 e 2 (conteúdo de análise e design system, sem exigir app rodando): mantidas `[x]`
       com nota — o *conteúdo* é válido e reaproveitável; a *implementação em código* da Etapa 2
       (componentes-base) foi rebaixada para `[!]` porque usa CSS customizado em vez de Tailwind.
     - Etapas 3 a 19 (lógica e telas dentro do artifact): rebaixadas para `[~] Em andamento` —
       lógica/UX prototipadas e revisadas por leitura de código, mas não executadas nem testadas em
       navegador, e implementadas em arquitetura que será substituída.
     - Etapa 20 (Responsividade): rebaixada para `[ ] Não iniciada` — o que existe é uma moldura
       decorativa fixa, não responsividade real (ver seção 3, item 7).
     - Etapa 21 (Validação manual do fluxo completo): rebaixada para `[!] Precisa de correção` — o
       próprio `DEMO_GUIDE.md` documenta que a validação foi só por leitura de código.
     - Etapa 22 (Preparação para apresentação): rebaixada para `[~] Em andamento` — o guia existe e
       é bom conteúdo, mas descreve como abrir "o artifact" em vez de rodar `npm run dev`.
   - Novo registro na seção 6 (Log de Decisões), "Revisão 4", explicando o pivô de arquitetura.
2. **`README.md`**: corrigida a seção "Como usar", que afirmava não haver necessidade de build
   local — hoje isso contradiz a regra 2 do `CLAUDE.md`. Passou a refletir o estado real e apontar
   para a Etapa 0.

Nenhum código de aplicação foi criado, movido ou apagado. Nenhuma migração estrutural foi feita.

---

## 8. Próxima etapa recomendada

**Etapa 0 — Bootstrap do Projeto Real**, conforme já registrada no `IMPLEMENTATION_PLAN.md`
corrigido. Ela é pré-requisito de tudo o mais porque nenhuma outra etapa pode ser validada
("executando e testada", conforme a regra de conclusão) sem um projeto que rode. Resumo do que ela
cobre (detalhe completo no plano): inicializar Vite + React + TypeScript, configurar Tailwind,
criar a estrutura `src/` da seção 12 do `CLAUDE.md`, mover os tokens de `DESIGN_SYSTEM.md` para
`tailwind.config`, confirmar `npm install && npm run dev` funcionando com uma tela mínima.

Esta auditoria **não implementa** a Etapa 0 — apenas a identifica e a documenta, conforme
solicitado. Fica pendente autorização explícita do usuário para iniciar a implementação.
