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

export const ATTENDANCE_STATUS_CLASS: Record<AttendanceStatus, string> = {
  draft: "bg-ink/70",
  open: "bg-status-aberto",
  invited: "bg-status-aberto",
  applications_received: "bg-status-aberto",
  confirmed: "bg-status-confirmado",
  in_progress: "bg-status-andamento",
  completed: "bg-status-concluido",
  evaluated: "bg-status-concluido",
  cancelled: "bg-status-cancelado",
};
