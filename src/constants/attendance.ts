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

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  draft: "Rascunho",
  open: "Em busca",
  invited: "Convite enviado",
  applications_received: "Candidaturas recebidas",
  confirmed: "Confirmado",
  in_progress: "Em andamento",
  completed: "Concluído",
  evaluated: "Avaliado",
  cancelled: "Cancelado",
};

/**
 * O mesmo estado, em uma palavra, para a **coluna** da linha de registro.
 *
 * Não é economia de espaço por gosto: a coluna de estado é a última da linha, e "Candidaturas
 * recebidas" (145px a 13px) comia metade da largura que sobra para o nome do paciente num
 * telefone de 320px. Nome do paciente é a informação principal da linha; estado é a
 * complementar, e a complementar não empurra a principal.
 *
 * A forma longa continua onde há espaço e onde o estado é a manchete: o crachá quadrado da ficha.
 */
export const ATTENDANCE_STATUS_SHORT: Record<AttendanceStatus, string> = {
  draft: "Rascunho",
  open: "Em busca",
  invited: "Convidado",
  applications_received: "Candidaturas",
  confirmed: "Confirmado",
  in_progress: "Em andamento",
  completed: "Concluído",
  evaluated: "Avaliado",
  cancelled: "Cancelado",
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
