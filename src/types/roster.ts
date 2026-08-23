import type { ApprovalStatus } from "./enums";

/**
 * Vínculo entre uma empresa e um cuidador — o "quadro" da empresa.
 *
 * É a empresa que confere os documentos e decide quem pode assumir seus plantões; não existe
 * administrador de plataforma. A ausência de vínculo equivale a `pending`: o cuidador está na
 * fila de conferência daquela empresa e ainda não pode ser convidado por ela.
 */
export interface CaregiverLink {
  id: string;
  companyId: string;
  caregiverId: string;
  status: ApprovalStatus;
  /** Motivo da recusa ou do bloqueio — é o texto que o cuidador vê. */
  reason?: string;
  decidedAt: string;
}
