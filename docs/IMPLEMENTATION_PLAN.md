# IMPLEMENTATION_PLAN.md — MVP Acalento Home Care

> Plano oficial de execução do projeto. Versionado no repositório conforme regra do prompt.
> Revisão 3 — Etapas 3 a 22 implementadas em bloco a pedido do usuário. Ver seção 6 (Log de
> Decisões) para o que mudou em cada revisão, e `docs/DEMO_GUIDE.md` para o roteiro de
> demonstração e o checklist de validação.

---

## 0. Sobre esta revisão

A Revisão 1 deste plano foi construída sem o `MVP_Home_Care.docx` (não enviado no upload
inicial), a partir do `README.md` e de um roteiro de domínio genérico embutido no prompt de
regras. O documento foi enviado depois e **mudou pontos estruturais do plano**. As mudanças estão
detalhadas na seção 6 (Log de Decisões). A partir daqui, este documento reflete o `.docx` real.

---

## 1. Análise do Projeto (FASE 0) — revisada

### 1.1 Perfis de usuário (conforme o documento)

Quatro perfis. Os três primeiros usam o aplicativo (mobile first); o último usa uma área de
administração simples.

| Perfil | Quem é | O que faz |
|---|---|---|
| **Empresa (gestor)** | Dono/coordenador da empresa de home care | Cadastra a empresa, publica atendimentos, escolhe o cuidador, acompanha a escala, fecha as horas do período. |
| **Cuidador informal** | Pessoa sem formação técnica/superior | Cria perfil, envia documentos, informa disponibilidade e região, recebe convites, aceita plantões, registra o atendimento. |
| **Cuidador com formação** (técnico ou nível superior) | Técnico de enfermagem, enfermeiro, fisioterapeuta, fonoaudiólogo, nutricionista, terapeuta ocupacional | Mesmo fluxo do cuidador informal + cadastro do registro no conselho de classe e especialidades. |
| **Administrador** | Time da própria plataforma | Confere documentos, aprova/recusa cadastros, bloqueia em caso de problema, acompanha números de uso. |

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
confirmação, cancelamento, lembrete, falta de check-in) e a fila de aprovação de cadastros pelo
Administrador correm em paralelo a esse fluxo central.

### 1.4 Telas (lista oficial do documento, seção 7 — 17 telas do app + área de administração)

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
| — | Área de administração | Fila de aprovação, bloqueio, números básicos de uso (é para computador, uso interno). |

### 1.5 Regras de negócio (R1–R12, direto do documento — substituem as regras genéricas da Rev. 1)

| Nº | Regra |
|---|---|
| R1 | Cuidador com cadastro não aprovado não recebe convite e não aparece em nenhuma busca. |
| R2 | Atendimento que exige formação nunca é oferecido a cuidador informal. |
| R3 | Profissional técnico/superior só é considerado apto após conferência do registro no conselho de classe. |
| R4 | Um cuidador não pode aceitar dois atendimentos com horários que se sobrepõem. |
| R5 | O endereço completo do paciente só é liberado após a confirmação do cuidador escolhido. |
| R6 | O check-out só é permitido depois do check-in do mesmo atendimento. |
| R7 | Após o check-out, o registro do atendimento não pode ser editado. |
| R8 | Cancelamento com menos de 12h de antecedência fica marcado no histórico das duas partes. |
| R9 | A avaliação só pode ser feita depois do atendimento concluído. |
| R10 | A média de avaliação só aparece no perfil a partir da 3ª avaliação recebida. |
| R11 | Empresa com cadastro suspenso não publica novos atendimentos, mas mantém acesso ao histórico. |
| R12 | Todo cancelamento, bloqueio e alteração de cadastro fica registrado com data, hora e responsável. |

### 1.6 Dados mockados necessários (atualizado)

Empresa (CNPJ, nome, cidade, contato, status de aprovação), Cuidadores (nome, CPF, nascimento,
cidade/bairros, categoria informal/técnico/superior, registro no conselho quando aplicável,
documentos simulados, disponibilidade por dia/turno, valor pretendido, selo verificado, favoritos
da empresa), Atendimentos (tipo, endereço, data/horário, repetição, atividades exigidas, infos do
paciente, valor, status no ciclo de vida), Convites, Candidaturas, Agendamentos/Escala, Check-
ins/Check-outs, Registros de atendimento (tarefas, observações, fotos simuladas), Avaliações,
Conversas/Mensagens, Notificações, Fila de aprovação (Administrador).

### 1.7 Componentes reutilizáveis

Shell mobile-first por perfil (bottom nav / topbar), Card de Cuidador/Atendimento, Badge de status
e de categoria (informal/técnico/superior), Selo de verificado, Lista com busca e filtros, Stepper
de cadastro em etapas, Modal/Drawer, Calendário/Agenda, Chat vinculado a atendimento, Rating
(estrelas), Stepper de progresso do atendimento, Central de notificações.

### 1.8 Dependências entre funcionalidades

```
Dados mockados
  → Cadastro/Autenticação simulada (Empresa e Cuidador) → Aprovação (Admin)
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
  → Área de Administração / Persistência / Reset (transversal)
```

### 1.9 Elementos do Design System

Mobile first: textos grandes, poucos campos por tela, botões fáceis de tocar. Paleta própria
(tons de cuidado/confiança, evitando roxo/gradiente genérico de IA), tipografia legível em telas
pequenas, componentes com boa área de toque, badges de categoria de cuidador bem diferenciados
visualmente (informal/técnico/superior), grid responsivo. Como o entregável é um artifact web (ver
seção 2), a experiência mobile first será emulada com um layout otimizado para largura estreita
(estilo "moldura de celular" nas telas do app) e uma área de administração em formato desktop,
já que o próprio documento trata a administração como "uso interno, computador".

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
- Consulta automática ao conselho de classe (aprovação manual pelo Admin, simulada).
- Versão completa para computador (exceto a área de administração).
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

### 2.1 Stack

- Entregável final: **artifact React (JSX) single-file**, renderizado nativamente pelo Claude.ai.
- Estado: `useState`/`useReducer` + Context API; navegação por estado interno (sem URL routing).
- Bibliotecas do ambiente de artifact: React, `lucide-react`, `recharts` (relatório de horas /
  números de uso), `lodash` se necessário.
- Persistência: API `window.storage` (dados pessoais, não compartilhados), com reset restaurando
  o seed original.
- Estilo: Tailwind (classes core) seguindo o skill `frontend-design`, com um "frame" de celular
  para as telas do app (mobile first) e um layout desktop convencional para a área de
  administração.

### 2.2 Por que não usar o pipeline `web-artifacts-builder` (Vite + Parcel + shadcn)

Confirmado nesta sessão: `bash_tool` sem acesso de rede (`host_not_allowed` ao testar o registry
do npm). O pipeline do skill depende de `npm install`. Decisão mantida da Revisão 1: artifact
single-file, sem bundling local.

### 2.3 Modelo de dados (alto nível, atualizado)

`Empresa`, `Cuidador` (com `categoria`: informal | tecnico | superior, e campos condicionais de
registro profissional), `Atendimento` (com `atividadesExigidas`, infos do paciente embutidas,
status do ciclo de vida), `Convite`, `Candidatura`, `Agendamento`, `RegistroAtendimento`,
`Avaliacao`, `Conversa`/`Mensagem`, `Notificacao`, `FilaAprovacao` (Admin), `Favorito` (Empresa →
Cuidador).

---

## 3. Etapas

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

---

## Etapa 2 — Design System

### Objetivo
Identidade visual mobile first: cores, tipografia, componentes base, badges de categoria.

### Escopo
Paleta (light mode), escala tipográfica legível em tela pequena, botão/input/card/badge/modal,
badges diferenciados por categoria de cuidador e por status de atendimento, "frame" de celular
para as telas do app, layout desktop para a área de administração.

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

---

## Etapa 5 — Área de Administração: Aprovação de Cadastros

### Objetivo
Fila de aprovação de documentos, aprovar/recusar com motivo, bloqueio de empresa/cuidador.

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

---

## Etapa 18 — Área de Administração: Números de Uso

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
[x] Concluída
```

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
[x] Concluída
```

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
[x] Concluída
```

---

## 4. Resumo de Dependências (visão macro)

```
Etapa 1 (Análise)
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

**Total de etapas: 22** (Etapa 1 concluída — Revisão 2).

---

## 5. Escopo delimitado da demo (confirmação do gate)

- [x] `IMPLEMENTATION_PLAN.md` existe e reflete o `MVP_Home_Care.docx`.
- [x] Todas as 22 etapas documentadas (objetivo, escopo, fora do escopo, dependências, arquivos
      esperados, entregáveis, critérios de aceite, validação, status).
- [x] Dependências entre etapas explícitas (seção 4).
- [x] Critérios de aceite ligados às regras R1–R12 do documento real.
- [x] Escopo da demo delimitado (seções 1.10 e 1.11).
- [x] Ordem de implementação definida (Etapas 2 → 22).

**PLANEJAMENTO CONCLUÍDO (Revisão 2).**

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
