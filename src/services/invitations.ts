import type { AppState, Application, Attendance, Invitation, NotificationType } from "../types";

function notify(
  state: AppState,
  toRole: "company" | "caregiver",
  toId: string,
  type: NotificationType,
  text: string,
): AppState {
  return {
    ...state,
    notifications: [
      ...state.notifications,
      {
        id: `no_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        toRole,
        toId,
        type,
        text,
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function patchAttendance(state: AppState, id: string, patch: Partial<Attendance>): AppState {
  return {
    ...state,
    attendances: state.attendances.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  };
}

export function attendanceById(state: AppState, id: string | undefined): Attendance | undefined {
  return state.attendances.find((a) => a.id === id);
}

export function attendanceInvitations(state: AppState, attendanceId: string): Invitation[] {
  return state.invitations.filter((i) => i.attendanceId === attendanceId);
}

export function attendanceApplications(state: AppState, attendanceId: string): Application[] {
  return state.applications.filter((a) => a.attendanceId === attendanceId);
}

/** R5: o endereço completo só é liberado para o cuidador confirmado. */
export function canSeeFullAddress(attendance: Attendance, caregiverId: string | undefined): boolean {
  return Boolean(caregiverId) && attendance.confirmedCaregiverId === caregiverId;
}

function interval(a: Attendance): [number, number] {
  const start = new Date(`${a.startDate}T${a.startTime}`).getTime();
  return [start, start + a.durationHours * 3_600_000];
}

/** R4: o cuidador não pode assumir dois atendimentos com horários sobrepostos. */
export function conflictingAttendance(
  state: AppState,
  caregiverId: string,
  target: Attendance,
): Attendance | undefined {
  const acceptedIds = state.applications
    .filter((ap) => ap.caregiverId === caregiverId && ap.status !== "not_selected")
    .map((ap) => ap.attendanceId);

  const committed = state.attendances.filter(
    (a) =>
      a.id !== target.id &&
      a.status !== "cancelled" &&
      (a.confirmedCaregiverId === caregiverId || acceptedIds.includes(a.id)),
  );

  const [start, end] = interval(target);
  return committed.find((a) => {
    const [s, e] = interval(a);
    return s < end && start < e;
  });
}

// ---------- Empresa: convidar / publicação aberta ----------

export function sendInvitation(state: AppState, attendanceId: string, caregiverId: string): AppState {
  const already = state.invitations.some(
    (i) => i.attendanceId === attendanceId && i.caregiverId === caregiverId && i.status !== "rejected",
  );
  if (already) return state;

  const invitation: Invitation = {
    id: `iv_${Date.now()}`,
    attendanceId,
    caregiverId,
    status: "sent",
    createdAt: new Date().toISOString(),
  };

  const attendance = attendanceById(state, attendanceId);
  const next: AppState = { ...state, invitations: [...state.invitations, invitation] };
  const withStatus =
    attendance?.status === "open" ? patchAttendance(next, attendanceId, { status: "invited" }) : next;

  return notify(withStatus, "caregiver", caregiverId, "invitation", "Você recebeu um convite para um atendimento.");
}

export function setOpenApplications(state: AppState, attendanceId: string, open: boolean): AppState {
  return patchAttendance(state, attendanceId, { openApplications: open });
}

// ---------- Cuidador: aceitar / recusar / candidatar-se ----------

export function caregiverInvitations(state: AppState, caregiverId: string | undefined): Invitation[] {
  if (!caregiverId) return [];
  return state.invitations.filter((i) => i.caregiverId === caregiverId && i.status === "sent");
}

/** Atendimentos de publicação aberta em que o cuidador ainda não se candidatou. */
export function openOpportunities(state: AppState, caregiverId: string | undefined): Attendance[] {
  if (!caregiverId) return [];
  const appliedTo = state.applications
    .filter((ap) => ap.caregiverId === caregiverId)
    .map((ap) => ap.attendanceId);

  return state.attendances.filter(
    (a) => a.openApplications && a.status !== "cancelled" && !a.confirmedCaregiverId && !appliedTo.includes(a.id),
  );
}

export function caregiverConfirmedAttendances(state: AppState, caregiverId: string | undefined): Attendance[] {
  if (!caregiverId) return [];
  return state.attendances.filter(
    (a) => a.confirmedCaregiverId === caregiverId && a.status !== "cancelled",
  );
}

function addApplication(state: AppState, attendanceId: string, caregiverId: string): AppState {
  const application: Application = {
    id: `ap_${Date.now()}`,
    attendanceId,
    caregiverId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const next: AppState = { ...state, applications: [...state.applications, application] };
  return patchAttendance(next, attendanceId, { status: "applications_received" });
}

export interface ActionResult {
  nextState: AppState;
  error?: string;
}

/** Aceitar o convite vira uma candidatura — quem confirma é a empresa. */
export function acceptInvitation(state: AppState, invitationId: string): ActionResult {
  const invitation = state.invitations.find((i) => i.id === invitationId);
  const attendance = attendanceById(state, invitation?.attendanceId);
  if (!invitation || !attendance) return { nextState: state };

  const conflict = conflictingAttendance(state, invitation.caregiverId, attendance);
  if (conflict) {
    return {
      nextState: state,
      error: `Você já tem um atendimento em ${conflict.startDate.split("-").reverse().join("/")} às ${conflict.startTime} que se sobrepõe a este.`,
    };
  }

  const withInvitation: AppState = {
    ...state,
    invitations: state.invitations.map((i) =>
      i.id === invitationId ? { ...i, status: "accepted" } : i,
    ),
  };
  const next = addApplication(withInvitation, attendance.id, invitation.caregiverId);
  return {
    nextState: notify(next, "company", attendance.companyId, "application", "Um cuidador aceitou o convite e aguarda confirmação."),
  };
}

export function rejectInvitation(state: AppState, invitationId: string): AppState {
  const invitation = state.invitations.find((i) => i.id === invitationId);
  const attendance = attendanceById(state, invitation?.attendanceId);
  if (!invitation || !attendance) return state;

  const next: AppState = {
    ...state,
    invitations: state.invitations.map((i) =>
      i.id === invitationId ? { ...i, status: "rejected" } : i,
    ),
  };

  // Sem nenhum convite de pé e sem candidaturas, o atendimento volta a "em busca".
  const stillPending = next.invitations.some(
    (i) => i.attendanceId === attendance.id && i.status !== "rejected",
  );
  const hasApplications = attendanceApplications(next, attendance.id).length > 0;
  const restored =
    !stillPending && !hasApplications && attendance.status === "invited"
      ? patchAttendance(next, attendance.id, { status: "open" })
      : next;

  return notify(restored, "company", attendance.companyId, "application", "Um cuidador recusou o convite.");
}

export function applyToOpenAttendance(
  state: AppState,
  attendanceId: string,
  caregiverId: string,
): ActionResult {
  const attendance = attendanceById(state, attendanceId);
  if (!attendance) return { nextState: state };

  const conflict = conflictingAttendance(state, caregiverId, attendance);
  if (conflict) {
    return {
      nextState: state,
      error: `Você já tem um atendimento em ${conflict.startDate.split("-").reverse().join("/")} às ${conflict.startTime} que se sobrepõe a este.`,
    };
  }

  const next = addApplication(state, attendanceId, caregiverId);
  return {
    nextState: notify(next, "company", attendance.companyId, "application", "Nova candidatura recebida."),
  };
}

// ---------- Empresa: confirmar candidato / cancelar ----------

/** Confirma um candidato, avisa os demais e libera o endereço completo (R5). */
export function confirmApplication(state: AppState, applicationId: string): AppState {
  const application = state.applications.find((ap) => ap.id === applicationId);
  const attendance = attendanceById(state, application?.attendanceId);
  if (!application || !attendance) return state;

  const others = attendanceApplications(state, attendance.id).filter((ap) => ap.id !== applicationId);

  let next: AppState = {
    ...state,
    applications: state.applications.map((ap) => {
      if (ap.id === applicationId) return { ...ap, status: "confirmed" };
      if (ap.attendanceId === attendance.id) return { ...ap, status: "not_selected" };
      return ap;
    }),
  };

  next = patchAttendance(next, attendance.id, {
    status: "confirmed",
    confirmedCaregiverId: application.caregiverId,
  });

  next = notify(
    next,
    "caregiver",
    application.caregiverId,
    "confirmation",
    "Você foi confirmado! O endereço completo já está disponível.",
  );

  for (const other of others) {
    next = notify(next, "caregiver", other.caregiverId, "application", "Outro cuidador foi confirmado para este atendimento.");
  }

  return next;
}

/** R8: cancelamento com menos de 12h fica marcado. R12: fica registrado com data, hora e responsável. */
export const SHORT_NOTICE_HOURS = 12;

export function cancelAttendance(
  state: AppState,
  attendanceId: string,
  by: "company" | "caregiver",
  reason: string,
): AppState {
  const attendance = attendanceById(state, attendanceId);
  if (!attendance) return state;

  const now = new Date();
  const [start] = interval(attendance);
  const noticeHours = Math.max(Math.round((start - now.getTime()) / 3_600_000), 0);

  let next = patchAttendance(state, attendanceId, {
    status: "cancelled",
    cancellation: { by, at: now.toISOString(), reason, noticeHours },
  });

  next = {
    ...next,
    auditLog: [
      ...next.auditLog,
      {
        id: `log_${Date.now()}`,
        action: "Cancelamento",
        actor: by === "company" ? "Empresa" : "Cuidador",
        detail: `Atendimento ${attendanceId} cancelado com ${noticeHours}h de antecedência${
          noticeHours < SHORT_NOTICE_HOURS ? " (< 12h)" : ""
        }: ${reason}`,
        createdAt: now.toISOString(),
      },
    ],
  };

  if (attendance.confirmedCaregiverId) {
    next = notify(next, "caregiver", attendance.confirmedCaregiverId, "cancellation", `Atendimento cancelado: ${reason}`);
  }

  return next;
}
