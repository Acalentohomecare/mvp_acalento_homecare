/** Registro de auditoria: toda aprovação, recusa, bloqueio e cancelamento fica rastreado (R12). */
export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  detail: string;
  createdAt: string;
  /** Empresa dona da ação — cada empresa só enxerga o registro que é dela. */
  companyId?: string;
  /** Cuidador envolvido — a entrada também aparece para as empresas que o têm no quadro. */
  caregiverId?: string;
}
