# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Usuário primário — coordenação da empresa de home care (perfil Empresa).** Dono ou coordenador
que decide, sob pressão de tempo, quem vai cobrir um plantão. Trabalha no computador durante a
coordenação e no celular fora dela. É também a plateia da demonstração comercial: o roteiro de
apresentação existe para que essa pessoa reconheça a própria operação na tela.

**Usuários secundários — cuidadores (perfil Cuidador).** Duas naturezas dentro do mesmo perfil:

- *Cuidador informal* — sem formação técnica/superior. Higiene, banho, alimentação, apoio para
  locomoção, lembrete de medicação já separada, companhia, acompanhamento em consultas.
- *Cuidador com formação* — técnico de enfermagem, enfermeiro, fisioterapeuta, fonoaudiólogo,
  nutricionista, terapeuta ocupacional. Mesmo fluxo, mais registro no conselho de classe e
  especialidades.

Uso predominantemente no celular, em deslocamento entre atendimentos.

**Quem não é usuário nesta versão:** paciente e família não têm perfil. O paciente é um conjunto
de informações dentro do atendimento (idade, mobilidade, sonda, oxigênio, animais em casa),
preenchido pela empresa. Também **não existe administrador de plataforma** — decisão de produto
registrada na Revisão 5 do `docs/IMPLEMENTATION_PLAN.md`.

## Product Purpose

Acalento Gestão conecta empresas de home care a cuidadores informais e profissionais: a empresa
publica o atendimento, o sistema mostra quem é compatível, o cuidador aceita, executa com
check-in/check-out e o período fecha em relatório de horas.

Este repositório **não é o produto de produção**. É uma demo frontend para reuniões comerciais com
empresas de home care. Sucesso é uma coisa mensurável: em 8–10 minutos de apresentação
(`docs/DEMO_GUIDE.md`), o dono de uma empresa de home care conclui que a plataforma resolve a
operação dele — preencher plantão, controlar quem entra no quadro e fechar horas com prova — sem
que a simulação apareça como simulação em nenhum momento do roteiro.

## Positioning

Quatro afirmações, todas confirmadas como centrais. A primeira é o mecanismo que um concorrente
não copia honestamente sem reconstruir o modelo de dados:

1. **Quadro próprio + categoria automática.** O status de aprovação é *por empresa*: cada empresa
   confere documentos e aprova, recusa ou bloqueia o seu próprio quadro, e o mesmo cuidador pode
   estar aprovado em uma e em análise em outra. Sobre esse quadro, o sistema aplica sozinho a
   regra de formação — atividade que exige técnico/superior nunca chega a um cuidador informal, e
   profissional com registro de conselho ainda não conferido não entra na busca. A empresa não
   precisa lembrar da regra; ela não tem como ser violada.
2. **Velocidade para preencher plantão.** Publicar, ver compatíveis, convidar e confirmar em
   minutos, substituindo o preenchimento manual do plantão.
3. **Fechamento de horas com prova.** As horas do relatório vêm dos check-ins e check-outs
   registrados, não de digitação — é a dor nº 1 citada no documento de produto.
4. **Rastreabilidade das decisões.** Toda aprovação, recusa, bloqueio e cancelamento fica gravada
   com data, hora e responsável, visível em Configurações → Registro de atividade.

## Operating Context

- **A cena da apresentação:** reunião comercial, 8–10 minutos, roteiro fixo em
  `docs/DEMO_GUIDE.md` (exemplo "Sandra / dona Marli", da seção 8 do documento de produto). O
  apresentador troca de perfil ao vivo — Empresa → Cuidador → Empresa — para mostrar os dois lados
  da mesma transação.
- **Reset entre apresentações:** Empresa → Configurações → Restaurar dados da demonstração. Toda
  apresentação começa do mesmo estado conhecido.
- **Execução:** `npm install` + `npm start`. Roda inteiramente no navegador da máquina de quem
  apresenta, sem rede e sem dependência externa em tempo de execução.
- **Dois contextos de uso no mesmo produto:** a coordenação da empresa trabalha em desktop e
  também no celular; o cuidador é essencialmente celular. Nenhum dos dois pode ser sacrificado
  pelo outro.
- **Ciclo real que o produto acompanha:** publicação do atendimento → convite ou candidatura →
  confirmação → agenda → check-in → registro (tarefas, observações, sinais vitais, fotos) →
  check-out → avaliação → fechamento de horas do período. Cancelamento com menos de 12h de
  antecedência entra no histórico das duas partes.

## Capabilities and Constraints

**Restrição estrutural (regra nº 1 do `CLAUDE.md`, inegociável):** projeto somente frontend. Sem
backend, banco, API própria, ORM, serviço cloud, autenticação real, secrets ou integração externa
necessária para funcionar. Toda a operação é simulada no navegador.

- **Estado:** `src/services/storage.ts` é o único módulo que conhece o `localStorage`
  (`acalento:app-state:v2` + sessão simulada). Dataset inicial em `src/mocks/`. As telas falam com
  serviços, nunca com o armazenamento — a troca por uma `ApiService` no futuro não deve reescrever
  telas.
- **Regras de negócio R1–R12** centralizadas em `src/services/` (roster, matching, invitations,
  attendances, records, evaluations, reports). R11 foi removida na Revisão 5 junto com o perfil de
  administrador. Elas são o conteúdo da demonstração, não detalhe de implementação: a apresentação
  existe para mostrá-las em ação.
- **Dois perfis apenas:** Empresa e Cuidador. Contas de demonstração: `empresa@demo.com` e
  `cuidador@demo.com` (senha `123456`), mais contas extras de cuidador e uma segunda empresa para
  mostrar quadros diferentes.
- **Simulado por decisão, e assumido como tal:** upload de documento e selfie, fotos do registro
  (contador, não upload), localização do check-in (texto, não GPS), notificações (centro interno,
  sem push), mensagens (sem WebSocket), cadastro de nova Empresa (mensagem; o fluxo passo a passo
  existe só para Cuidador).
- **Fora do escopo, do MVP e da demo:** pagamentos, prontuário eletrônico completo, app da
  família, teleatendimento, integrações contábeis ou com sistemas de gestão, consulta automática
  ao conselho de classe, contrato assinado digitalmente, sincronização offline, testes
  automatizados.
- **Idioma:** pt-BR apenas. Não há requisito de i18n.
- **Vocabulário do domínio, a ser respeitado literalmente na interface:** atendimento (não "vaga"
  nem "job"), plantão de 12h/24h, período de horas, sessão avulsa, quadro, cuidador
  informal/técnico/superior, conselho de classe (COREN, CREFITO), convite × candidatura, check-in
  e check-out, registro do atendimento, registro de atividade.
- **A demo nunca abre vazia.** O cenário inicial precisa permitir navegar imediatamente por todo o
  fluxo do roteiro, incluindo os casos de borda propositais do seed (Beatriz com poucas avaliações
  para mostrar R10; Paulo Ricci em análise para mostrar R1+R3 juntas; `at7` cancelado com 11h de
  antecedência para mostrar R8).
- **Decisão em aberto:** as métricas de sucesso do MVP (tempo até confirmar cuidador, % de
  atendimentos preenchidos) não viraram tela e ninguém decidiu se devem virar.

## Brand Commitments

- **Nome: "Acalento Gestão"** — é ao mesmo tempo o nome da empresa e o nome deste aplicativo.
  Confirmado pelo usuário nesta rodada. A interface hoje exibe apenas "Acalento" em seis pontos
  (`src/components/layout/AppHeader.tsx`, `src/layouts/CompanyLayout.tsx`,
  `src/layouts/CaregiverLayout.tsx`, `src/pages/LoginPage.tsx`) — desalinhamento a corrigir.
- **Logo vinculante:** `docs/Logo/logo.jpeg` — símbolo de nó/rede com wordmark "ACALENTO /
  GESTÃO", em verde petróleo escuro e verde sálvia sobre off-white. Confirmado como definitivo e
  de uso obrigatório na interface: login, header e favicon. Nenhum trabalho futuro pode
  substituí-lo. O `public/favicon.svg` atual é um SVG roxo genérico herdado do scaffold e
  contradiz a marca.
- **Voz:** português do Brasil, sóbria e operacional. Sem linguagem promocional, sem superlativos,
  sem emoji como elemento de interface.
- **Conflito de identidade não resolvido, registrado aqui para que ninguém o resolva por
  distração:** o sistema visual implementado (`src/index.css` + `docs/DESIGN_SYSTEM.md`) usa
  accent marigold `#E8A33D` com Fraunces/Work Sans/IBM Plex Mono, enquanto o `CLAUDE.md` (§5–6)
  prescreve fundo `#F7F7F5`, accent verde sálvia/petróleo e tipografia da família Inter — e o logo
  confirmado é verde. As três fontes discordam. Isto é um fato registrado, não uma decisão: a
  resolução pertence ao trabalho visual, não a este documento.
- **Privacidade:** todos os dados são fictícios. Nunca inserir CPF, CNPJ, documento, telefone,
  endereço ou informação de saúde reais, mesmo que pareçam mais convincentes na apresentação.

## Evidence on Hand

**Existe no repositório:**

- `docs/IMPLEMENTATION_PLAN.md` (1539 linhas) — análise de produto, perfis, as 17 telas oficiais,
  R1–R12, dependências entre funcionalidades e log de decisões com cinco revisões. É a fonte de
  verdade de produto mais completa disponível.
- `docs/DEMO_GUIDE.md` — roteiro comercial de 12 passos, checklist de como cada regra R1–R12 está
  aplicada no código, e a lista honesta das simplificações assumidas.
- `docs/DESIGN_SYSTEM.md` — decisões de identidade do sistema implementado.
- `docs/PROJECT_AUDIT.md` — documento histórico; audita o protótipo single-file anterior à
  reimplementação em `src/`. Onde cita "quatro perfis" e "área de administração", está vencido.
- `docs/Logo/logo.jpeg` — a marca confirmada.
- `src/mocks/` — dataset seed completo: 2 empresas, 10 cuidadores, vínculos de quadro nos quatro
  status, pacientes, atendimentos, convites, candidaturas, avaliações, notificações, mensagens e
  auditoria.
- `app_acalento_homecare.jsx` e `componentes_base_design_system.jsx` na raiz — protótipo original
  em artifact single-file, mantido como referência histórica. Fora do build; não reflete o modelo
  atual (não tem TypeScript, não tem Tailwind, tem perfil de administrador).

**Não existe, e não deve ser inventado:**

- `MVP_Home_Care.docx`, citado como fonte principal de requisitos pelo `CLAUDE.md` e pelo plano,
  **não está no repositório**. Se reaparecer, vale reconferir o plano contra ele.
- Nenhum cliente real, depoimento, estudo de caso, benchmark, número de mercado, preço, contrato
  ou métrica de uso. A demo não tem prova social e não deve simular nenhuma.

## Product Principles

1. **A empresa é dona do seu quadro.** Aprovar, recusar e bloquear é decisão da empresa, por
   empresa. Nenhum trabalho futuro deve reintroduzir um administrador de plataforma nem um status
   de aprovação global — isso já foi removido uma vez, deliberadamente.
2. **A regra decide antes da pessoa.** O sistema impede sozinho a combinação errada de atividade e
   categoria. Não basta estar correto por baixo: a interface precisa tornar a regra visível no
   momento em que ela age, porque é ela que a apresentação está vendendo.
3. **Número só existe com prova atrás.** Horas vêm de check-in/check-out; média de avaliação só
   aparece a partir da terceira; decisão só vale registrada com data, hora e responsável. Não
   exibir um número que a demo não consiga justificar quando alguém perguntar de onde ele veio.
4. **Parece real, permanece simulado.** Tudo é frontend e localStorage. A ambição de fidelidade
   vale para a experiência, nunca para a infraestrutura.
5. **Celular é o cuidador, desktop é a coordenação.** Os dois contextos são reais e simultâneos;
   melhorar um às custas do outro é regressão, não trade-off.

## Accessibility & Inclusion

- Requisito específico do produto, já assumido em `docs/DESIGN_SYSTEM.md` §4: **status nunca é
  comunicado só por cor.** O progresso do atendimento usa stepper com rótulo de texto e a cor é
  reforço secundário — decisão tomada por causa de daltonismo, e que vale para categoria de
  cuidador, status de atendimento e status de cadastro.
- Contraste, foco visível de teclado, `label` em todo input, botões semanticamente corretos
  (`CLAUDE.md` §39).
- O cuidador usa o produto no celular, entre deslocamentos: área de toque generosa e texto legível
  em tela pequena não são preferências estéticas, são condição de uso.
