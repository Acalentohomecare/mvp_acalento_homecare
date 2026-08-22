import type { DashboardAlert } from "../types";

/**
 * Avisos curados do dashboard. Números como "atendimentos hoje" ou "cuidadores ativos" NÃO
 * pertencem aqui — são calculados a partir de ATTENDANCES/CAREGIVERS por um serviço, para não
 * criar uma segunda fonte de verdade que possa ficar dessincronizada.
 */
export const DASHBOARD_ALERTS: DashboardAlert[] = [
  { id: "da1", companyId: "co1", text: "Revisão trimestral de contratos de cuidadores vence nesta semana.", severity: "info" },
  { id: "da2", companyId: "co1", text: "Paulo Ricci está com o registro no conselho pendente de conferência.", severity: "info" },
  { id: "da3", companyId: "co2", text: "Nenhum cuidador favoritado ainda — favorite para agilizar convites futuros.", severity: "info" },
];
