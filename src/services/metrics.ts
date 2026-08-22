import type { AppState, ApprovalStatus } from "../types";

export interface PlatformMetrics {
  companies: Record<ApprovalStatus, number>;
  caregivers: Record<ApprovalStatus, number>;
  pendingApprovals: number;
  publishedAttendances: number;
  completedAttendances: number;
  cancelledAttendances: number;
  patients: number;
  evaluations: number;
}

const EMPTY: Record<ApprovalStatus, number> = { pending: 0, approved: 0, rejected: 0, blocked: 0 };

function countByStatus(items: { approvalStatus: ApprovalStatus }[]): Record<ApprovalStatus, number> {
  return items.reduce((acc, item) => ({ ...acc, [item.approvalStatus]: acc[item.approvalStatus] + 1 }), {
    ...EMPTY,
  });
}

/** Números básicos de uso da plataforma (Etapa 18) — todos derivados, nenhum contador mockado. */
export function platformMetrics(state: AppState): PlatformMetrics {
  const companies = countByStatus(state.companies);
  const caregivers = countByStatus(state.caregivers);

  return {
    companies,
    caregivers,
    pendingApprovals: companies.pending + caregivers.pending,
    publishedAttendances: state.attendances.filter((a) => a.status !== "draft").length,
    completedAttendances: state.attendances.filter(
      (a) => a.status === "completed" || a.status === "evaluated",
    ).length,
    cancelledAttendances: state.attendances.filter((a) => a.status === "cancelled").length,
    patients: state.patients.length,
    evaluations: state.evaluations.length,
  };
}
