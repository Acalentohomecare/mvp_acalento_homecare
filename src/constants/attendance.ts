import type { AttendanceStatus, AttendanceType } from "../types";

export const ATTENDANCE_TYPE_LABEL: Record<AttendanceType, string> = {
  shift12: "Plantão 12h",
  shift24: "Plantão 24h",
  hourly: "Período de horas",
  single_session: "Sessão avulsa",
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
 * Trio de utilidades do `Cracha` por status (docs/DESIGN_SYSTEM.md, seção 3): fundo `-soft`,
 * texto na cor base, borda na cor base a 25%. Semáforo do produto — âmbar para o que espera
 * alguém agir, verde para o combinado de pé, petróleo vivo para o que acontece agora, ardósia
 * para o que já é histórico e vermelho para o que caiu.
 */
export const ATTENDANCE_STATUS_CLASS: Record<AttendanceStatus, string> = {
  draft: "bg-status-rascunho-soft text-status-rascunho border-status-rascunho/25",
  open: "bg-status-aberto-soft text-status-aberto border-status-aberto/25",
  invited: "bg-status-aberto-soft text-status-aberto border-status-aberto/25",
  applications_received: "bg-status-aberto-soft text-status-aberto border-status-aberto/25",
  confirmed: "bg-status-confirmado-soft text-status-confirmado border-status-confirmado/25",
  in_progress: "bg-status-andamento-soft text-status-andamento border-status-andamento/25",
  completed: "bg-status-concluido-soft text-status-concluido border-status-concluido/25",
  evaluated: "bg-status-concluido-soft text-status-concluido border-status-concluido/25",
  cancelled: "bg-status-cancelado-soft text-status-cancelado border-status-cancelado/25",
};
