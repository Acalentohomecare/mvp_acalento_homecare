import type { ApprovalStatus, AppState, Caregiver, CaregiverLink, Company } from "../types";

/**
 * Quadro de cuidadores da empresa.
 *
 * Quem confere documentos e decide quem pode assumir um plantão é a própria empresa — a demo
 * não tem administrador de plataforma. Cada empresa mantém o seu quadro, então o mesmo cuidador
 * pode estar aprovado em uma empresa e em análise em outra.
 */

export function caregiverLink(
  state: AppState,
  companyId: string | undefined,
  caregiverId: string,
): CaregiverLink | undefined {
  if (!companyId) return undefined;
  return state.caregiverLinks.find((l) => l.companyId === companyId && l.caregiverId === caregiverId);
}

/** Sem vínculo o cuidador está "em análise": ele aparece na fila da empresa, não no quadro. */
export function rosterStatus(
  state: AppState,
  companyId: string | undefined,
  caregiverId: string,
): ApprovalStatus {
  return caregiverLink(state, companyId, caregiverId)?.status ?? "pending";
}

/** R1: só cuidador aprovado pela empresa aparece nas buscas e pode receber convites dela. */
export function rosterCaregivers(state: AppState, companyId: string | undefined): Caregiver[] {
  return state.caregivers.filter((c) => rosterStatus(state, companyId, c.id) === "approved");
}

/** Fila de conferência: cadastros que a empresa ainda não decidiu. */
export function rosterQueue(state: AppState, companyId: string | undefined): Caregiver[] {
  return state.caregivers.filter((c) => rosterStatus(state, companyId, c.id) === "pending");
}

/** Recusados e bloqueados — ficam fora da busca, mas a empresa pode reconsiderar. */
export function rosterInactive(state: AppState, companyId: string | undefined): Caregiver[] {
  return state.caregivers.filter((c) => {
    const status = rosterStatus(state, companyId, c.id);
    return status === "rejected" || status === "blocked";
  });
}

export function isInRoster(
  state: AppState,
  companyId: string | undefined,
  caregiverId: string,
): boolean {
  return rosterStatus(state, companyId, caregiverId) === "approved";
}

/** Empresas que já aprovaram este cuidador — o que ele vê no próprio perfil. */
export function caregiverCompanies(state: AppState, caregiverId: string | undefined): Company[] {
  if (!caregiverId) return [];
  const ids = state.caregiverLinks
    .filter((l) => l.caregiverId === caregiverId && l.status === "approved")
    .map((l) => l.companyId);
  return state.companies.filter((c) => ids.includes(c.id));
}

/** O cuidador só entra no app depois que ao menos uma empresa aprova o cadastro dele. */
export function isCaregiverActive(state: AppState, caregiverId: string | undefined): boolean {
  return caregiverCompanies(state, caregiverId).length > 0;
}

/** Última decisão negativa recebida — é o motivo mostrado na tela de cadastro em análise. */
export function lastRejection(
  state: AppState,
  caregiverId: string | undefined,
): { status: ApprovalStatus; reason?: string; companyName: string } | undefined {
  if (!caregiverId) return undefined;
  const decided = state.caregiverLinks
    .filter(
      (l) => l.caregiverId === caregiverId && (l.status === "rejected" || l.status === "blocked"),
    )
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

  const last = decided[0];
  if (!last) return undefined;

  return {
    status: last.status,
    reason: last.reason,
    companyName: state.companies.find((c) => c.id === last.companyId)?.name ?? "empresa",
  };
}

/** Registro de atividade que a empresa enxerga: o que ela fez + o que envolve o seu quadro. */
export function companyAuditLog(state: AppState, companyId: string | undefined) {
  if (!companyId) return [];
  return state.auditLog.filter(
    (entry) =>
      entry.companyId === companyId ||
      (entry.caregiverId !== undefined && isInRoster(state, companyId, entry.caregiverId)),
  );
}

// ---------- Decisões da empresa sobre o quadro ----------

interface Decision {
  status: ApprovalStatus;
  reason?: string;
  action: string;
  detail: (caregiverName: string, companyName: string) => string;
  notice: (companyName: string) => string;
}

function decide(
  state: AppState,
  companyId: string,
  caregiverId: string,
  { status, reason, action, detail, notice }: Decision,
): AppState {
  const caregiver = state.caregivers.find((c) => c.id === caregiverId);
  const company = state.companies.find((c) => c.id === companyId);
  if (!caregiver || !company) return state;

  const now = new Date().toISOString();
  const existing = caregiverLink(state, companyId, caregiverId);
  const link: CaregiverLink = {
    id: existing?.id ?? `lk_${Date.now()}`,
    companyId,
    caregiverId,
    status,
    reason,
    decidedAt: now,
  };

  return {
    ...state,
    caregiverLinks: existing
      ? state.caregiverLinks.map((l) => (l.id === existing.id ? link : l))
      : [...state.caregiverLinks, link],
    // Aprovar significa que a empresa conferiu documento e selfie — é o que sustenta o selo.
    caregivers:
      status === "approved"
        ? state.caregivers.map((c) => (c.id === caregiverId ? { ...c, verified: true } : c))
        : state.caregivers,
    notifications: [
      ...state.notifications,
      {
        id: `no_${Date.now()}`,
        toRole: "caregiver" as const,
        toId: caregiverId,
        type: "approval" as const,
        text: notice(company.name),
        read: false,
        createdAt: now,
      },
    ],
    auditLog: [
      ...state.auditLog,
      {
        id: `log_${Date.now()}`,
        action,
        actor: company.name,
        detail: detail(caregiver.name, company.name),
        createdAt: now,
        companyId,
        caregiverId,
      },
    ],
  };
}

/** Aprova o cadastro no quadro da empresa (R1) e libera o cuidador para os plantões dela. */
export function approveCaregiver(state: AppState, companyId: string, caregiverId: string): AppState {
  return decide(state, companyId, caregiverId, {
    status: "approved",
    action: "Cadastro aprovado",
    detail: (name, company) => `${name} entrou no quadro da ${company}.`,
    notice: (company) => `A ${company} aprovou seu cadastro. Você já pode receber convites dela.`,
  });
}

export function rejectCaregiver(
  state: AppState,
  companyId: string,
  caregiverId: string,
  reason: string,
): AppState {
  return decide(state, companyId, caregiverId, {
    status: "rejected",
    reason,
    action: "Cadastro recusado",
    detail: (name, company) => `${name} recusado(a) pela ${company}: ${reason}`,
    notice: (company) => `A ${company} recusou seu cadastro: ${reason}`,
  });
}

export function blockCaregiver(
  state: AppState,
  companyId: string,
  caregiverId: string,
  reason: string,
): AppState {
  return decide(state, companyId, caregiverId, {
    status: "blocked",
    reason,
    action: "Cuidador bloqueado",
    detail: (name, company) => `${name} bloqueado(a) pela ${company}: ${reason}`,
    notice: (company) => `A ${company} bloqueou seu acesso aos plantões dela: ${reason}`,
  });
}

export function reactivateCaregiver(
  state: AppState,
  companyId: string,
  caregiverId: string,
): AppState {
  return decide(state, companyId, caregiverId, {
    status: "approved",
    action: "Cuidador reativado",
    detail: (name, company) => `${name} voltou ao quadro da ${company}.`,
    notice: (company) => `A ${company} reativou seu acesso aos plantões dela.`,
  });
}
