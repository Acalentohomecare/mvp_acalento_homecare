# DEMO_GUIDE.md — MVP Acalento Home Care

> Etapas 21 e 22 do `IMPLEMENTATION_PLAN.md`. Guia para quem for apresentar a demo comercialmente,
> mais o checklist de validação usado nesta etapa.

---

## 1. Como abrir a demo

O artifact `app_acalento_homecare.jsx` abre na tela de **Entrada**. A partir dali:

- **Entrar como Empresa** → Home Care Vida Plena (perfil de coordenação).
- **Entrar como Cuidador** → escolha entre Sandra (informal), Beatriz (informal), Marcos
  (superior/fisioterapeuta) ou Juliana (técnico/enfermagem).
- **Entrar como Administrador** → área de administração (layout desktop).

Todos os dados são fictícios e recriados a cada reset (área de administração → Números de uso →
Resetar demo).

---

## 2. Roteiro recomendado (baseado no exemplo "Sandra / dona Marli" do `MVP_Home_Care.docx`)

Este roteiro segue de perto o exemplo de uso descrito no documento de produto (seção 8), para que
a demo conte a mesma história que already convenceu o time a validar o MVP.

1. **Entre como Empresa.** Mostre o Início: atendimentos de hoje, em aberto e pendências já
   populados — não é uma tela vazia no primeiro carregamento.
2. **Toque em "Novo atendimento".** Publique um plantão de 12h no bairro Centro, marcando só
   atividades informais (higiene, alimentação, apoio para locomoção). Destaque: leva menos de um
   minuto e o sistema já calcula sozinho que isso pode ser feito por um cuidador informal.
3. Na tela seguinte (**Busca de cuidadores**), mostre a lista já filtrada — nenhum cuidador
   técnico/superior aparece, porque não é necessário. Convide 1–2 cuidadoras.
4. **Troque para o perfil de Sandra (cuidadora).** Mostre o convite recebido no Início dela, com
   bairro, horário e as informações do paciente. Aceite o convite.
5. **Volte para o perfil da Empresa.** Em "Pendências", abra as candidaturas recebidas e confirme
   a Sandra. Destaque: as demais candidatas seriam avisadas automaticamente, e o endereço completo
   só aparece agora para a Sandra (R5).
6. **Repita rapidamente para um atendimento que exige formação** — use o atendimento de fisioterapia
   já existente no dataset (a2) e mostre que só o Marcos (fisioterapeuta) aparece como compatível
   — nenhum cuidador informal consegue nem se candidatar (R2).
7. **Ponto forte de roteiro:** abra o atendimento a3 (visita de enfermagem) na Busca de cuidadores
   — a lista aparece **vazia**, porque o único enfermeiro cadastrado (Paulo) ainda está com o
   cadastro em análise. Isso é intencional: mostra R1 e R3 funcionando juntos.
8. **Vá para a área de Administração → Fila de aprovação.** Aprove o Paulo. Volte para a Busca de
   cuidadores do atendimento a3 — agora ele aparece.
9. **Troque para o perfil de um cuidador com atendimento confirmado para hoje** (ou avance a data
   do atendimento a1, já confirmado com a Sandra). Faça o check-in, marque tarefas no registro do
   atendimento, adicione uma observação, e faça o check-out. Mostre que o registro trava depois do
   check-out (R7) e que uma nova observação ainda pode ser adicionada.
10. **Como Empresa, avalie o cuidador** no atendimento concluído. Mostre um cuidador com menos de
    3 avaliações (ex.: Beatriz) para demonstrar que a média ainda não aparece (R10), e um com 3+
    (ex.: Sandra) para mostrar a média já calculada.
11. **Abra o Relatório de Horas.** Mostre os números fechados a partir dos check-ins/check-outs já
    no dataset, e clique em "Exportar planilha" (simulado nesta demo).
12. **Feche com a área de Administração → Números de uso**, mostrando cadastros por status,
    atendimentos publicados e concluídos, e o botão de reset da demo.

Tempo estimado do roteiro completo: 8–10 minutos.

---

## 3. Checklist de validação (Etapa 21) — regras R1–R12

| Regra | Como foi validada nesta revisão de código |
|---|---|
| R1 | `cuidadoresCompativeis` filtra por `statusCadastro === 'aprovado'`; cuidador em análise (Renata, Paulo) não aparece em nenhuma busca; tela "Aguardando aprovação" bloqueia o acesso do próprio cuidador não aprovado. |
| R2 | `categoriaExigida` calcula a categoria mínima a partir das atividades marcadas; `cuidadoresCompativeis` descarta quem tem categoria abaixo da exigida (atendimento a2/a3 testados). |
| R3 | Cuidadores técnico/superior só passam no filtro se `registroStatus === 'aprovado'` (Paulo, com registro em análise, é bloqueado até aprovação do Admin). |
| R4 | `temSobreposicao` compara janelas de horário de atendimentos confirmados do mesmo cuidador antes de aceitar convite/candidatura ou confirmar candidatura. |
| R5 | `DetalheAtendimento` só mostra rua/número quando `viewer==='empresa'` ou o cuidador logado é o `cuidadorConfirmadoId`; caso contrário mostra só o bairro. |
| R6 | Botão de check-out fica desabilitado (`disabled`) enquanto não houver `checkinHorario`. |
| R7 | Após `checkoutHorario` ser definido, `registro.fechado=true`; tarefas ficam bloqueadas para edição; observações continuam podendo ser adicionadas. |
| R8 | Cancelamento calcula `antecedenciaHoras`; se menor que 12h, o toast e o registro de log deixam isso explícito (ver também `a7` no dataset, já cancelado com 11h de antecedência). |
| R9 | Botão/tela de avaliação só fica disponível quando `status` é `concluido` ou `avaliado`. |
| R10 | `notaMediaCuidador` retorna `null` (sem média) com menos de 3 avaliações; Beatriz (c2) foi deixada de propósito com 1 avaliação no seed para mostrar esse caso. |
| R11 | Início da Empresa desabilita "Novo atendimento" quando `empresa.status !== 'aprovado'`; Admin → Empresas tem um botão para suspender/reativar e testar isso ao vivo. |
| R12 | Toda aprovação/recusa/bloqueio/cancelamento grava uma entrada em `log`, visível em Admin → Empresas → Registro de atividade. |

**Nota sobre o método de validação:** este ambiente de desenvolvimento não tem um navegador
disponível para executar o React de verdade (sem acesso à internet para instalar um bundler local —
ver `IMPLEMENTATION_PLAN.md`, seção 2.2). A validação acima foi feita por **revisão cuidadosa do
código e checagem de balanceamento sintático**, não por cliques reais em um navegador. Recomendo
que, ao abrir o artifact na conversa, você mesmo percorra o roteiro da seção 2 pelo menos uma vez
antes de apresentar para um cliente — se algo não se comportar como descrito aqui, me avise que eu
ajusto.

---

## 4. Simplificações assumidas nesta demo (transparência)

- Upload de documento/selfie no cadastro é **simulado** (não há upload real de arquivo).
- Fotos anexadas ao registro do atendimento são um **contador simulado**, não upload real.
- Localização do check-in é um texto simulado (ex.: "Centro (simulado)"), não geolocalização real.
- Funcionamento offline do check-in (mencionado no documento para o produto real) **não foi
  implementado** — fica documentado aqui como comportamento esperado do produto real, fora do
  escopo da demo.
- Exportação do relatório de horas mostra uma confirmação simulada, sem gerar um arquivo de
  planilha de verdade.
- Cadastro de nova Empresa pela tela de Cadastro é simulado com uma mensagem — o fluxo completo de
  cadastro passo a passo foi implementado apenas para o perfil Cuidador (é o mais usado na demo).
- As métricas de sucesso do MVP (seção 12 do `MVP_Home_Care.docx`: tempo até confirmar cuidador,
  % de atendimentos preenchidos etc.) não viraram uma tela — não fazem parte da área de
  administração descrita no documento. Se for útil para a conversa comercial, dá para calcular
  esses números em cima do dataset da demo sob demanda.
- Layout é otimizado para o frame de celular (320px) e para o painel administrativo em um
  container fixo — não foi testado em breakpoints arbitrários de navegador (ver
  `IMPLEMENTATION_PLAN.md`, Etapa 20).

---

## 5. Reset entre apresentações

Antes de cada demonstração, acesse **Administrador → Números de uso → Resetar demo**. Isso apaga
qualquer estado alterado durante uma apresentação anterior e recarrega os dados descritos neste
guia (Sandra com convite aceito no atendimento de fisioterapia, Paulo pendente de aprovação, etc.).
