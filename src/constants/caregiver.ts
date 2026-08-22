import type { ApprovalStatus, CaregiverCategory, Shift, Weekday } from "../types";

export const CATEGORY_LABEL: Record<CaregiverCategory, string> = {
  informal: "Informal",
  tecnico: "Técnico",
  superior: "Superior",
};

/** Utilidade Tailwind de background para o `Cracha` de categoria (DESIGN_SYSTEM.md, seção 1). */
export const CATEGORY_CLASS: Record<CaregiverCategory, string> = {
  informal: "bg-cat-informal",
  tecnico: "bg-cat-tecnico",
  superior: "bg-cat-superior",
};

export const CATEGORY_ORDER: CaregiverCategory[] = ["informal", "tecnico", "superior"];

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  blocked: "Bloqueado",
};

export const APPROVAL_STATUS_CLASS: Record<ApprovalStatus, string> = {
  pending: "bg-status-aberto",
  approved: "bg-status-concluido",
  rejected: "bg-status-cancelado",
  blocked: "bg-status-bloqueado",
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
