import type { CaregiverLink } from "../types";
import { isoDate } from "../utils/date";

/**
 * Quadro de cada empresa (CLAUDE.md §9). Quem confere documentos e libera o cuidador para os
 * plantões é a empresa — não existe administrador de plataforma.
 *
 * Cuidadores sem vínculo aqui (cg3 Renata e cg6 Paulo) aparecem em "Em análise" nas duas
 * empresas: é o cadastro que a demonstração aprova ao vivo.
 */
export const CAREGIVER_LINKS: CaregiverLink[] = [
  // Home Care Vida Plena (co1) — empresa usada na apresentação.
  { id: "lk1", companyId: "co1", caregiverId: "cg1", status: "approved", decidedAt: isoDate(-30) },
  { id: "lk2", companyId: "co1", caregiverId: "cg2", status: "approved", decidedAt: isoDate(-25) },
  { id: "lk3", companyId: "co1", caregiverId: "cg4", status: "approved", decidedAt: isoDate(-40) },
  { id: "lk4", companyId: "co1", caregiverId: "cg5", status: "approved", decidedAt: isoDate(-45) },
  { id: "lk5", companyId: "co1", caregiverId: "cg8", status: "approved", decidedAt: isoDate(-60) },
  { id: "lk6", companyId: "co1", caregiverId: "cg9", status: "approved", decidedAt: isoDate(-18) },
  {
    id: "lk7",
    companyId: "co1",
    caregiverId: "cg7",
    status: "rejected",
    reason: "Documento de identidade ilegível — favor reenviar.",
    decidedAt: isoDate(-20),
  },
  {
    id: "lk8",
    companyId: "co1",
    caregiverId: "cg10",
    status: "blocked",
    reason: "Bloqueado após denúncia em análise.",
    decidedAt: isoDate(-5),
  },

  // Cuidar Bem (co2) — quadro menor, mostra que o mesmo cuidador pode servir a duas empresas.
  { id: "lk9", companyId: "co2", caregiverId: "cg1", status: "approved", decidedAt: isoDate(-22) },
  { id: "lk10", companyId: "co2", caregiverId: "cg2", status: "approved", decidedAt: isoDate(-15) },
  { id: "lk11", companyId: "co2", caregiverId: "cg5", status: "approved", decidedAt: isoDate(-15) },
  { id: "lk12", companyId: "co2", caregiverId: "cg8", status: "approved", decidedAt: isoDate(-35) },
];
