import type { AttendanceStatus, AttendanceType } from "../types";

export const ATTENDANCE_TYPE_LABEL: Record<AttendanceType, string> = {
  shift12: "Plantão 12h",
  shift24: "Plantão 24h",
  hourly: "Período de horas",
  single_session: "Sessão avulsa",
};

/** Forma curta para a linha de registro, onde a coluna é estreita e a palavra se repete. */
export const ATTENDANCE_TYPE_SHORT: Record<AttendanceType, string> = {
  shift12: "Plantão 12h",
  shift24: "Plantão 24h",
  hourly: "Período",
  single_session: "Avulsa",
};

export const ATTENDANCE_TYPE_ORDER: AttendanceType[] = [
  "shift12",
  "shift24",
  "hourly",
  "single_session",
];

/** Duração sugerida ao escolher o tipo. Plantões têm duração fixa; os demais ficam editáveis. */
export const ATTENDANCE_TYPE_DURATION: Record<AttendanceType, number> = {
  shift12: 12,
  shift24: 24,
  hourly: 4,
  single_session: 1,
};

export const ATTENDANCE_TYPE_FIXED_DURATION: Record<AttendanceType, boolean> = {
  shift12: true,
  shift24: true,
  hourly: false,
  single_session: false,
};

/**
 * O estado do atendimento, **em uma palavra**, e essa palavra é a mesma em toda parte.
 *
 * Existiam dois mapas — um longo para a ficha e o leitor de tela, um curto para a coluna da linha
 * — e eles divergiam em dois estados: `invited` saía "Convite enviado" na ficha e "Convidado" na
 * lista, `applications_received` saía "Candidaturas recebidas" e "Candidaturas". Duas palavras
 * para o mesmo estado é o que faz alguém perguntar se são estados diferentes.
 *
 * A régua da palavra escolhida é dupla, e as duas valem ao mesmo tempo:
 *
 * 1. **É um estado, nunca uma contagem nem um objeto.** "Candidaturas" era um substantivo de
 *    coisa ocupando o lugar reservado à situação do registro — na mesma coluna onde as vizinhas
 *    diziam "Em busca" e "Confirmado". Quantas candidaturas chegaram é informação complementar
 *    (nível 4 da seção 9.0) e mora ao pé da linha, não na coluna de estado.
 *
 * 2. **Cabe na coluna, em 320px.** A coluna de estado é a última da linha densa, e cada pixel que
 *    ela toma sai do nome do paciente. "Aguardando confirmação" mede ~152px a 13px e comeria
 *    metade da largura útil de um telefone; "Em confirmação" mede ~97px e entra na família dos
 *    "Em ___" que o ciclo já usa (Em busca → Em confirmação → Em andamento). O que a espera tem
 *    de específico — *quem* está sendo esperado — é o trabalho da **situação operacional**, logo
 *    abaixo, onde a linha é inteira e a frase pode ser completa.
 */
export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  draft: "Rascunho",
  open: "Em busca",
  invited: "Convidado",
  applications_received: "Em confirmação",
  confirmed: "Confirmado",
  in_progress: "Em andamento",
  completed: "Concluído",
  evaluated: "Avaliado",
  cancelled: "Cancelado",
};

/**
 * A **situação operacional** — o terceiro nível da linha de registro (seção 9.0 do design system).
 *
 * O estado diz **em que ponto do ciclo** o registro está; a situação diz **de quem a operação
 * está esperando**. São perguntas diferentes, e é essa a regra que mantém as duas camadas sem se
 * repetir — a segunda sempre nomeia a parte que precisa agir:
 *
 *     ● Em busca          →  Aguardando cuidador            ninguém se apresentou ainda
 *     ● Convidado         →  Aguardando resposta do cuidador a bola está com quem foi convidado
 *     ● Em confirmação    →  Aguardando sua confirmação      a bola está com a coordenadora
 *
 * O "sua" da terceira é deliberado e não vaza: `applications_received` só chega a uma linha de
 * registro nas telas da empresa — as do cuidador filtram por `confirmedCaregiverId`, e um plantão
 * com candidaturas ainda não tem cuidador confirmado. É a mesma voz que o Início do cuidador já
 * usa ("convites aguardando sua resposta").
 *
 * Só os três estados que **esperam alguém** têm situação. Confirmado em diante, quem ocupa essa
 * linha é o nome do cuidador — a espera acabou e a pergunta passou a ser *com quem*. Em rascunho
 * e em cancelado não há espera nenhuma, e a linha volta a ser um travessão: âmbar ali prometia
 * trabalho que não existe.
 *
 * A contagem de candidaturas não entra aqui. Ela é informação complementar (camada 4) e já viaja
 * no rótulo da ação — "Candidaturas (2)". Repeti-la na situação faria a mesma palavra aparecer
 * três vezes no mesmo registro.
 *
 * O conjunto de chaves é exatamente o `OPEN_STATUSES` de `services/attendances`, e a coincidência
 * não é acidental — é a mesma regra de negócio ("publicado e ainda sem cuidador") escrita uma vez
 * em cada camada: lá para filtrar, aqui para nomear.
 */
export const ATTENDANCE_SITUATION: Partial<Record<AttendanceStatus, string>> = {
  open: "Aguardando cuidador",
  invited: "Aguardando resposta do cuidador",
  applications_received: "Aguardando sua confirmação",
};

/**
 * A **forma** do marcador de estado (docs/DESIGN_SYSTEM.md, seção 3.1).
 *
 * Nove status, cinco formas. O agrupamento não é estético: é o ciclo de vida do atendimento
 * lido de longe, e é o que permite varrer uma coluna de trinta plantões sem ler rótulo nenhum.
 *
 * - `aguarda`  anel vazado — falta alguém decidir. O vazio é literal: o plantão não tem dono.
 * - `firmado`  ponto cheio — combinado de pé.
 * - `agora`    ponto cheio com halo — está acontecendo neste momento.
 * - `fechado`  quadrado cheio — encerrado, virou histórico. Quadrado porque parou.
 * - `caiu`     quadrado vazado — cancelado. A forma do fechado, sem o preenchimento.
 *
 * A forma é a portadora primária; cor e rótulo em texto vêm junto. É a regra 3 do design system
 * resolvida na estrutura e não num `aria-label`.
 */
export type StatusShape = "aguarda" | "firmado" | "agora" | "fechado" | "caiu";

export const ATTENDANCE_STATUS_SHAPE: Record<AttendanceStatus, StatusShape> = {
  draft: "aguarda",
  open: "aguarda",
  invited: "aguarda",
  applications_received: "aguarda",
  confirmed: "firmado",
  in_progress: "agora",
  completed: "fechado",
  evaluated: "fechado",
  cancelled: "caiu",
};

/**
 * A **tinta** do estado — só a cor do texto e do marcador, sem fundo.
 *
 * Mudou de trio para valor único porque o estado do atendimento deixou de ser uma pastilha. Onde
 * ele precisa de fundo (o cabeçalho da ficha), o `StatusAtendimento` monta o par base/`-soft`
 * sozinho a partir daqui, e o par continua fechando em 4,5:1 como a seção 3 exige.
 */
export const ATTENDANCE_STATUS_TINT: Record<AttendanceStatus, string> = {
  draft: "text-status-rascunho",
  open: "text-status-aberto",
  invited: "text-status-aberto",
  applications_received: "text-status-aberto",
  confirmed: "text-status-confirmado",
  in_progress: "text-status-andamento",
  completed: "text-status-concluido",
  evaluated: "text-status-concluido",
  cancelled: "text-status-cancelado",
};

/** Fundo e borda do crachá quadrado — só para a ficha, onde o estado é a manchete. */
export const ATTENDANCE_STATUS_BLOCK: Record<AttendanceStatus, string> = {
  draft: "bg-status-rascunho-soft border-status-rascunho/30",
  open: "bg-status-aberto-soft border-status-aberto/30",
  invited: "bg-status-aberto-soft border-status-aberto/30",
  applications_received: "bg-status-aberto-soft border-status-aberto/30",
  confirmed: "bg-status-confirmado-soft border-status-confirmado/30",
  in_progress: "bg-status-andamento-soft border-status-andamento/30",
  completed: "bg-status-concluido-soft border-status-concluido/30",
  evaluated: "bg-status-concluido-soft border-status-concluido/30",
  cancelled: "bg-status-cancelado-soft border-status-cancelado/30",
};

/**
 * As sete etapas do ciclo, para a régua de progresso da ficha. `cancelled` e `draft` não entram:
 * um não avançou e o outro saiu do trilho — os dois são tratados à parte pela própria ficha.
 */
export const ATTENDANCE_STEPS = [
  "Publicado",
  "Cuidador",
  "Confirmado",
  "Check-in",
  "Check-out",
  "Avaliado",
] as const;

export function attendanceStepIndex(status: AttendanceStatus): number {
  switch (status) {
    case "draft":
    case "open":
      return 0;
    case "invited":
    case "applications_received":
      return 1;
    case "confirmed":
      return 2;
    case "in_progress":
      return 3;
    case "completed":
      return 4;
    case "evaluated":
      return 5;
    default:
      return 0;
  }
}
