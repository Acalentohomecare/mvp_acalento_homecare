/** Registro de auditoria: toda aprovação, recusa, bloqueio e cancelamento fica rastreado. */
export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  detail: string;
  createdAt: string;
}
