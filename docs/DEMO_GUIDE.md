# DEMO_GUIDE.md — MVP Acalento Home Care

> Etapas 21 e 22 do `IMPLEMENTATION_PLAN.md`. Guia para quem for apresentar a demo comercialmente,
> mais o checklist de validação das regras de negócio.

---

## 1. Como abrir a demo

```bash
npm install
npm start
```

A aplicação abre na tela de **Entrada**, com dois atalhos de conta:

- **Empresa** (`empresa@demo.com`) → Home Care Vida Plena, o perfil que conduz a apresentação.
- **Cuidador** (`cuidador@demo.com`) → Sandra Oliveira (informal). Também dá para entrar como
  Beatriz, Marcos (fisioterapeuta), Juliana (técnica de enfermagem), Fernando ou Débora.

**Não existe perfil de administrador.** Quem confere documentos e aprova o cuidador que vai
assumir o plantão é a própria empresa, em **Cuidadores → Em análise**. Esse é o ponto de controle
da empresa sobre os seus plantões.

Todos os dados são fictícios e voltam ao estado inicial pelo reset (**Configurações → Restaurar
dados da demonstração**).

---

## 2. Roteiro recomendado (baseado no exemplo "Sandra / dona Marli" do `MVP_Home_Care.docx`)

Este roteiro segue de perto o exemplo de uso descrito no documento de produto (seção 8), para que
a demo conte a mesma história que convenceu o time a validar o MVP.

1. **Entre como Empresa.** Mostre o Início: atendimentos de hoje, em aberto e pendências já
   populados — não é uma tela vazia no primeiro carregamento. Repare que uma das pendências é
   "cuidadores aguardando sua aprovação": o quadro é responsabilidade da empresa.
2. **Toque em "Novo atendimento".** Publique um plantão de 12h no bairro Centro, marcando só
   atividades informais (higiene, alimentação, apoio para locomoção). Destaque: leva menos de um
   minuto e o sistema já calcula sozinho que isso pode ser feito por um cuidador informal.
3. Na tela seguinte (**Cuidadores compatíveis**), mostre a lista já filtrada — nenhum cuidador
   técnico/superior aparece, porque não é necessário. Convide 1–2 cuidadoras.
4. **Troque para o perfil de Sandra (cuidadora).** Mostre o convite recebido no Início dela, com
   bairro, horário e as informações do paciente. Aceite o convite.
5. **Volte para o perfil da Empresa.** Em "Pendências", abra as candidaturas recebidas e confirme
   a Sandra. Destaque: as demais candidatas são avisadas automaticamente, e o endereço completo
   só aparece agora para a Sandra (R5).
6. **Repita rapidamente para um atendimento que exige formação** — use o atendimento de
   fisioterapia já existente no dataset (`at2`) e mostre que só o Marcos (fisioterapeuta) aparece
   como compatível; nenhum cuidador informal consegue nem se candidatar (R2).
7. **Ponto forte de roteiro:** abra o atendimento `at3` (visita de enfermagem + medicação
   prescrita) em Cuidadores compatíveis — a lista aparece **vazia**, porque o único enfermeiro
   cadastrado (Paulo Ricci) ainda não foi aprovado no quadro desta empresa. Isso é intencional:
   mostra R1 e R3 funcionando juntos.
8. **Vá para Cuidadores → Em análise.** Abra o perfil do Paulo, confira os dados e clique em
   **"Aprovar para o quadro"**. Volte ao `at3` — agora ele aparece e pode ser convidado. Esta é a
   mensagem central: **a empresa decide quem entra no seu quadro e, portanto, quem pode assumir
   os seus plantões.**
9. **Troque para o perfil de um cuidador com atendimento confirmado para hoje** (ou avance a data
   do `at1`, já confirmado com a Sandra). Faça o check-in, marque tarefas no registro do
   atendimento, adicione uma observação e faça o check-out. Mostre que o registro trava depois do
   check-out (R7) e que uma nova observação ainda pode ser adicionada.
10. **Como Empresa, avalie o cuidador** no atendimento concluído. Mostre um cuidador com menos de
    3 avaliações (ex.: Beatriz) para demonstrar que a média ainda não aparece (R10), e um com 3+
    (ex.: Sandra) para mostrar a média já calculada.
11. **Abra o Relatório de horas.** Mostre os números fechados a partir dos check-ins/check-outs já
    no dataset e exporte o CSV.
12. **Feche em Configurações**, mostrando o registro de atividade da empresa (toda aprovação,
    recusa, bloqueio e cancelamento ficam rastreados — R12) e o botão de reset da demo.

Tempo estimado do roteiro completo: 8–10 minutos.

---

## 3. Checklist de validação — regras R1–R12

| Regra | Como é aplicada no código |
|---|---|
| R1 | O quadro é por empresa (`services/roster.ts`): `rosterCaregivers` só devolve quem a empresa aprovou, `compatibleCaregivers` parte dessa lista, `sendInvitation`/`applyToOpenAttendance` recusam quem está fora dela, e `ProtectedRoute` manda para "Cadastro em análise" o cuidador que nenhuma empresa aprovou ainda. |
| R2 | `attendanceRequiredCategory` calcula a categoria mínima a partir das atividades marcadas; `compatibleCaregivers` descarta quem tem categoria abaixo da exigida (`at2`/`at3` testados). |
| R3 | Cuidadores técnico/superior só passam no filtro com `councilRegistrationStatus === "approved"`; Paulo Ricci, com registro em análise, fica de fora até a empresa aprovar. Alterar o registro no perfil devolve o status para conferência. |
| R4 | `conflictingAttendance` compara as janelas de horário dos atendimentos já assumidos pelo cuidador antes de aceitar convite/candidatura. |
| R5 | `canSeeFullAddress` só libera rua/número para o cuidador confirmado; os demais veem apenas o bairro. |
| R6 | O botão de check-out fica desabilitado enquanto não houver `checkinAt`. |
| R7 | Depois do `checkoutAt` o registro é tratado como encerrado: tarefas travam, observações ainda podem ser adicionadas. |
| R8 | O cancelamento calcula `noticeHours`; abaixo de `SHORT_NOTICE_HOURS` (12h) isso fica explícito no histórico e na auditoria (ver `at7`, cancelado com 11h de antecedência). |
| R9 | A avaliação só fica disponível quando o atendimento está `completed` ou `evaluated`. |
| R10 | `caregiverRating` devolve `average: null` com menos de 3 avaliações; Beatriz foi deixada de propósito com poucas avaliações no seed. |
| R11 | **Removida.** Era a suspensão da empresa por um administrador de plataforma — papel que a demo não tem. A empresa entra sempre operante. |
| R12 | Toda aprovação, recusa, bloqueio e cancelamento grava uma entrada em `auditLog` com data, hora e responsável, visível em **Configurações → Registro de atividade** (cada empresa vê só o que é dela e o que envolve o próprio quadro). |

---

## 4. Simplificações assumidas nesta demo (transparência)

- Upload de documento/selfie no cadastro é **simulado** (não há upload real de arquivo).
- Fotos anexadas ao registro do atendimento são um **contador simulado**, não upload real.
- Localização do check-in é um texto simulado, não geolocalização real.
- Funcionamento offline do check-in (mencionado no documento para o produto real) **não foi
  implementado** — fica documentado aqui como comportamento esperado do produto real, fora do
  escopo da demo.
- Consulta automática ao conselho de classe não existe: a conferência do registro é feita pela
  empresa, junto com a aprovação do cadastro.
- Cadastro de nova Empresa pela tela de Cadastro é simulado com uma mensagem — o fluxo completo
  passo a passo foi implementado apenas para o perfil Cuidador (é o mais usado na demo).
- As métricas de sucesso do MVP (seção 12 do `MVP_Home_Care.docx`: tempo até confirmar cuidador,
  % de atendimentos preenchidos etc.) não viraram tela. Se for útil para a conversa comercial, dá
  para calcular esses números em cima do dataset da demo sob demanda.

---

## 5. Reset entre apresentações

Antes de cada demonstração, entre como Empresa e acesse **Configurações → Restaurar dados da
demonstração**. Isso apaga qualquer estado alterado durante uma apresentação anterior e recarrega
os dados descritos neste guia (Sandra com convite aceito, Paulo ainda em análise no quadro, etc.).
