import type { AuditLogEntry } from "../types";
import { isoDate, isoDateTime } from "../utils/date";

export const AUDIT_LOG: AuditLogEntry[] = [
  { id: "log1", action: "Cadastro aprovado", actor: "Admin", detail: "Sandra Oliveira aprovada.", createdAt: isoDate(-30) },
  { id: "log2", action: "Cadastro aprovado", actor: "Admin", detail: "Fernando Lima aprovado.", createdAt: isoDate(-60) },
  { id: "log3", action: "Cancelamento", actor: "Empresa", detail: "Atendimento at7 cancelado com 11h de antecedência (< 12h).", createdAt: isoDateTime(-15, "20:00") },
  { id: "log4", action: "Cuidador bloqueado", actor: "Admin", detail: "Ricardo Teixeira bloqueado após denúncia em análise.", createdAt: isoDate(-5) },
  { id: "log5", action: "Cadastro recusado", actor: "Admin", detail: "Camila Duarte recusada: documento de identidade ilegível.", createdAt: isoDate(-20) },
];
