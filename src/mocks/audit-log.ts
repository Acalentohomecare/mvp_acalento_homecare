import type { AuditLogEntry } from "../types";
import { isoDate, isoDateTime } from "../utils/date";

/** R12: quem decidiu é sempre uma empresa — a demo não tem administrador de plataforma. */
const VIDA_PLENA = "Home Care Vida Plena";

export const AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "log1",
    action: "Cadastro aprovado",
    actor: VIDA_PLENA,
    detail: "Sandra Oliveira entrou no quadro da Home Care Vida Plena.",
    createdAt: isoDate(-30),
    companyId: "co1",
    caregiverId: "cg1",
  },
  {
    id: "log2",
    action: "Cadastro aprovado",
    actor: VIDA_PLENA,
    detail: "Fernando Lima entrou no quadro da Home Care Vida Plena.",
    createdAt: isoDate(-60),
    companyId: "co1",
    caregiverId: "cg8",
  },
  {
    id: "log3",
    action: "Cancelamento",
    actor: VIDA_PLENA,
    detail: "Atendimento at7 cancelado com 11h de antecedência (< 12h).",
    createdAt: isoDateTime(-15, "20:00"),
    companyId: "co1",
  },
  {
    id: "log4",
    action: "Cuidador bloqueado",
    actor: VIDA_PLENA,
    detail: "Ricardo Teixeira bloqueado após denúncia em análise.",
    createdAt: isoDate(-5),
    companyId: "co1",
    caregiverId: "cg10",
  },
  {
    id: "log5",
    action: "Cadastro recusado",
    actor: VIDA_PLENA,
    detail: "Camila Duarte recusada: documento de identidade ilegível.",
    createdAt: isoDate(-20),
    companyId: "co1",
    caregiverId: "cg7",
  },
];
