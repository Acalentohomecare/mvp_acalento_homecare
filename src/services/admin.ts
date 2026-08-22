import type { AppState } from "../types";

function withLog(state: AppState, action: string, detail: string): AppState {
  return {
    ...state,
    auditLog: [
      ...state.auditLog,
      { id: `log_${Date.now()}`, action, actor: "Admin", detail, createdAt: new Date().toISOString() },
    ],
  };
}

function withCaregiverNotification(state: AppState, caregiverId: string, text: string): AppState {
  return {
    ...state,
    notifications: [
      ...state.notifications,
      {
        id: `no_${Date.now()}`,
        toRole: "caregiver",
        toId: caregiverId,
        type: "approval",
        text,
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

/** Aprova o cadastro (R1) e, se houver registro no conselho, dá a conferência por feita (R3). */
export function approveCaregiver(state: AppState, caregiverId: string): AppState {
  const caregiver = state.caregivers.find((c) => c.id === caregiverId);
  if (!caregiver) return state;

  const next: AppState = {
    ...state,
    caregivers: state.caregivers.map((c) =>
      c.id === caregiverId
        ? {
            ...c,
            approvalStatus: "approved",
            rejectionReason: undefined,
            verified: true,
            councilRegistrationStatus: c.councilRegistration ? "approved" : c.councilRegistrationStatus,
          }
        : c,
    ),
  };

  return withCaregiverNotification(
    withLog(next, "Cadastro aprovado", `${caregiver.name} aprovado(a).`),
    caregiverId,
    "Seu cadastro foi aprovado! Você já pode receber convites.",
  );
}

export function rejectCaregiver(state: AppState, caregiverId: string, reason: string): AppState {
  const caregiver = state.caregivers.find((c) => c.id === caregiverId);
  if (!caregiver) return state;

  const next: AppState = {
    ...state,
    caregivers: state.caregivers.map((c) =>
      c.id === caregiverId ? { ...c, approvalStatus: "rejected", rejectionReason: reason, verified: false } : c,
    ),
  };

  return withCaregiverNotification(
    withLog(next, "Cadastro recusado", `${caregiver.name} recusado(a): ${reason}`),
    caregiverId,
    `Seu cadastro foi recusado: ${reason}`,
  );
}

export function blockCaregiver(state: AppState, caregiverId: string, reason: string): AppState {
  const caregiver = state.caregivers.find((c) => c.id === caregiverId);
  if (!caregiver) return state;

  const next: AppState = {
    ...state,
    caregivers: state.caregivers.map((c) =>
      c.id === caregiverId ? { ...c, approvalStatus: "blocked", rejectionReason: reason, verified: false } : c,
    ),
  };

  return withCaregiverNotification(
    withLog(next, "Cuidador bloqueado", `${caregiver.name} bloqueado(a): ${reason}`),
    caregiverId,
    `Seu acesso foi bloqueado: ${reason}`,
  );
}

export function reactivateCaregiver(state: AppState, caregiverId: string): AppState {
  const caregiver = state.caregivers.find((c) => c.id === caregiverId);
  if (!caregiver) return state;

  const next: AppState = {
    ...state,
    caregivers: state.caregivers.map((c) =>
      c.id === caregiverId ? { ...c, approvalStatus: "approved", rejectionReason: undefined, verified: true } : c,
    ),
  };

  return withCaregiverNotification(
    withLog(next, "Cuidador reativado", `${caregiver.name} reativado(a).`),
    caregiverId,
    "Seu acesso foi reativado.",
  );
}

export function approveCompany(state: AppState, companyId: string): AppState {
  const company = state.companies.find((c) => c.id === companyId);
  if (!company) return state;

  const next: AppState = {
    ...state,
    companies: state.companies.map((c) => (c.id === companyId ? { ...c, approvalStatus: "approved" } : c)),
  };

  return withLog(next, "Cadastro aprovado", `${company.name} aprovada.`);
}

export function rejectCompany(state: AppState, companyId: string, reason: string): AppState {
  const company = state.companies.find((c) => c.id === companyId);
  if (!company) return state;

  const next: AppState = {
    ...state,
    companies: state.companies.map((c) => (c.id === companyId ? { ...c, approvalStatus: "rejected" } : c)),
  };

  return withLog(next, "Cadastro recusado", `${company.name} recusada: ${reason}`);
}

/** Suspende a empresa (R11): ela mantém acesso ao histórico, só perde a ação de publicar. */
export function suspendCompany(state: AppState, companyId: string, reason: string): AppState {
  const company = state.companies.find((c) => c.id === companyId);
  if (!company) return state;

  const next: AppState = {
    ...state,
    companies: state.companies.map((c) => (c.id === companyId ? { ...c, approvalStatus: "blocked" } : c)),
  };

  return withLog(next, "Empresa suspensa", `${company.name} suspensa: ${reason}`);
}

export function reactivateCompany(state: AppState, companyId: string): AppState {
  const company = state.companies.find((c) => c.id === companyId);
  if (!company) return state;

  const next: AppState = {
    ...state,
    companies: state.companies.map((c) => (c.id === companyId ? { ...c, approvalStatus: "approved" } : c)),
  };

  return withLog(next, "Empresa reativada", `${company.name} reativada.`);
}
