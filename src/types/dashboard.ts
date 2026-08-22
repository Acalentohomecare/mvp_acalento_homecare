/** Avisos curados do dashboard — não duplicam contagens deriváveis de outras coleções. */
export interface DashboardAlert {
  id: string;
  companyId: string;
  text: string;
  severity: "info" | "warning";
}
