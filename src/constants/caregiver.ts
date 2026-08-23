import type { ApprovalStatus, CaregiverCategory, Shift, Weekday } from "../types";

export const CATEGORY_LABEL: Record<CaregiverCategory, string> = {
  informal: "Informal",
  tecnico: "Técnico",
  superior: "Superior",
};

/**
 * Trio de utilidades do `Cracha` de categoria (DESIGN_SYSTEM.md, seção 3). A escala vai de
 * sálvia (informal) a azul clínico (técnico) até o teal da marca (superior): quanto mais alta a
 * credencial, mais próxima da cor institucional.
 */
export const CATEGORY_CLASS: Record<CaregiverCategory, string> = {
  informal: "bg-cat-informal-soft text-cat-informal border-cat-informal/25",
  tecnico: "bg-cat-tecnico-soft text-cat-tecnico border-cat-tecnico/25",
  superior: "bg-cat-superior-soft text-cat-superior border-cat-superior/25",
};

export const CATEGORY_ORDER: CaregiverCategory[] = ["informal", "tecnico", "superior"];

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  blocked: "Bloqueado",
};

export const APPROVAL_STATUS_CLASS: Record<ApprovalStatus, string> = {
  pending: "bg-status-aberto-soft text-status-aberto border-status-aberto/25",
  approved: "bg-status-confirmado-soft text-status-confirmado border-status-confirmado/25",
  rejected: "bg-status-cancelado-soft text-status-cancelado border-status-cancelado/25",
  blocked: "bg-status-bloqueado-soft text-status-bloqueado border-status-bloqueado/30",
};

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: "Seg",
  tue: "Ter",
  wed: "Qua",
  thu: "Qui",
  fri: "Sex",
  sat: "Sáb",
  sun: "Dom",
};

export const WEEKDAY_ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const SHIFT_LABEL: Record<Shift, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  night: "Noite",
  shift12: "Plantão 12h",
  shift24: "Plantão 24h",
};

export const SHIFT_ORDER: Shift[] = ["morning", "afternoon", "night", "shift12", "shift24"];
