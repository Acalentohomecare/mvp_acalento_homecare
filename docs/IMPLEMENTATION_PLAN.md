# IMPLEMENTATION_PLAN.md — MVP Acalento Home Care

> Plano oficial de execução do projeto. Versionado no repositório conforme regra do prompt.
> **Revisão 4 — auditoria de arquitetura.** O `CLAUDE.md` da raiz (regras vigentes do projeto)
> exige um projeto npm real (Vite + React + TypeScript + Tailwind, `npm install`/`npm run dev`,
> estrutura modular `src/`, persistência em `localStorage`). O que existe hoje é um artifact
> React single-file (decisão da Revisão 1/3, tomada por limitação de ambiente, não por escolha de
> produto) — **não é um projeto npm e não roda com `npm install`/`npm run dev`**. Os status das
> etapas abaixo foram corrigidos para refletir isso, e uma nova **Etapa 0 — Bootstrap do Projeto
> Real** foi inserida como pré-requisito. Ver `docs/PROJECT_AUDIT.md` para o detalhamento completo
> da auditoria, e a seção 6 (Log de Decisões) para o registro da Revisão 4. `docs/DEMO_GUIDE.md`
> continua valendo como roteiro de demonstração e checklist de regras de negócio.

---

## 0. Sobre esta revisão

A Revisão 1 deste plano foi construída sem o `MVP_Home_Care.docx` (não enviado no upload
inicial), a partir do `README.md` e de um roteiro de domínio genérico embutido no prompt de
regras. O documento foi enviado depois e **mudou pontos estruturais do plano**. As mudanças estão
detalhadas na seção 6 (Log de Decisões). A partir daqui, este documento reflete o `.docx` real.

---

## 1. Análise do Projeto (FASE 0) — revisada

### 1.1 Perfis de usuário (conforme o documento)

Três perfis, todos dentro do aplicativo (mobile first; o perfil da empresa também é bem resolvido
em desktop). **Não existe perfil de administrador de plataforma:** a conferência de documentos e a
aprovação do cuidador que vai assumir o plantão são responsabilidade da Empresa, e o status de
aprovação é por empresa (cada uma mantém o seu quadro).

| Perfil | Quem é | O que faz |
|---|---|---|
| **Empresa (gestor)** | Dono/coordenador da empresa de home care | Cadastra a empresa, confere documentos e aprova/recusa/bloqueia cuidadores no seu quadro, publica atendimentos, escolhe o cuidador, acompanha a escala, fecha as horas do período. |
| **Cuidador informal** | Pessoa sem formação técnica/superior | Cria perfil, envia documentos, informa disponibilidade e região, recebe convites, aceita plantões, registra o atendimento. |
| **Cuidador com formação** (técnico ou nível superior) | Técnico de enfermagem, enfermeiro, fisioterapeuta, fonoaudiólogo, nutricionista, terapeuta ocupacional | Mesmo fluxo do cuidador informal + cadastro do registro no conselho de classe e especialidades. |

**Correção importante em relação à Revisão 1:** não existe perfil "Paciente/Família" nesta primeira
versão — o paciente é apenas um conjunto de informações dentro do atendimento (idade, mobilidade,
sonda, oxigênio, animais em casa), preenchido pela Empresa.

### 1.2 A separação por categoria de cuidador (regra central do produto)

| Categoria | Exemplos | Atividades típicas |
|---|---|---|
| Informal | Cuidador de idosos, acompanhante | Higiene/banho, alimentação, apoio para andar/mudar de posição, lembrete de medicação já separada, companhia, acompanhamento em consultas. |
| Técnico | Técnico de enfermagem | Sinais vitais, medicação prescrita, curativos simples, cuidados de rotina sob supervisão. |
| Superior | Enfermeiro, fisioterapeuta, fonoaudiólogo, nutricionista, terapeuta ocupacional | Avaliação, plano de cuidado, procedimentos/sessões da área, supervisão. |

**Regra automática:** ao publicar um atendimento, a empresa marca as atividades necessárias. Se
alguma exigir formação, cuidadores informais **não aparecem** na lista e não conseguem se
candidatar — o sistema aplica isso sozinho, sem a empresa precisar lembrar.

### 1.3 Fluxo principal (baseado no "Exemplo de uso do começo ao fim" do documento)

1. Empresa publica atendimento ("Novo atendimento") — tipo (plantão 12h/24h, período, sessão
   avulsa), endereço, data/horário, repetição, atividades exigidas, infos do paciente, valor.
   Preenchimento em menos de 2 minutos; pode salvar como rascunho ou reaproveitar atendimento
   anterior.
2. Sistema filtra e ordena cuidadores compatíveis (categoria, proximidade, avaliação, histórico
   com a empresa) — busca e sugestão, com filtros adicionais (bairro, turno, faixa de valor).
3. Empresa visualiza perfis e envia convite (direto para um/vários) **ou** deixa como publicação
   aberta (qualquer cuidador compatível pode se candidatar).
4. Cuidador recebe aviso, vê o resumo, e aceita / recusa / pergunta antes de decidir.
5. Empresa vê quem aceitou e confirma um; os demais são avisados automaticamente; endereço
   completo é liberado só para quem foi confirmado.
6. Atendimento confirmado entra na agenda de ambas as partes; lembretes automáticos (véspera e 1h
   antes).
7. Cuidador faz check-in (horário + localização); alerta automático para a empresa se não
   houver check-in até 15 min após o horário combinado.
8. Durante o atendimento, cuidador marca tarefas executadas e registra observações (+ sinais
   vitais quando aplicável, + até 3 fotos com consentimento).
9. Cuidador faz check-out — o registro fecha e não pode mais ser editado (correções viram nova
   observação).
10. Empresa avalia o cuidador (1–5 + comentário); cuidador avalia a empresa. Média só aparece no
    perfil a partir da 3ª avaliação.
11. Ao final do período, empresa abre o relatório de horas (calculado a partir dos check-ins/
    check-outs), por cuidador e por período, e exporta para planilha.
12. Cancelamentos (por qualquer lado) ficam registrados com quem, quando e por quê; menos de 12h
    de antecedência fica marcado no histórico das duas partes.

Comunicação e avisos (mensagens ligadas a um atendimento específico + notificações de convite,
confirmação, cancelamento, lembrete, falta de check-in) e a fila de aprovação de cadastros pela
própria Empresa correm em paralelo a esse fluxo central.

### 1.4 Telas (lista oficial do documento, seção 7 — 17 telas do app)

| Nº | Tela | Para que serve |
|---|---|---|
| 01 | Entrada e cadastro | Criar conta ou entrar; escolher empresa ou cuidador. |
| 02 | Cadastro passo a passo | Dados + documentos, em etapas curtas. |
| 03 | Aguardando aprovação | Situação do cadastro (em análise/aprovado/recusado + motivo). |
| 04 | Início da empresa | Atendimentos de hoje, em aberto, pendências. |
| 05 | Novo atendimento | Publicar necessidade em poucos toques. |
| 06 | Lista de cuidadores | Compatíveis, convidar. |
| 07 | Perfil do cuidador | Experiência, avaliações, disponibilidade. |
| 08 | Candidaturas recebidas | Comparar interessados, confirmar um. |
| 09 | Escala da empresa | Semana inteira + status de cada atendimento. |
| 10 | Início do cuidador | Próximo atendimento, convites recebidos. |
| 11 | Detalhe do atendimento | Endereço, horário, tarefas, infos do paciente. |
| 12 | Check-in e check-out | Confirmar chegada e saída. |
| 13 | Registro do atendimento | Marcar tarefas, observações, fotos. |
| 14 | Conversa | Mensagens ligadas ao atendimento. |
| 15 | Avaliação | Nota e comentário ao final. |
| 16 | Relatório de horas | Fechar período e exportar. |
| 17 | Perfil e configurações | Editar dados, disponibilidade, avisos. |
| — | Quadro de cuidadores (dentro da tela 06, no perfil da Empresa) | Fila de cadastros em análise, aprovar/recusar/bloquear, inativos. |

### 1.5 Regras de negócio (R1–R12, direto do documento — substituem as regras genéricas da Rev. 1)

| Nº | Regra |
|---|---|
| R1 | Cuidador não aprovado **pela empresa** não recebe convite dela e não aparece na busca dela. O status de aprovação é por empresa — cada uma mantém o seu quadro; quem não foi aprovado por ninguém nem entra nas telas internas. |
| R2 | Atendimento que exige formação nunca é oferecido a cuidador informal. |
| R3 | Profissional técnico/superior só é considerado apto após conferência do registro no conselho de classe — conferência feita pela empresa, junto com a aprovação do cadastro. |
| R4 | Um cuidador não pode aceitar dois atendimentos com horários que se sobrepõem. |
| R5 | O endereço completo do paciente só é liberado após a confirmação do cuidador escolhido. |
| R6 | O check-out só é permitido depois do check-in do mesmo atendimento. |
| R7 | Após o check-out, o registro do atendimento não pode ser editado. |
| R8 | Cancelamento com menos de 12h de antecedência fica marcado no histórico das duas partes. |
| R9 | A avaliação só pode ser feita depois do atendimento concluído. |
| R10 | A média de avaliação só aparece no perfil a partir da 3ª avaliação recebida. |
| R11 | ~~Empresa com cadastro suspenso não publica novos atendimentos.~~ **Removida (Revisão 5):** dependia de um administrador de plataforma, papel que não existe no modelo do documento. |
| R12 | Todo cancelamento, bloqueio e alteração de cadastro fica registrado com data, hora e responsável (visível em Empresa → Configurações → Registro de atividade). |

### 1.6 Dados mockados necessários (atualizado)

Empresa (CNPJ, nome, cidade, contato, status de aprovação), Cuidadores (nome, CPF, nascimento,
cidade/bairros, categoria informal/técnico/superior, registro no conselho quando aplicável,
documentos simulados, disponibilidade por dia/turno, valor pretendido, selo verificado, favoritos
da empresa), Atendimentos (tipo, endereço, data/horário, repetição, atividades exigidas, infos do
paciente, valor, status no ciclo de vida), Convites, Candidaturas, Agendamentos/Escala, Check-
ins/Check-outs, Registros de atendimento (tarefas, observações, fotos simuladas), Avaliações,
Conversas/Mensagens, Notificações, Vínculos de quadro (empresa ↔ cuidador, com status de aprovação
e motivo da recusa).

### 1.7 Componentes reutilizáveis

Shell mobile-first por perfil (bottom nav / topbar), Card de Cuidador/Atendimento, Badge de status
e de categoria (informal/técnico/superior), Selo de verificado, Lista com busca e filtros, Stepper
de cadastro em etapas, Modal/Drawer, Calendário/Agenda, Chat vinculado a atendimento, Rating
(estrelas), Stepper de progresso do atendimento, Central de notificações.

### 1.8 Dependências entre funcionalidades

```
Dados mockados
  → Cadastro/Autenticação simulada (Empresa e Cuidador) → Aprovação no quadro (Empresa)
       → Perfil do Cuidador (categoria, documentos, disponibilidade)
            → Publicação de Atendimento (Empresa)
                 → Busca e Sugestão de Cuidadores (filtro por categoria/R2/R3)
                      → Convite / Publicação aberta → Candidatura → Confirmação (R4, R5)
                           → Agenda / Escala
                                → Check-in / Check-out (R6)
                                     → Registro do Atendimento (R7)
                                          → Avaliação (R9, R10)
  → Mensagens (paralelo, depende só de perfis existirem)
  → Notificações (depende dos eventos gerados pelos fluxos acima)
  → Relatório de horas / Fechamento (depende de check-in/out ao longo do período)
  → Configurações da Empresa / Persistência / Reset (transversal)
```

### 1.9 Elementos do Design System

Mobile first: textos grandes, poucos campos por tela, botões fáceis de tocar. Paleta própria
(tons de cuidado/confiança, evitando roxo/gradiente genérico de IA), tipografia legível em telas
pequenas, componentes com boa área de toque, badges de categoria de cuidador bem diferenciados
visualmente (informal/técnico/superior), grid responsivo. Como o entregável é um artifact web (ver
seção 2), a experiência mobile first será emulada com um layout otimizado para largura estreita
(estilo "moldura de celular" nas telas do app), com o perfil da Empresa também bem resolvido em
desktop — é onde a coordenação trabalha.

### 1.10 Funcionalidades essenciais para a apresentação comercial

- Fluxo completo do "Exemplo de uso" do documento (seção 1.3 acima) funcionando sem travar.
- Regra automática de categoria (R2) visivelmente em ação — é o principal diferencial do produto.
- Alternância entre perfis (Empresa ⇄ Cuidador informal ⇄ Cuidador com formação) para mostrar os
  dois lados e a diferenciação por categoria.
- Relatório de horas com exportação simulada (é a dor nº 1 citada no problema, seção 2 do doc).
- Reset da demo com um clique.

### 1.11 O que NÃO será implementado nesta demo

Direto da seção 6 do documento (fora do escopo do próprio MVP):
- Pagamento dentro do aplicativo.
- Prontuário eletrônico completo.
- Aplicativo para a família acompanhar.
- Ligação por vídeo / teleatendimento.
- Integração com sistemas de gestão e contabilidade.
- Consulta automática ao conselho de classe (a conferência é manual, feita pela empresa).
- Versão completa para computador (o perfil da Empresa já é utilizável em desktop).
- Contrato assinado digitalmente.

Adicionais, por ser uma demo (não um produto real):
- Autenticação e backend reais; verificação de documento/selfie real (simulada visualmente).
- Notificações push/SMS reais.
- Funcionamento realmente offline com sincronização (o documento pede isso para o app real; na
  demo, apenas mencionamos o comportamento no `DEMO_GUIDE.md`, sem implementar sync offline de
  verdade).
- Testes automatizados (validação manual guiada por roteiro).
- Persistência em banco de dados real — ver decisão de arquitetura, seção 2.

---

## 2. Decisões de Arquitetura

> **Nota (Revisão 4): as seções 2.1–2.3 abaixo estão superadas.** Foram escritas quando o
> `CLAUDE.md` atual ainda não existia no repositório e o ambiente de desenvolvimento não tinha
> acesso de rede para `npm install`. Hoje o `CLAUDE.md` exige explicitamente um projeto npm real
> (React + TypeScript + Vite + Tailwind, `localStorage`, estrutura `src/` modular — seções 2, 4,
> 12 e 15 do `CLAUDE.md`), o que substitui a decisão de "artifact single-file" abaixo. As seções
> ficam mantidas como registro histórico de por que a decisão foi tomada naquele momento (regra do
> projeto: preservar o histórico de decisões), mas **não descrevem mais a arquitetura-alvo**. A
> arquitetura-alvo passa a ser a estrutura da Etapa 0 (seção 3) e da seção 12 do `CLAUDE.md`. Ver
> `docs/PROJECT_AUDIT.md` para o detalhamento completo.

### 2.1 Stack (histórico — ver nota acima)

- Entregável final: **artifact React (JSX) single-file**, renderizado nativamente pelo Claude.ai.
- Estado: `useState`/`useReducer` + Context API; navegação por estado interno (sem URL routing).
- Bibliotecas do ambiente de artifact: React, `lucide-react`, `recharts` (relatório de horas /
  números de uso), `lodash` se necessário.
- Persistência: API `window.storage` (dados pessoais, não compartilhados), com reset restaurando
  o seed original.
- Estilo: Tailwind (classes core) seguindo o skill `frontend-design`, com um "frame" de celular
  para as telas do app (mobile first) e um layout desktop convencional para o perfil da Empresa.

### 2.2 Por que não usar o pipeline `web-artifacts-builder` (Vite + Parcel + shadcn)

Confirmado nesta sessão: `bash_tool` sem acesso de rede (`host_not_allowed` ao testar o registry
do npm). O pipeline do skill depende de `npm install`. Decisão mantida da Revisão 1: artifact
single-file, sem bundling local.

### 2.3 Modelo de dados (alto nível, atualizado)

`Empresa`, `Cuidador` (com `categoria`: informal | tecnico | superior, e campos condicionais de
registro profissional), `Atendimento` (com `atividadesExigidas`, infos do paciente embutidas,
status do ciclo de vida), `Convite`, `Candidatura`, `Agendamento`, `RegistroAtendimento`,
`Avaliacao`, `Conversa`/`Mensagem`, `Notificacao`, `VinculoQuadro` (Empresa → Cuidador, com status
de aprovação), `Favorito` (Empresa → Cuidador).

---

## 3. Etapas

## Etapa 0 — Bootstrap do Projeto Real (pré-requisito, adicionada na Revisão 4)

### Objetivo
Sair do artifact single-file e criar o projeto npm real exigido pelo `CLAUDE.md` (seção 2 e seção
47, item 1), para que todas as etapas seguintes possam ser executadas e testadas de verdade.

### Escopo
- `npm create vite@latest` com template React + TypeScript.
- Configurar Tailwind CSS (`tailwind.config.ts`, `postcss.config.js`, diretivas em `src/index.css`)
  e portar os tokens de `docs/DESIGN_SYSTEM.md` (paleta, tipografia) para `theme.extend`.
- Criar a estrutura de pastas da seção 12 do `CLAUDE.md`: `src/app`, `src/components/{ui,layout,shared}`,
  `src/pages`, `src/layouts`, `src/features/*`, `src/mocks`, `src/services`, `src/hooks`,
  `src/types`, `src/utils`, `src/constants`, `src/assets`.
- Confirmar `npm install && npm run dev` funcionando localmente com uma tela mínima (placeholder).
- Adicionar `.gitignore` (`node_modules`, `dist`, etc. — hoje ausente do repositório).

### Fora do escopo
Migrar telas/lógica de negócio (etapas seguintes). Esta etapa só cria o esqueleto executável.

### Dependências
Nenhuma — é pré-requisito de todas as demais.

### Arquivos esperados
`package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`,
`.gitignore`, `src/main.tsx`, `src/App.tsx`, estrutura de pastas vazia conforme acima.

### Entregáveis
Projeto que abre no navegador via `npm run dev` mostrando uma tela mínima com os tokens de cor/
tipografia do design system já aplicados via Tailwind.

### Critérios de aceite
`npm install` conclui sem erro; `npm run dev` sobe um servidor local; a tela mínima renderiza sem
erros de console; a estrutura de pastas da seção 12 do `CLAUDE.md` existe.

### Validação
Rodar `npm install && npm run dev` do zero (clone limpo) e confirmar no navegador.

### Status
```text
[x] Concluída
```
> Nota de execução: `npm install` concluído sem erro (React 19, Vite 8, TypeScript ~6, Tailwind 4,
> `@tailwindcss/vite`, `lucide-react`). `npx tsc -b` sem erros. `npm run dev` sobe em
> `http://localhost:5173/` (log: "VITE v8.2.2 ready"). Tela mínima renderizada e verificada via
> screenshot real (Chrome headless/Playwright CLI) — título "Acalento" em Fraunces, badges de
> categoria (informal/técnico/superior) e de status nas cores exatas do `DESIGN_SYSTEM.md`, texto
> em Work Sans, horário em IBM Plex Mono. Console do navegador sem erros. Estrutura `src/`
> completa (seção 12 do `CLAUDE.md`) criada. `.gitignore` adicionado (ignora `node_modules`).

---

## Etapa 1 — Análise e Plano

### Objetivo
Analisar o projeto (agora com o `.docx` real) e manter o plano oficial atualizado.

### Escopo
Leitura do `MVP_Home_Care.docx`, revisão de perfis/fluxos/telas/regras/dados/componentes,
atualização da arquitetura, revisão deste documento.

### Fora do escopo
Código de aplicação.

### Dependências
Nenhuma.

### Arquivos esperados
`docs/IMPLEMENTATION_PLAN.md`

### Entregáveis
Este documento (Revisão 2), coerente com o documento de produto real.

### Critérios de aceite
Todas as seções da FASE 0 refletem o `.docx`; divergências da Revisão 1 registradas no log.

### Validação
Revisão humana antes de liberar a Etapa 2.

### Status
```text
[x] Concluída (Revisão 2)
```
> Nota de auditoria (Revisão 4): conteúdo de análise válido e reaproveitável. `MVP_Home_Care.docx`
> não foi localizado no repositório — ver `docs/PROJECT_AUDIT.md` seção 2. Se o `.docx` reaparecer,
> vale reconferir este documento diretamente contra ele.

---

## Etapa 2 — Design System

### Objetivo
Identidade visual mobile first: cores, tipografia, componentes base, badges de categoria.

### Escopo
Paleta (light mode), escala tipográfica legível em tela pequena, botão/input/card/badge/modal,
badges diferenciados por categoria de cuidador e por status de atendimento, "frame" de celular
para as telas do app, layout desktop para o perfil da Empresa.

### Fora do escopo
Dark mode, temas customizáveis.

### Dependências
Etapa 1.

### Arquivos esperados
`docs/DESIGN_SYSTEM.md`; tokens/estilos-base no artifact principal.

### Entregáveis
Documento de design system + componentes-base renderizados.

### Critérios de aceite
Paleta/tipografia aplicadas consistentemente; badges de categoria visualmente distintos; nada de
gradiente roxo genérico.

### Validação
Visualização do artifact com componentes-base.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): componentes-base reimplementados em `src/components/ui/`
> (`Button`, `Input`, `Card`, `Cracha`, `Stepper`, `Modal`), em TypeScript + Tailwind, usando os
> tokens definidos em `src/index.css` (`@theme`). Showcase em `src/App.tsx`. `npx tsc -b` sem
> erros; testado no navegador (Chrome/Playwright) com screenshot dos 6 componentes e do modal
> aberto — cores de categoria/status batendo com `docs/DESIGN_SYSTEM.md`, zero erros de console.
> `componentes_base_design_system.jsx` (artifact antigo) mantido no repositório como referência
> histórica, sem uso pelo projeto real.

---

## Etapa 3 — Dados Mockados

### Objetivo
Dataset completo cobrindo os três perfis e todas as categorias de cuidador.

### Escopo
Seed data conforme seção 1.6: 1 Empresa aprovada, cuidadores nas 3 categorias (incluindo alguns
"em análise" e "recusado" para mostrar a Etapa 5), atendimentos em vários estados do ciclo de
vida (inclusive um exigindo formação e outro não, para mostrar R2 em ação), convites,
candidaturas, agendamentos, check-ins/outs, registros, avaliações (algumas com menos de 3
avaliações para mostrar R10), mensagens, notificações, fila de aprovação.

### Fora do escopo
Geração dinâmica via IA em tempo real.

### Dependências
Etapa 1.

### Arquivos esperados
Módulo `mockData` dentro do artifact.

### Entregáveis
Dataset referencialmente consistente cobrindo cada regra de negócio pelo menos uma vez.

### Critérios de aceite
Existe pelo menos um exemplo de cada situação citada acima (R2, R4, R5, R10 etc. representáveis).

### Validação
Inspeção manual; checklist de "toda regra tem pelo menos um caso nos dados".

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): reimplementada na arquitetura real. Tipos de domínio em
> `src/types/` (User, Company, Caregiver, Patient, Attendance, Invitation, Application, Evaluation,
> Notification, Message, Document, além de Activity/AuditLogEntry/DashboardAlert e os enums da
> seção 17 do `CLAUDE.md`) — pré-requisito que o `CLAUDE.md` pede antes dos mocks. Dataset em
> `src/mocks/` (um arquivo por domínio, seção 13 do `CLAUDE.md`), com **Paciente agora uma
> entidade própria** (decisão do usuário: CLAUDE.md §21 prevalece sobre a leitura anterior do
> `.docx`, que o tratava como campo embutido no Atendimento — Attendance passou a referenciar
> `patientId`). Dataset atende aos mínimos do `CLAUDE.md` §13: 1 admin, 2 empresas, 10 cuidadores
> (3 categorias, com pendente/recusado/bloqueado representados), 8 pacientes, 15 atendimentos
> (todos os 9 status do ciclo de vida representados pelo menos uma vez), 12 avaliações (cg1/cg4/cg5
> com 3+ — média visível, R10; cg2 com 1 só — média ainda oculta), 12 notificações (6 tipos
> oficiais do `CLAUDE.md` §32 cobertos), 8 mensagens, convites, candidaturas, documentos simulados
> e log de auditoria (R12). Validado com `npx tsc -b` (sem erros) e um script de integridade
> referencial (checagem de todos os ids cruzados entre coleções + compatibilidade categoria
> mínima × categoria do cuidador confirmado) — passou 100%, depois removido por ser só uma
> ferramenta de verificação, não parte do app. `app_acalento_homecare.jsx` mantido como referência
> do formato/volume de dados original.

---

## Etapa 4 — Arquitetura Frontend, Navegação, Cadastro e Autenticação Simulados

### Objetivo
Shell do app: estado de sessão, navegação por estado, telas 01–03 (Entrada/Cadastro, Cadastro
passo a passo, Aguardando aprovação).

### Escopo
Login simulado (escolher perfil + categoria se cuidador), cadastro passo a passo com campos do
documento (Empresa: CNPJ/nome/cidade/telefone/e-mail + envio simulado do cartão CNPJ; Cuidador:
nome/CPF/nascimento/cidade/bairros + categoria + documento+selfie simulados + registro no
conselho quando aplicável), tela de status do cadastro (em análise/aprovado/recusado + motivo).

### Fora do escopo
Telas de conteúdo pós-login (demais etapas).

### Dependências
Etapas 2 e 3.

### Arquivos esperados
Núcleo do artifact (`App`, `AppShell`, contexto de sessão, telas 01–03).

### Entregáveis
Fluxo de entrada completo, incluindo o estado "aguardando aprovação" (R1).

### Critérios de aceite
Cuidador/Empresa não aprovado não acessa as telas internas (reflete R1); layout mobile first
(frame de celular).

### Validação
Testar os três status de cadastro (em análise, aprovado, recusado) e confirmar bloqueio de
acesso quando não aprovado.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): reimplementada com **React Router** (decisão tomada com o
> usuário — URLs reais em vez de navegação por estado interno do artifact antigo, já que agora é
> um app de verdade). Camada de persistência `src/services/storage.ts` (localStorage, assíncrona
> de propósito para trocar por API depois — CLAUDE.md §14/§15), `src/services/auth.ts`
> (login + cadastro simulado de cuidador), `AppStateProvider`/`SessionProvider` (Context API,
> sessão persistida separadamente do estado de negócio) e `ProtectedRoute` aplicando R1 (cuidador
> não aprovado é redirecionado para a tela de aguardando aprovação). Telas: `/login` (form real de
> e-mail/senha + atalhos das 3 contas oficiais do CLAUDE.md §10), `/cadastro` (wizard de 3 passos,
> cuidador com fluxo completo incl. e-mail/senha reais para login futuro; empresa segue simulada
> com aviso, como já decidido), `/cuidador/aguardando-aprovacao`. Dashboards de empresa/cuidador/
> admin são placeholders mínimos nesta etapa (conteúdo real é escopo das próximas etapas — R41: não
> criar telas incompletas só para preencher menu). Testado de ponta a ponta no navegador
> (Chrome/Playwright): as 3 contas de demo logam certo, login inválido mostra erro, rota protegida
> sem sessão redireciona pro login, cadastro de cuidador cria conta e cai em "aguardando aprovação",
> **sessão sobrevive a um reload da página** (prova real de que `localStorage` funciona, diferente
> do artifact antigo). Zero erros de console em todo o fluxo.

---

## Etapa 5 — Aprovação de Cadastros (quadro da Empresa)

> **Reescrita na Revisão 5.** O que está descrito abaixo como "área de administração" foi
> substituído: não existe perfil de administrador de plataforma. A fila de aprovação vive dentro
> de **Empresa → Cuidadores**, em três abas (Meu quadro / Em análise / Inativos), e o status de
> aprovação passou a ser por empresa (`CaregiverLink` em `src/types/roster.ts`,
> `src/services/roster.ts`). O texto histórico fica preservado para rastreabilidade.

### Objetivo
Fila de aprovação de documentos, aprovar/recusar com motivo, bloqueio de cuidador — pela empresa
que vai colocá-lo em plantão.

### Escopo
Tela de administração (desktop) com fila de cadastros pendentes, ação aprovar/recusar (com
campo de motivo), ação de bloquear com registro (R12), efeito imediato no acesso do cuidador/
empresa (R1, R11).

### Fora do escopo
Números de uso da plataforma (Etapa 18).

### Dependências
Etapa 4.

### Arquivos esperados
Componente de Administração (parte 1) dentro do artifact.

### Entregáveis
Aprovar/recusar um cadastro de teste muda visivelmente o status na Etapa 4 (tela "Aguardando
aprovação" do cuidador/empresa).

### Critérios de aceite
R1, R11 e R12 respeitadas; recusa exige motivo.

### Validação
Aprovar um cadastro pendente e confirmar liberação de acesso; recusar outro e confirmar bloqueio
com motivo visível ao usuário.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): reimplementada na arquitetura real. `src/services/admin.ts`
> centraliza as regras (`approveCaregiver`/`rejectCaregiver`/`blockCaregiver`/`reactivateCaregiver`
> e os equivalentes de empresa), seguindo o mesmo padrão de `auth.ts` — função pura
> `(state, ...) => nextState`, sem mutação — e sempre grava um `AuditLogEntry` (R12) e, para
> cuidador, uma `Notification` do tipo `approval`. `src/pages/admin/ApprovalsPage.tsx` (rota
> `/admin`, já existente desde a Etapa 4) ganhou o layout desktop com sidebar previsto no
> `DESIGN_SYSTEM.md` §3, com 4 seções: Fila de aprovação (cuidadores/empresas com
> `approvalStatus: "pending"`, aprovar direto ou recusar com motivo obrigatório num modal),
> Cuidadores (lista completa — bloquear/reativar/reconsiderar conforme o status atual),
> Empresas (lista completa — suspender/reativar, R11) e Atividade (o log de auditoria,
> mais recente primeiro, timestamp em `font-mono`). Recusa e bloqueio usam o mesmo `Modal` do
> design system com um motivo obrigatório (cai para um texto padrão se deixado em branco).
> Token de cor novo `--color-status-bloqueado` (`#4A2A24`) criado e documentado no
> `DESIGN_SYSTEM.md` para diferenciar visualmente "bloqueado" (ação administrativa sobre um
> cadastro já aprovado) de "recusado" (decisão pontual no cadastro) — `Cracha` reaproveitada, sem
> componente novo. `PendingApprovalPage.tsx` (Etapa 4) ajustada para diferenciar as duas
> mensagens ("Cadastro recusado" vs. "Acesso bloqueado"), já que antes tratava as duas como uma
> só. `ProtectedRoute` não ganhou um portão equivalente para Empresa: R11 diz explicitamente que a
> empresa suspensa **mantém acesso ao histórico**, então não é um redirecionamento forçado como o
> do cuidador — o efeito de "não publica novos atendimentos" fica para a Etapa 8, quando a tela de
> publicação existir de verdade. `npx tsc -b` sem erros. Testado de ponta a ponta no navegador via
> um driver Playwright headless (script descartável, não commitado): login como
> `admin@demo.com`, fila mostrando os dois cuidadores pendentes do dataset (Renata Alves,
> Paulo Ricci), recusa com motivo → cuidador sai da fila e aparece em Cuidadores com crachá
> "Recusado"; aprovação do outro → crachá "Aprovado"; bloqueio/reativação de um cuidador aprovado
> e de uma empresa aprovada; log de atividade refletindo as 6 ações, mais recente primeiro. Fluxo
> completo de efeito imediato no acesso (R1) validado registrando dois cuidadores novos via
> `/cadastro`: o aprovado consegue entrar em `/cuidador` no login seguinte, o recusado é
> redirecionado para `/cuidador/aguardando-aprovacao` mostrando exatamente o motivo digitado pelo
> administrador. Zero erros de console em todo o fluxo.

---

## Etapa 6 — Perfil e Cadastro do Cuidador (telas 06/07/17)

### Objetivo
Perfil completo do cuidador, incluindo diferenciação por categoria.

### Escopo
Foto, apresentação, tempo de experiência, lista de atividades (a partir de lista pronta do
sistema), disponibilidade por dia/turno, região (cidade/bairros), valor pretendido, selo de
verificado, campos extras de técnico/superior (registro no conselho, especialidades). Tela de
"Perfil e configurações" (17) para o próprio cuidador editar seus dados.

### Fora do escopo
Vínculo com atendimentos específicos (próximas etapas).

### Dependências
Etapas 4 e 5.

### Arquivos esperados
Componentes de Cuidador (perfil, edição) dentro do artifact.

### Entregáveis
Lista de cuidadores (tela 06) e perfil detalhado (tela 07) navegáveis a partir dos dados
mockados; edição do próprio perfil (tela 17) funcional.

### Critérios de aceite
Selo de verificado só aparece para cuidadores aprovados; campos de conselho de classe só
aparecem para técnico/superior.

### Validação
Abrir cuidadores das três categorias e confirmar diferenças de campos exibidos.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): reimplementada na arquitetura real, em três telas.
> **Tela 06** (`src/pages/company/CaregiversPage.tsx`, rota `/empresa/cuidadores`): lista com busca
> por nome/bairro/especialidade e filtro por categoria, estado vazio tratado. **Tela 07**
> (`src/pages/company/CaregiverProfilePage.tsx`, rota `/empresa/cuidadores/:caregiverId`): perfil
> completo — apresentação, experiência, valor, média, registro no conselho + status,
> especialidades, região, disponibilidade e atividades. *(A seção "Avaliações recebidas", com a
> lista de comentários, existiu aqui e foi removida depois — ver CLAUDE.md §30: a avaliação alimenta
> a média, e a média é o que a ficha mostra.)*
> **Tela 17** (`src/pages/caregiver/ProfilePage.tsx`, rota `/cuidador/perfil`): o cuidador edita a
> própria apresentação, experiência, cidade/bairros, valor, disponibilidade (dias/turnos) e
> atividades; técnico/superior ganham também registro no conselho e especialidades.
>
> Regras centralizadas em `src/services/caregivers.ts` (CLAUDE.md §18 — nada de regra solta no
> JSX): `searchableCaregivers` (R1), `isVerified` (selo depende do cadastro aprovado, não só da
> flag), `caregiverRating` (R10 — média só a partir da 3ª avaliação **da empresa**),
> `allowedActivities` (a lista de atividades do cuidador é limitada pela categoria dele — base da
> R2), e `updateCaregiverProfile`, que aplica R3 (alterar o registro no conselho devolve
> `councilRegistrationStatus` para `pending`) e R12 (toda alteração de cadastro vira
> `AuditLogEntry`, visível na aba Atividade da Etapa 5).
>
> Decisões desta etapa (respondidas pelo usuário antes de implementar): (1) campo `specialties?:
> string[]` **adicionado** a `Caregiver` e aos mocks de técnico/superior, já que a Etapa 9 cita
> "especialidade" como filtro; (2) filtros da tela 06 ficam em **busca + categoria** — o conjunto
> completo do CLAUDE.md §22 (turno, valor, avaliação, disponibilidade) é escopo da Etapa 9, que é
> onde a busca passa a ser aplicada a um atendimento; (3) navegação por **links mínimos** nos
> dashboards placeholder ("Cuidadores" na empresa, "Meu perfil" no cuidador), sem montar menu
> apontando para telas inexistentes (CLAUDE.md §41).
>
> Novos componentes reutilizáveis: `Avatar` (iniciais, foto simulada) em `components/ui/` e
> `CaregiverCard` em `components/shared/` — este último já preparado para a lista de compatíveis da
> Etapa 9. Rótulos de categoria/status/dia/turno centralizados em `src/constants/caregiver.ts`,
> eliminando a duplicação que existia entre `RegisterPage` e `ApprovalsPage` (ambas refatoradas
> para importar de lá); `CATEGORY_RANK` passou a ser exportado de `constants/activities.ts` em vez
> de duplicado. Formatação de moeda/nota em `src/utils/format.ts`.
>
> **Fronteira com a Etapa 9:** a lista da tela 06 aplica R1 (só aprovados), mas **não** aplica R3
> como filtro — um técnico com registro em conferência continua listado, com o crachá "Em análise"
> visível no perfil. Filtrar por isso é critério de aceite da Etapa 9, não desta.
>
> `npx tsc -b` sem erros; `npm run lint` sem novos avisos em `src/`. Validado no navegador
> (Playwright headless, viewport mobile 430px, script descartável não commitado) com **29
> verificações, todas passando e zero erros de console**: R1 lista só os 6 aprovados (Renata/Paulo
> pendentes, Camila recusada, Ricardo bloqueado ficam de fora) e bloqueia o acesso por URL direta;
> R10 mostra "4,7 (3)" para quem tem 3 avaliações e "Sem média pública" / "1 de 3" para a Beatriz;
> os perfis das três categorias diferem nos campos certos (informal sem conselho/especialidades);
> R2 limita as atividades editáveis (informal vê 5, técnico vê 8); R3 devolve o registro para "Em
> análise" ao ser alterado; a edição persiste após reload (`localStorage`) e aparece para a
> empresa; R12 registra as alterações na auditoria do admin.

---

## Etapa 7 — Painel da Empresa / Início (tela 04)

### Objetivo
Tela inicial da Empresa: atendimentos de hoje, em aberto, pendências.

### Escopo
Dashboard simples com as três listas/seções citadas; ponto de entrada para "Novo atendimento".

### Fora do escopo
Criação de atendimento em si (Etapa 8).

### Dependências
Etapas 4, 5 e 6.

### Arquivos esperados
Componente de Início da Empresa dentro do artifact.

### Entregáveis
Tela 04 funcional sobre os dados mockados.

### Critérios de aceite
Contadores/listas batem com os dados mockados de atendimentos.

### Validação
Conferir números exibidos contra o dataset da Etapa 3.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `src/pages/company/DashboardPage.tsx` reescrita como a tela 04
> real. **Decisão tomada com o usuário:** onde o plano pedia 3 seções e o `CLAUDE.md` §20 pede 9
> itens, seguimos o `CLAUDE.md` (que sobrepõe o plano), mas com hierarquia em vez de sopa de cards
> — uma faixa compacta de números com divisores de 1px (hoje, em aberto, pacientes, cuidadores
> ativos, horas realizadas) e então as seções: Pendências, Atendimentos de hoje, Em aberto,
> Próximos e Atividade recente. Ação principal única e evidente: "Novo atendimento".
>
> Tudo é **derivado** em `src/services/attendances.ts`, sem contador mockado que possa
> dessincronizar: `todayAttendances`, `awaitingCaregiverAttendances`, `upcomingAttendances`,
> `draftAttendances`, `applicationsToReview`, `pendingCheckins` (tolerância de 15 min, a mesma da
> Etapa 12), `completedHours` (horas reais de check-in/check-out, não a duração prevista),
> `activeCaregiverIds` e `recentActivity`. `companyAttendances`/`companyPatients` garantem o
> isolamento de dados — a empresa só enxerga o que é dela. `recentActivity` é derivada dos próprios
> atendimentos **de propósito**: usar o `auditLog` vazaria ações de outras empresas e cuidadores.
>
> Também nesta etapa: **navegação da empresa** (decisão do usuário) em
> `src/layouts/CompanyLayout.tsx` — sidebar no desktop, barra inferior no mobile, contendo só os
> destinos que existem de verdade (Início, Atendimentos, Cuidadores); os demais itens do
> `CLAUDE.md` §11 entram junto com suas telas. As telas de cuidadores da Etapa 6 foram ajustadas
> para não repetir o `AppHeader`, que agora é do layout. Criada
> `src/pages/company/AttendancesPage.tsx` (lista com filtros por situação), destino da aba
> Atendimentos e origem do "reaproveitar" da Etapa 8.
>
> **Lacuna da Etapa 3 fechada aqui:** `DASHBOARD_ALERTS` existia como mock mas nunca tinha sido
> ligado ao `AppState` — agora é `state.dashboardAlerts`. Para que estados já salvos no
> `localStorage` não quebrem ao ganhar uma coleção nova, `loadAppState` passou a mesclar o que foi
> lido sobre o seed.
>
> Validado no navegador junto com a Etapa 8 — ver a nota da Etapa 8.

---

## Etapa 8 — Publicação de Atendimento (tela 05)

### Objetivo
Formulário de "Novo atendimento" fiel à seção 5.3 do documento.

### Escopo
Tipo de atendimento (plantão 12h/24h, período de horas, sessão avulsa), endereço, data/horário,
única vez ou repetição, atividades exigidas (lista marcável — define categoria exigida),
informações do paciente (idade, mobilidade, sonda, oxigênio, animais em casa), valor oferecido,
salvar como rascunho, reaproveitar atendimento anterior.

### Fora do escopo
Busca de cuidadores (Etapa 9).

### Dependências
Etapa 7.

### Arquivos esperados
Componente de Novo Atendimento dentro do artifact.

### Entregáveis
Atendimento criado aparece no Início (Etapa 7) com status "Aberto"/"Em busca".

### Critérios de aceite
Atividades marcadas determinam corretamente a categoria mínima exigida (base para R2 na Etapa 9).

### Validação
Criar um atendimento sem exigência de formação e outro exigindo enfermagem; conferir a categoria
calculada em cada um.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `src/pages/company/NewAttendancePage.tsx` (rota
> `/empresa/atendimentos/novo`) com todos os campos da seção 5.3 do documento: tipo (os 4 tipos,
> com duração fixa nos plantões e editável nos demais), paciente, endereço, data/horário/duração,
> repetição, atividades exigidas, valor, e as duas ações — **Publicar** (status `open`, "Em busca")
> e **Salvar rascunho** (status `draft`). "Reaproveitar atendimento anterior" preenche o formulário
> a partir dos 5 atendimentos mais recentes da empresa.
>
> **Decisão tomada com o usuário sobre pacientes:** o plano (baseado no `.docx`) tratava o paciente
> como campo embutido, mas o `CLAUDE.md` §19/§21 pede "Selecionar/Cadastrar Paciente" e o modelo da
> Etapa 3 já fez de `Patient` uma entidade. Resolvido no próprio formulário: seletor dos pacientes
> da empresa **mais** um cadastro inline de paciente novo (nome, idade, responsável, mobilidade,
> oxigênio, sonda, animais, observações). Escolher um paciente preenche o endereço automaticamente
> e mostra o resumo clínico relevante. Uma tela de Pacientes completa (lista/busca/edição, §21)
> continua não existindo — não é escopo de nenhuma etapa do plano e pode virar uma etapa própria se
> o usuário quiser.
>
> Regras: a categoria exigida sai de `attendanceRequiredCategory`, que reusa `requiredCategory` das
> constantes de atividades — nada de lógica nova duplicada. O formulário mostra o resultado ao vivo
> num painel "Perfil necessário", que é o diferencial do produto ficando visível na apresentação.
> **R11** implementada aqui (foi deixada em aberto na Etapa 5): empresa suspensa não vê o CTA, vê
> um aviso no painel, é redirecionada se tentar a URL direta do formulário, e **mantém** o acesso
> ao histórico. Novos componentes de design system: `Select` e `Textarea` (este último eliminou o
> `<textarea>` estilizado à mão que já se repetia em 3 telas); `Input` ganhou estado `disabled`
> visível; os grupos de controles viraram `fieldset`/`legend` (acessibilidade, §39).
>
> `npx tsc -b` sem erros; `npm run lint` sem novos avisos em `src/`. Validado no navegador
> (Playwright, mobile 430px + desktop 1280px) com **38 verificações das Etapas 7 e 8, todas
> passando e zero erros de console**: os 5 números do painel batem com o dataset (hoje 1, em aberto
> 4, pacientes 6, cuidadores ativos 3, horas calculadas do check-in/out); as 4 pendências corretas
> (candidatura + rascunho + 2 alertas); isolamento confirmado logando como a segunda empresa
> (2 pacientes, 2 em aberto, nenhum dado da primeira). Na tela 05, o critério de aceite foi testado
> passo a passo: só atividades informais ⇒ **Informal**; marcar sinais vitais ⇒ **Técnico**; marcar
> fisioterapia ⇒ **Superior**; desmarcar volta para Informal. Publicar levou "Em aberto" de 4 para
> 5 com o crachá "Em busca"; o rascunho apareceu no filtro Rascunhos; o cadastro inline levou os
> pacientes de 6 para 7; o reaproveitar preencheu paciente e atividades. R11 verificada de ponta a
> ponta suspendendo a empresa pela área do admin (Etapa 5) e conferindo o efeito imediato.

---

## Etapa 9 — Busca e Sugestão de Cuidadores (tela 06 aplicada a um atendimento)

### Objetivo
A partir de um atendimento aberto, mostrar cuidadores compatíveis.

### Escopo
Lista ordenada por proximidade/avaliação/histórico com a empresa, filtros (categoria,
especialidade, bairro, turno, faixa de valor), visualização do perfil completo, envio de convite
(um ou vários) ou marcação como "publicação aberta".

### Fora do escopo
Aceite/candidatura em si (Etapa 10).

### Dependências
Etapas 6 e 8.

### Arquivos esperados
Componente de Busca de Cuidadores dentro do artifact.

### Entregáveis
Lista de compatíveis correta para atendimentos com e sem exigência de formação.

### Critérios de aceite
**R2 e R3 aplicadas de verdade**: atendimento que exige formação nunca lista informais; técnico/
superior só aparece com registro no conselho aprovado.

### Validação
Repetir o teste da Etapa 8 e confirmar que a lista muda corretamente conforme a exigência.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `src/services/matching.ts` com `compatibleCaregivers`, que
> aplica as três regras de elegibilidade de uma vez — R1 (cadastro aprovado), R2 (categoria do
> cuidador ≥ categoria exigida pelas atividades) e R3 (técnico/superior só com registro no conselho
> conferido) — e ordena por proximidade de bairro, histórico com a empresa e avaliação.
> `src/pages/company/MatchingPage.tsx` (rota `/empresa/atendimentos/:attendanceId/cuidadores`)
> mostra o perfil exigido em destaque, os filtros (busca por nome/bairro/especialidade, turno e
> valor máximo), o link para o perfil completo da Etapa 6, o botão Convidar por cuidador e o
> interruptor de publicação aberta. Ponto de entrada: ação "Buscar cuidadores" nos cards da lista
> de atendimentos.
>
> Validado no navegador junto com a Etapa 10 — ver a nota da Etapa 10.

---

## Etapa 10 — Convite, Candidatura e Confirmação (telas 08/10, parte da 11)

### Objetivo
Fechar o ciclo entre Empresa e Cuidador até a confirmação.

### Escopo
Visão do cuidador: convites recebidos / atendimentos em aberto (se publicação aberta), aceitar/
recusar/perguntar. Visão da empresa: candidaturas recebidas, comparar, confirmar um. Ao
confirmar: aviso automático aos demais, endereço liberado (R5), atendimento entra na agenda.
Cancelamento com registro de quem/quando/motivo (R8, R12).

### Fora do escopo
Visualização em calendário (Etapa 11).

### Dependências
Etapa 9.

### Arquivos esperados
Componentes de Convite/Candidatura dentro do artifact.

### Entregáveis
Fluxo convite → candidatura → confirmação funcional nos dois perfis.

### Critérios de aceite
**R4 aplicada**: cuidador não consegue aceitar dois atendimentos com horário sobreposto; **R5**:
endereço completo só some/aparece corretamente conforme confirmação.

### Validação
Tentar aceitar dois convites conflitantes (deve bloquear); confirmar um candidato e checar que o
endereço fica visível só para ele.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): ciclo fechado em `src/services/invitations.ts` —
> `sendInvitation`, `acceptInvitation`, `rejectInvitation`, `applyToOpenAttendance`,
> `confirmApplication` e `cancelAttendance`, cada um cuidando das transições de status do
> atendimento e das notificações (convite, candidatura, confirmação, cancelamento). Aceitar um
> convite vira uma candidatura: quem decide continua sendo a empresa.
>
> Regras: **R4** em `conflictingAttendance` — bloqueia aceitar/candidatar-se a horário que se
> sobrepõe a um atendimento já confirmado ou já aceito, com aviso dizendo qual é o conflito.
> **R5** em `canSeeFullAddress` — antes da confirmação o cuidador vê só o bairro com um cadeado;
> depois, o endereço completo. **R8/R12** em `cancelAttendance` — calcula a antecedência real,
> marca quando é menor que 12h e grava no log de auditoria visível na área do admin.
>
> Telas: `src/pages/company/ApplicationsPage.tsx` (tela 08 — comparar interessados, confirmar um,
> cancelar com motivo) e `src/pages/caregiver/InvitationsPage.tsx` (tela 10 — convites recebidos,
> publicações abertas compatíveis e "confirmados para você", que é onde a R5 fica visível).
> `AttendanceCard` ganhou um slot de ações para levar a essas telas.
>
> **Fora do que foi feito:** o "perguntar antes de decidir" citado no escopo é conversa por
> mensagem — fica para a Etapa 15. O cancelamento está implementado do lado da empresa; o lado do
> cuidador entra junto com a agenda dele (Etapa 11). A visualização em calendário é a Etapa 11.
>
> `npx tsc -b` sem erros; `npm run lint` sem novos avisos em `src/`. Validado no navegador
> (Playwright, mobile 430px) com **28 verificações das Etapas 9 e 10, todas passando e zero erros
> de console**. R2/R3 conferidas no atendimento at3 (exige superior): Sandra (informal) e Juliana
> (técnica) somem, Paulo Ricci some por estar com o registro pendente, e Marcos Vidal aparece; no
> at8 (informal) as três categorias aparecem e os cadastros bloqueado/recusado nunca entram (R1).
> Fluxo completo percorrido de ponta a ponta: convidar → cuidadora aceita → empresa vê a
> candidatura → confirma → status vira Confirmado e o endereço completo aparece só para ela. R4
> provada publicando um atendimento no mesmo dia e horário de um já confirmado e tentando aceitar —
> bloqueado com a mensagem do conflito. R8/R12 provadas cancelando com motivo e conferindo o
> registro na auditoria do admin.

---

## Etapa 11 — Agenda e Escala (telas 09 e parte da 10/11)

### Objetivo
Visão de calendário/lista dos atendimentos confirmados.

### Escopo
Agenda do cuidador (lista + calendário, próximos atendimentos), escala da empresa (dia/semana +
status de cada atendimento), lembrete automático (véspera + 1h antes, simulado via notificação),
tela de Detalhe do Atendimento (11) com endereço, horário, tarefas, infos do paciente.

### Fora do escopo
Edição por arrastar/soltar.

### Dependências
Etapa 10.

### Arquivos esperados
Componentes de Agenda/Escala/Detalhe dentro do artifact.

### Entregáveis
Atendimento confirmado na Etapa 10 aparece corretamente na agenda de ambas as partes.

### Critérios de aceite
Status de cada atendimento na escala reflete o estado real (aberto/confirmado/em andamento/
concluído/cancelado).

### Validação
Conferir agenda de empresa e cuidador após confirmar um atendimento de teste.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `SchedulePage` (`src/pages/shared/`) servia os dois perfis —
> escala da empresa em `/empresa/agenda` e agenda do cuidador em `/cuidador/agenda` — com
> alternância dia/semana sobre `scheduleDays` e o status real de cada atendimento no crachá.
>
> **Atualização (Revisão 6):** as duas telas se separaram, porque as perguntas divergiram. A
> empresa varre dezenas de plantões por semana e precisa de lista longa com filtro por pessoa:
> continua em `CompanySchedulePage` (`src/pages/company/SchedulePage.tsx`), sem mudança de
> comportamento. O cuidador tem poucos plantões espalhados no mês e precisa enxergar a **forma do
> mês** — onde estão os buracos — para marcar médico ou decidir sobre um convite; lista de sete
> dias não responde isso. `CaregiverSchedulePage` (`src/pages/caregiver/SchedulePage.tsx`) virou
> calendário: grade do mês (`<Calendario>`) com um ponto por plantão confirmado no dia, e os
> registros do dia escolhido logo abaixo. O ponto marca **presença, não estado** — numa célula de
> 44px não cabe rótulo ao lado, e cor sozinha é o que a regra 3 do design system proíbe; o estado
> continua sendo lido por extenso no registro de baixo. Convite pendente não entra na grade:
> compromisso e proposta não se misturam no mesmo calendário.
> `AttendanceDetailPage` (`src/pages/shared/`) é a tela 11 e concentra o que as Etapas 12–15
> acrescentam, adaptando-se ao perfil de quem abriu: a empresa vê tudo do atendimento; o cuidador
> vê o mesmo mais os botões de check-in/out e o registro, e só enxerga o endereço completo se for
> o confirmado (R5, reaproveitando `canSeeFullAddress` da Etapa 10). Acesso é verificado nos dois
> sentidos — cuidador não abre atendimento que não é dele.
>
> Lembretes automáticos (véspera e 1h antes) ficam em `syncAutomaticNotifications`
> (`src/services/notifications.ts`), com id derivado do atendimento para serem **idempotentes**;
> rodam uma vez ao carregar o estado, no `AppStateProvider`. O painel do cuidador (tela 10) virou
> real: próximo atendimento, convites, horas realizadas, avaliação e próximos compromissos. Também
> foi criado `CaregiverLayout` (mesma navegação em sidebar/barra inferior da empresa) e a navegação
> da empresa ganhou Escala, Relatórios e Avisos.
>
> Validado no navegador junto com as Etapas 12–16 — ver a nota da Etapa 16.

---

## Etapa 12 — Check-in / Check-out (tela 12)

### Objetivo
Cuidador confirma chegada e saída do atendimento.

### Escopo
Botão de check-in (horário + localização simulada), alerta automático à empresa se não houver
check-in até 15 min do horário combinado, botão de check-out.

### Fora do escopo
Sincronização offline real (apenas citada no `DEMO_GUIDE.md` como comportamento do produto real).

### Dependências
Etapa 11.

### Arquivos esperados
Componente de Check-in/Check-out dentro do artifact.

### Entregáveis
Check-in muda status para "Em andamento"; check-out muda para "Concluído".

### Critérios de aceite
**R6**: check-out bloqueado sem check-in prévio. Alerta de atraso disparado corretamente no
cenário de teste.

### Validação
Tentar check-out sem check-in (deve bloquear); simular atraso e confirmar o alerta.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `checkIn`/`checkOut`/`canCheckOut` em
> `src/services/records.ts`. O check-in grava o horário e a localização simulada
> (`"<bairro> (simulado)"`, sem GPS real) e leva o status para "Em andamento"; o check-out leva
> para "Concluído". **R6** é o próprio `canCheckOut` — o botão de check-out nasce desabilitado e só
> libera depois do check-in, com a explicação visível ao lado. O alerta de atraso é gerado por
> `syncAutomaticNotifications` quando passam mais de 15 min do horário sem check-in, usando a mesma
> constante `CHECKIN_TOLERANCE_MINUTES` que o painel da empresa (Etapa 7) já usava para contar
> pendências — uma fonte só para a regra.

---

## Etapa 13 — Registro do Atendimento (tela 13)

### Objetivo
Formulário preenchido pelo cuidador durante/após o atendimento.

### Escopo
Lista de tarefas marcáveis conforme execução, campo de observações, campo de sinais vitais
(quando aplicável à categoria), anexo de até 3 fotos (simuladas), fechamento automático no
check-out.

### Fora do escopo
Upload real de arquivos (fotos serão simuladas/placeholder).

### Dependências
Etapa 12.

### Arquivos esperados
Componente de Registro dentro do artifact.

### Entregáveis
Registro visível para Empresa e para o próprio cuidador no histórico do atendimento.

### Critérios de aceite
**R7**: após check-out, registro fica travado para edição; correção só pode ser adicionada como
nova observação.

### Validação
Preencher um registro, fazer check-out, tentar editar (deve bloquear) e adicionar uma nova
observação.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): **tipo novo** `AttendanceRecord` (`src/types/record.ts`) —
> tarefas concluídas, observações, sinais vitais, fotos simuladas e `closedAt` — somado ao
> `AppState` como `records`, com `src/mocks/records.ts` cobrindo os três atendimentos já encerrados
> do dataset para o histórico não nascer vazio. A tela mostra as tarefas do próprio atendimento
> como checkboxes, observações com data, até 3 fotos simuladas (só o rótulo, sem upload — §35) e
> os sinais vitais **apenas quando o cuidador tem formação** (técnico/superior), como pede o
> escopo.
>
> **R7** vive em `isRecordLocked`/`updateRecord`: o check-out grava `closedAt` e, a partir daí,
> `updateRecord` recusa qualquer alteração — tarefas e sinais vitais ficam desabilitados, o botão
> de anexar foto some, e a única porta que continua aberta é `addObservation`, que marca a entrada
> com `afterCheckout: true` e a exibe como "acrescentada após o check-out".

---

## Etapa 14 — Avaliação e Histórico (tela 15)

### Objetivo
Avaliação mútua e histórico de atendimentos por cuidador.

### Escopo
Empresa avalia cuidador (1–5 + comentário) e cuidador avalia empresa; histórico completo de
atendimentos por cuidador dentro da empresa.

### Fora do escopo
Moderação de conteúdo.

### Dependências
Etapa 13.

### Arquivos esperados
Componente de Avaliação dentro do artifact.

### Entregáveis
Avaliação registrada; histórico do cuidador atualizado.

### Critérios de aceite
**R9**: avaliação só liberada após atendimento concluído. **R10**: média só aparece a partir da
3ª avaliação (antes disso, mostrar algo como "ainda sem média suficiente").

### Validação
Avaliar um cuidador com menos de 3 avaliações (sem média visível) e outro com 3+ (média visível).

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `src/services/evaluations.ts` com `canEvaluate` (**R9** — o
> formulário só aparece com o atendimento concluído/avaliado; antes disso a seção explica que a
> avaliação é liberada depois), `evaluationFor` (cada lado avalia uma vez só) e `createEvaluation`,
> que registra a nota de 1 a 5 mais o comentário e move o atendimento para "Avaliado". Os dois
> lados avaliam a partir da mesma tela de detalhe: a empresa avalia o cuidador, o cuidador avalia
> a empresa. **R10** já estava implementada na Etapa 6 (`caregiverRating` só devolve média a partir
> da 3ª avaliação da empresa) e continua sendo a única fonte da média — nada foi duplicado aqui.
> `caregiverHistory` alimenta a nova seção "Histórico com a empresa" no perfil do cuidador
> (tela 07), fechando a parte de histórico do escopo.

---

## Etapa 15 — Avisos e Conversa (tela 14 + notificações)

### Objetivo
Chat vinculado a atendimento + central de notificações dos eventos do fluxo.

### Escopo
Conversa por mensagem entre Empresa e Cuidador, ligada a um atendimento específico, com
histórico guardado. Notificações para: convite, confirmação, cancelamento, lembrete, falta de
check-in.

### Fora do escopo
Mensagens fora do contexto de um atendimento; push/SMS reais.

### Dependências
Etapa 10 (convite/confirmação), Etapa 12 (falta de check-in), pode iniciar em paralelo à 11–14.

### Arquivos esperados
Componentes de Conversa e Notificações dentro do artifact.

### Entregáveis
Chat funcional por atendimento; notificações aparecem nos momentos corretos do fluxo.

### Critérios de aceite
Cada evento-gatilho (convite, confirmação, cancelamento, lembrete, falta de check-in) gera
notificação para o perfil correto.

### Validação
Percorrer o fluxo completo e conferir se cada notificação aparece no momento certo.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): a conversa (tela 14) fica dentro da tela de detalhe do
> atendimento, como o escopo pede — vinculada a um atendimento, nunca solta.
> `src/services/messages.ts` guarda a mensagem e dispara a notificação `new_message` para o outro
> lado. Central de notificações em `src/pages/shared/NotificationsPage.tsx`, servindo os dois
> perfis (`/empresa/notificacoes` e `/cuidador/notificacoes`), com não-lidas destacadas, contador
> na navegação e "marcar todas como lidas".
>
> Os cinco gatilhos do escopo estão cobertos e cada um nasce no serviço que provoca o evento, não
> na tela: convite e candidatura em `invitations.ts` (Etapa 10), confirmação e cancelamento no
> mesmo lugar, lembrete e falta de check-in em `notifications.ts` (Etapas 11/12), nova mensagem em
> `messages.ts`.

---

## Etapa 16 — Relatório de Horas / Fechamento (tela 16)

### Objetivo
A tela que resolve a dor nº 1 do documento: fechamento de horas sem conferência manual.

### Escopo
Cálculo de horas a partir dos check-ins/check-outs, por cuidador e por período, exportação
simulada em formato de planilha (gerar um arquivo real para download, ex.: CSV/XLSX).

### Fora do escopo
Integração com sistemas financeiros reais.

### Dependências
Etapas 12 e 13 (precisa de check-ins/outs e registros ao longo do tempo).

### Arquivos esperados
Componente de Relatório de Horas dentro do artifact.

### Entregáveis
Relatório fecha igual à soma manual dos dados mockados; exportação gera um arquivo real.

### Critérios de aceite
Números do relatório batem exatamente com os dados brutos de check-in/check-out do período.

### Validação
Conferir manualmente a soma de horas de um cuidador de teste contra o relatório gerado.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `src/services/reports.ts` (`buildReport`, `reportTotals`,
> `reportToCsv`) e `src/pages/company/ReportsPage.tsx` em `/empresa/relatorios`. As horas
> realizadas saem **do check-in/check-out**, não da duração contratada — os dois números aparecem
> lado a lado, que é exatamente a conferência manual que o cliente faz hoje na mão. Filtros por
> período, cuidador e paciente; totais de atendimentos, horas previstas, horas realizadas e valor.
> Exportação gera um CSV real (separador `;`, decimal com vírgula e BOM, para abrir certo no Excel
> em português) via `Blob` — arquivo de verdade, nada simulado.
>
> `npx tsc -b` sem erros; `npm run lint` sem novos avisos em `src/`. Validado no navegador
> (Playwright, mobile 430px) com **29 verificações cobrindo as Etapas 11 a 16, todas passando e
> zero erros de console**. Fluxo percorrido de ponta a ponta em um atendimento real do dataset:
> escala da empresa (dia/semana, status corretos) → detalhe → login do cuidador → **R6** (check-out
> desabilitado, liberado só após o check-in) → check-in muda para "Em andamento" e grava a
> localização simulada → registro com tarefa, foto e observação → check-out muda para "Concluído" e
> **R7** trava tudo (tarefas desabilitadas, botão de foto some) deixando só a observação, que entra
> marcada como posterior ao check-out → **R9** libera a avaliação dos dois lados → mensagem enviada
> aparece na conversa e gera notificação para o outro perfil → lembrete automático visível na
> central do cuidador → relatório com **a soma das linhas batendo com o total exibido** (72,0h
> previstas contra 60,5h realizadas), filtro por cuidador funcionando e CSV baixado e lido de
> volta com cabeçalho e linhas. Também verificado que um cuidador não abre o detalhe de atendimento
> que não é dele.

---

## Etapa 17 — Favoritos e Perfil/Configurações (parte da tela 04/17)

### Objetivo
Lista de cuidadores favoritos da empresa, para convidar mais rápido.

### Escopo
Marcar/desmarcar favorito no perfil do cuidador (Etapa 6); lista de favoritos acessível a partir
do Início da Empresa; uso dos favoritos como atalho na Busca (Etapa 9).

### Fora do escopo
Nada além do citado.

### Dependências
Etapas 6, 7 e 9.

### Arquivos esperados
Ajustes nos componentes de Cuidador, Início e Busca.

### Entregáveis
Favoritar um cuidador de teste e encontrá-lo na lista de favoritos e priorizado na busca.

### Critérios de aceite
Favorito persiste entre navegações (via `window.storage`, Etapa 19).

### Validação
Favoritar, navegar para outra tela, voltar e confirmar que o favorito permanece.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): o campo `favoriteCaregiverIds` já existia em `Company` desde a
> Etapa 3; aqui ele ganhou comportamento. `isFavorite`/`toggleFavorite` em
> `src/services/caregivers.ts`, botão "Favoritar / Nos favoritos" no perfil do cuidador (tela 07),
> coração no `CaregiverCard` e um filtro "Favoritos" na lista (tela 06). Na busca da Etapa 9 os
> favoritos passaram a ser o **primeiro critério de ordenação**, antes de proximidade, histórico e
> avaliação — que é o atalho para convidar mais rápido que o escopo pede.

---

## Etapa 18 — Números de Uso

> **Revertida na Revisão 5.** Os "números de uso" eram uma visão global de plataforma, própria de
> um administrador — papel que não existe no modelo. `services/metrics.ts` e a tela foram
> removidos; a empresa continua com os seus próprios números no Início e no Relatório de horas.
> O texto histórico fica preservado para rastreabilidade.

### Objetivo
Completar a área de administração com números básicos.

### Escopo
Cadastros (por status), atendimentos publicados, atendimentos concluídos — visão simples,
complementando a fila de aprovação da Etapa 5.

### Fora do escopo
As métricas de sucesso do MVP (seção 12 do documento — tempo até confirmar cuidador,
% de atendimentos preenchidos etc.) **não fazem parte da área de administração descrita no
documento**; podem ser oferecidas como um destaque comercial opcional no `DEMO_GUIDE.md`, mas não
serão construídas como tela nesta etapa a menos que solicitado.

### Dependências
Etapas 3 e 5.

### Arquivos esperados
Componente de Administração (parte 2) dentro do artifact.

### Entregáveis
Números batendo com o dataset mockado, atualizando conforme ações da demo.

### Critérios de aceite
Contagens corretas antes/depois de ações de teste (aprovar cadastro, publicar atendimento etc.).

### Validação
Comparar números exibidos com contagem manual do dataset.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): `src/services/metrics.ts` (`platformMetrics`) e a seção
> "Números de uso" na área de administração: cadastros por situação (as 4 situações, separando
> cuidadores de empresas) e atendimentos publicados, concluídos, cancelados, mais pendências na
> fila, pacientes e avaliações. Tudo **derivado do estado**, como o comentário de
> `src/mocks/dashboard.ts` já exigia — nenhum contador mockado que possa dessincronizar. As
> métricas de sucesso do MVP continuam fora, conforme o "fora do escopo" desta etapa.

---

## Etapa 19 — Persistência Local (window.storage) e Reset da Demo

### Objetivo
Persistir ações do usuário durante a sessão e permitir reset com um clique.

### Escopo
Camada única de acesso a dados (`dataStore`) usando `window.storage`, com fallback para o seed
quando a chave não existe; botão de reset na área de administração restaurando o dataset da
Etapa 3.

### Fora do escopo
Sincronização entre dispositivos/usuários (não é necessário storage `shared`).

### Dependências
Etapa 3; usado por todas as etapas de 4 a 18.

### Arquivos esperados
Serviço `dataStore` dentro do artifact.

### Entregáveis
Nenhuma tela usa `localStorage`/`sessionStorage`; reset restaura tudo.

### Critérios de aceite
Reset após diversas ações de teste retorna exatamente ao estado inicial documentado na Etapa 3.

### Validação
Alterar dados em várias telas, resetar, e conferir retorno ao estado inicial.

### Status
```text
[x] Concluída — com a substituição de `window.storage` por `localStorage`
```
> Nota de execução (pós-Revisão 4): **o escopo original desta etapa está superado num ponto.** Ela
> foi escrita na era do artifact e pedia `window.storage`, com o entregável "nenhuma tela usa
> `localStorage`". No projeto real o `CLAUDE.md` §15 manda usar `localStorage`, e `window.storage`
> nem existe fora do Claude.ai. A intenção da etapa — **uma camada única de acesso a dados, com
> nenhuma tela falando direto com o navegador** — foi mantida e é o que foi entregue.
>
> `src/services/storage.ts` é agora o único módulo do projeto que menciona `localStorage`
> (verificado por busca em todo o `src/`): estado da aplicação, sessão e reset. O
> `SessionProvider`, que até então gravava a sessão por fora, passou a usar
> `loadSession`/`saveSession`/`clearSession` desse módulo. As funções de estado seguem assíncronas
> de propósito, para uma futura `ApiService` entrar no lugar sem as telas perceberem.
>
> Reset da demo (CLAUDE.md §16) em **Configurações**, dentro da área de administração — o plano
> pedia "na área de administração" e o `CLAUDE.md` pedia "em Configurações"; a seção nova atende
> aos dois. Pede confirmação antes de executar, restaura o seed, limpa a sessão e devolve o usuário
> à tela de entrada, deixando o ambiente pronto para a próxima apresentação.

---

## Etapa 20 — Responsividade e Refinamento Visual

### Objetivo
Garantir boa apresentação mobile first + área de administração em desktop.

### Escopo
Breakpoints, ajuste de densidade de informação, contraste/acessibilidade básica, estados vazios
e de carregamento, polimento do "frame" de celular usado nas telas do app.

### Fora do escopo
Suporte pixel-perfect a todos os tamanhos de tela.

### Dependências
Etapas 4 a 19 concluídas.

### Arquivos esperados
Ajustes transversais no artifact.

### Entregáveis
App coeso tanto no frame mobile quanto na área de administração desktop.

### Critérios de aceite
Sem elementos cortados/sobrepostos; estados vazios tratados.

### Validação
Inspeção visual em diferentes larguras.

### Status
```text
[x] Concluída
```
> Nota de execução (pós-Revisão 4): a moldura decorativa fixa de 320px descrita na auditoria não
> existe mais — desde a Etapa 0 o projeto é Tailwind com breakpoints de verdade, e as telas foram
> nascendo mobile-first. Esta etapa fez a varredura sistemática que faltava.
>
> Auditoria automatizada em **4 larguras (360, 430, 768 e 1280px) × 20 telas**, medindo
> `scrollWidth > clientWidth` no documento e listando qualquer elemento que ultrapassasse a
> viewport. Resultado inicial: **um problema real** — a área de administração estourava a 360px.
> Ela é desenhada para desktop (DESIGN_SYSTEM.md §3), mas a sidebar fixa de 176px espremia o
> conteúdo a ponto de os crachás vazarem e os botões saírem do card. Corrigido: no celular a
> navegação do admin vira uma faixa horizontal rolável acima do conteúdo e volta a ser sidebar a
> partir de `md:`; as linhas de cuidador/empresa ganharam `flex-wrap`.
>
> Depois da correção: **zero rolagem horizontal nas 4 larguras, em todas as 20 telas, e zero erros
> de console**. Estados vazios já vinham tratados tela a tela nas etapas anteriores (fila vazia,
> busca sem resultado, agenda sem atendimentos, relatório sem linhas, notificações vazias), assim
> como os estados de carregamento. Outros ajustes de refinamento feitos no caminho: a faixa de
> números do painel deixou de exibir uma célula cinza vazia no mobile, `Input` ganhou estado
> `disabled` visível, os grupos de controles viraram `fieldset`/`legend`, e a barra inferior da
> empresa ficou com 5 itens (6 não cabem), com Relatórios acessível por link no painel.

---

## Etapa 21 — Validação do Fluxo Completo (Testes Manuais)

### Objetivo
Rodar o "Exemplo de uso do começo ao fim" do documento (seção 8) do zero, após reset.

### Escopo
Checklist ponto a ponto seguindo os 15 passos do exemplo real do documento (Sandra / dona Marli),
mais um teste explícito de cada regra R1–R12.

### Fora do escopo
Automação de testes.

### Dependências
Etapas 1 a 20.

### Arquivos esperados
`docs/DEMO_GUIDE.md` (checklist).

### Entregáveis
Roteiro validado sem erros bloqueantes.

### Critérios de aceite
100% dos passos do exemplo do documento executáveis sem erro; todas as 12 regras verificáveis na
prática.

### Validação
Execução completa do checklist, do zero, por quem for apresentar a demo.

### Status
```text
[!] Precisa de correção
```
> Nota de auditoria (Revisão 4): o próprio `docs/DEMO_GUIDE.md` (seção 3, nota final) registra que
> a validação foi feita "por revisão cuidadosa do código e checagem de balanceamento sintático",
> não por execução real em navegador — porque não havia ambiente para rodar o app. Precisa ser
> refeita como testes manuais reais assim que o projeto rodar via `npm run dev` (Etapa 0+).

---

## Etapa 22 — Preparação para Apresentação

### Objetivo
Deixar a demo pronta para uso comercial.

### Escopo
`docs/DEMO_GUIDE.md` com roteiro de apresentação (idealmente usando o próprio exemplo "Sandra /
dona Marli" do documento como narrativa), curadoria do dataset inicial, e — como destaque
comercial opcional — uma seção mostrando como os números da seção 12 do documento (tempo até
confirmar cuidador, % de atendimentos preenchidos etc.) poderiam ser calculados a partir do
dataset da demo, sem necessariamente virar tela.

### Fora do escopo
Material de vendas fora do produto.

### Dependências
Etapa 21.

### Arquivos esperados
`docs/DEMO_GUIDE.md`

### Entregáveis
Guia de demonstração pronto para o time comercial.

### Critérios de aceite
Guia cobre login → percurso recomendado (incluindo a diferenciação por categoria) → pontos de
destaque → como resetar.

### Validação
Leitura crítica simulando quem nunca viu o produto.

### Status
```text
[~] Em andamento
```
> Nota de auditoria (Revisão 4): `docs/DEMO_GUIDE.md` é um bom roteiro comercial e continua válido
> como conteúdo, mas descreve como abrir "o artifact `app_acalento_homecare.jsx`" em vez de rodar
> a aplicação real via `npm run dev`. Precisa de um ajuste de redação depois que o projeto real
> existir (Etapa 0+), sem precisar reescrever o roteiro em si.

---

## 4. Resumo de Dependências (visão macro)

```
Etapa 0 (Bootstrap do Projeto Real) — pré-requisito de tudo abaixo (Revisão 4)
  → Etapa 1 (Análise)
  → Etapa 2 (Design System) ─┐
  → Etapa 3 (Dados Mockados) ─┼→ Etapa 4 (Navegação/Cadastro/Auth simulados)
                                    → Etapa 5 (Aprovação — Admin)
                                         → Etapa 6 (Perfil do Cuidador)
                                              → Etapa 7 (Início da Empresa)
                                                   → Etapa 8 (Novo Atendimento)
                                                        → Etapa 9 (Busca/Sugestão — R2,R3)
                                                             → Etapa 10 (Convite/Candidatura/Confirmação — R4,R5)
                                                                  → Etapa 11 (Agenda/Escala)
                                                                       → Etapa 12 (Check-in/out — R6)
                                                                            → Etapa 13 (Registro — R7)
                                                                                 → Etapa 14 (Avaliação — R9,R10)
                                    → Etapa 15 (Avisos/Conversa, paralela a 10–14)
                                    → Etapa 19 (Persistência, paralela, cedo)
  Etapas 12,13 → Etapa 16 (Relatório de Horas)
  Etapas 6,7,9 → Etapa 17 (Favoritos)
  Etapas 3,5 → Etapa 18 (Admin — números de uso)
  Etapas 4–19 → Etapa 20 (Responsividade)
  Etapas 1–20 → Etapa 21 (Validação) → Etapa 22 (Preparação para apresentação)
```

**Total de etapas: 23** (Etapa 0 adicionada na Revisão 4, pré-requisito; Etapa 1 concluída —
Revisão 2; status de execução das Etapas 1–22 corrigido na Revisão 4 — ver seção 6 e
`docs/PROJECT_AUDIT.md`).

---

## 5. Escopo delimitado da demo (confirmação do gate)

Este gate cobre a **completude do planejamento** (o plano documenta todas as etapas necessárias),
que é diferente da **completude de execução** (quantas etapas de fato rodam e foram testadas —
ver os status corrigidos na seção 3 e o resumo em `docs/PROJECT_AUDIT.md`).

- [x] `IMPLEMENTATION_PLAN.md` existe e reflete o `MVP_Home_Care.docx` (documento não localizado no
      repositório nesta auditoria — ver `docs/PROJECT_AUDIT.md` seção 2).
- [x] Todas as 23 etapas documentadas (objetivo, escopo, fora do escopo, dependências, arquivos
      esperados, entregáveis, critérios de aceite, validação, status).
- [x] Dependências entre etapas explícitas (seção 4).
- [x] Critérios de aceite ligados às regras R1–R12 do documento real.
- [x] Escopo da demo delimitado (seções 1.10 e 1.11).
- [x] Ordem de implementação definida (Etapa 0 → Etapa 22).

**PLANEJAMENTO CONCLUÍDO (Revisão 2). EXECUÇÃO PENDENTE DE CORREÇÃO ARQUITETURAL (Revisão 4) —
ver Etapa 0.**

---

## 6. Log de Decisões e Mudanças

| Quando | Mudança | Motivo | Etapas afetadas |
|---|---|---|---|
| Revisão 1 | `MVP_Home_Care.docx` não estava disponível; análise baseada em README + roteiro genérico | Arquivo não enviado no upload inicial | Todas |
| Revisão 1 | Adotado artifact React single-file em vez do pipeline `web-artifacts-builder` | `bash_tool` sem acesso de rede (`host_not_allowed` confirmado) | Etapas 2–22 |
| Revisão 2 | Removido o perfil "Paciente/Família" como usuário; paciente vira campos dentro do Atendimento | O documento real declara explicitamente que família/paciente não usam o app nesta versão | Etapas 8, 9, 11 (antiga "Etapa Pacientes" removida) |
| Revisão 2 | "Matching" com score/ranking dedicado virou "Busca e Sugestão de Cuidadores" (ordenação + filtros, sem tela de score) | Fidelidade ao documento (seção 5.4) | Antiga Etapa 8 → nova Etapa 9 |
| Revisão 2 | Regras de negócio genéricas substituídas pelas R1–R12 literais do documento | Fidelidade ao documento (seção 9) | Todas as etapas de 4 a 16 passaram a citar a regra específica que implementam |
| Revisão 2 | Adicionada a categorização de cuidador (informal/técnico/superior) como conceito de primeira classe, com etapa dedicada de aprovação (Etapa 5) | Descrita no documento como "o coração da plataforma" | Etapas 4, 5, 6, 9 |
| Revisão 2 | Adicionada etapa de Relatório de Horas com exportação real de arquivo (era genérico "Relatórios" com gráficos) | O documento identifica o fechamento de horas como a dor nº 1 do cliente | Etapa 16 (antiga Etapa 16 "Relatórios" redefinida) |
| Revisão 2 | Métricas de sucesso do MVP (seção 12 do doc) tratadas como destaque opcional no `DEMO_GUIDE.md`, não como tela de admin | O documento não as descreve como parte da área de administração do produto | Etapa 18, Etapa 22 |
| Revisão 2 | Produto reconhecido como mobile first; design system e telas do app adaptados para um "frame" de celular no artifact web | Explícito na seção 10 do documento | Etapas 2, 4, 20 |
| Revisão 3 | Etapas 3 a 22 implementadas em uma única rodada, em vez de uma etapa por vez com validação intermediária do usuário | Pedido explícito do usuário ("pode seguir com todas as etapas") — substitui a regra de isolamento entre etapas do prompt original para esta rodada | Etapas 3–22 |
| Revisão 3 | Compatibilidade de busca (R2/R3) passou a exigir também que o cuidador tenha as atividades específicas do atendimento na sua lista de atividades, não só a categoria mínima | Sem esse refinamento, um fisioterapeuta apareceria como compatível para uma visita de enfermagem — a categoria sozinha não garante a especialidade certa | Etapa 9 |
| Revisão 3 | Validação do fluxo completo (Etapa 21) foi feita por revisão de código e checagem de balanceamento sintático, não por execução real em navegador | Ambiente sem acesso à internet para instalar um bundler/navegador de teste (mesma limitação da seção 2.2) | Etapa 21 — recomenda-se que o usuário percorra o roteiro do `DEMO_GUIDE.md` ao abrir o artifact |
| Revisão 3 | Cadastro completo (passo a passo) implementado só para o perfil Cuidador; cadastro de nova Empresa é simulado com uma mensagem | Cuidador é o fluxo mais demonstrado comercialmente; ver `DEMO_GUIDE.md` seção 4 para a lista completa de simplificações assumidas | Etapa 4 |
| Revisão 4 (auditoria) | Adicionada Etapa 0 — Bootstrap do Projeto Real (Vite + React + TypeScript + Tailwind, `npm install`/`npm run dev`, estrutura `src/`) | `CLAUDE.md` (não versionado até esta rodada) exige explicitamente projeto npm real executável localmente — a decisão de artifact single-file das Revisões 1/3 foi tomada por limitação do ambiente de então, não por escolha de produto, e hoje contradiz a regra 2 do `CLAUDE.md` | Nova Etapa 0; todas as demais passam a depender dela |
| Revisão 4 (auditoria) | Status de execução das Etapas 1–22 corrigido: Etapa 1 mantida `[x]` (conteúdo); Etapa 2 rebaixada a `[!]` (doc válido, implementação em CSS não-Tailwind); Etapas 3–19 rebaixadas a `[~]` (lógica/UX prototipadas, nunca executadas em navegador, arquitetura a ser substituída); Etapa 20 rebaixada a `[ ]` (responsividade real nunca implementada, só moldura decorativa); Etapa 21 rebaixada a `[!]` (validação foi só leitura de código, por admissão do próprio `DEMO_GUIDE.md`); Etapa 22 rebaixada a `[~]` (guia bom, mas descreve abrir "o artifact" em vez de `npm run dev`) | Nenhuma etapa rodou de fato em um projeto executável — não existia `package.json`. A regra de conclusão exige implementada + executando + testada + validada + critérios atendidos, não só "código escrito" | Etapas 1–22 |
| Revisão 4 (auditoria) | `window.storage` (usado em `app_acalento_homecare.jsx`) identificado como API específica do ambiente de artifacts do Claude.ai, não uma API de navegador padrão — precisa virar `localStorage` na reimplementação, conforme já era a orientação do `CLAUDE.md` seção 15 | Rodando fora do ambiente de artifacts (ex.: em um navegador comum via Vite), `window.storage` é `undefined` e o app quebraria ao tentar persistir | Etapa 19 (Persistência), Etapa 0 |
| Revisão 4 (auditoria) | Confirmado que a implementação atual usa 0 classes Tailwind, apesar da seção 2.1 deste documento afirmar "Tailwind (classes core)" — todo o CSS é customizado via `<style>{STYLE}</style>` com prefixo `ac-*` | Levantamento direto no código (`grep` por classes Tailwind retornou 0 ocorrências em ambos os arquivos `.jsx`) | Etapa 2, Etapa 0, seção 2.1 (mantida como registro histórico da intenção original, não da realidade entregue) |
| Revisão 5 | **Perfil de Administrador removido do modelo.** `UserRole` passou a ser `company | caregiver`; rota `/admin`, `src/pages/admin/`, `src/features/admin/`, `src/services/admin.ts`, `src/services/metrics.ts` e a conta `admin@demo.com` foram excluídos | O `MVP_Home_Care.docx` não descreve um administrador de plataforma aprovando o cuidador responsável pelo plantão; quem precisa desse controle é a empresa | Etapas 4, 5, 18, 19; seções 1.1, 1.4, 1.5, 1.6, 1.8, 2.1, 2.3 |
| Revisão 5 | **Aprovação do cuidador virou responsabilidade da Empresa, com quadro próprio por empresa.** Novo tipo `CaregiverLink` (`companyId` × `caregiverId` × status) e `src/services/roster.ts`; `Caregiver.approvalStatus`/`rejectionReason` deixaram de existir. Ausência de vínculo = "em análise" na fila daquela empresa | Dá à empresa o controle de quem pode assumir os seus plantões, e permite que o mesmo cuidador esteja aprovado em uma empresa e em análise em outra | R1, R3, R12; Etapas 5, 9, 10, 17 |
| Revisão 5 | Fila de aprovação passou a viver em **Empresa → Cuidadores**, em três abas (Meu quadro / Em análise / Inativos); aprovar/recusar/bloquear também no perfil do cuidador | Mantém o controle no fluxo de trabalho de quem escala o plantão, sem criar uma área separada | Etapa 5, Etapa 9 |
| Revisão 5 | Criada **Empresa → Configurações** com dados da empresa, registro de atividade (R12, filtrado por empresa) e o reset da demonstração | O reset e a auditoria viviam na área de administração removida; o `CLAUDE.md` §16 já pedia o reset em "Configurações" | Etapa 18, Etapa 19 |
| Revisão 5 | **R11 removida** (empresa suspensa não publica): `Company.approvalStatus` e `canPublishAttendance` excluídos | A suspensão dependia de um administrador de plataforma; sem esse papel a regra não tem ator | R11; Etapas 5, 8, 10 |
| Revisão 5 | Chave do `localStorage` promovida a `acalento:app-state:v2` | O estado v1 guarda cuidadores com `approvalStatus` global e sem `caregiverLinks`; migrar não vale a pena numa demo, então a v2 recarrega o seed novo | Etapa 19 |
