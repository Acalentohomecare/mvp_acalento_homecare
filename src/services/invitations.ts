import type { AppState, Application, Attendance, Invitation, NotificationType } from "../types";
import { isInRoster } from "./roster";

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

/**
 * Os dias que uma contratação cobre.
 *
 * Atendimento avulso é ele mesmo. Escala fixa são todos os dias vivos da série — cancelado fica
 * de fora, porque um dia derrubado não volta junto com o resto, e dia já confirmado com outra
 * pessoa também: a escala pode ter sido remendada no meio.
 *
 * É este recorte que faz convite, aceite e confirmação valerem para a escala inteira. A alternativa
 * seria sessenta convites para a mesma cuidadora pelo mesmo trabalho.
 */
export function seriesMembers(state: AppState, attendance: Attendance): Attendance[] {
  if (!attendance.seriesId) return [attendance];
  return state.attendances
    .filter(
      (a) =>
        a.seriesId === attendance.seriesId &&
        a.status !== "cancelled" &&
        (!a.confirmedCaregiverId || a.id === attendance.id),
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function patchSeries(state: AppState, membros: Attendance[], patch: Partial<Attendance>): AppState {
  const ids = new Set(membros.map((a) => a.id));
  return {
    ...state,
    attendances: state.attendances.map((a) => (ids.has(a.id) ? { ...a, ...patch } : a)),
  };
}

/** "a escala de 42 atendimentos" / "o atendimento" — o objeto da frase muda com o tamanho. */
function nomeDaContratacao(membros: Attendance[]): string {
  return membros.length > 1 ? `a escala de ${membros.length} atendimentos` : "o atendimento";
}

/**
 * R4 aplicada à contratação inteira: basta um dia sobreposto para a escala não caber na agenda de
 * quem aceita. Devolve o primeiro conflito, que é o que a mensagem precisa citar.
 */
function conflitoNaSerie(
  state: AppState,
  caregiverId: string,
  membros: Attendance[],
): Attendance | undefined {
  for (const membro of membros) {
    const conflito = conflictingAttendance(state, caregiverId, membro);
    if (conflito) return conflito;
  }
  return undefined;
}

function erroDeConflito(conflito: Attendance): string {
  const data = conflito.startDate.split("-").reverse().join("/");
  return `Você já tem um atendimento em ${data} às ${conflito.startTime} que se sobrepõe a este.`;
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
  const target = attendanceById(state, attendanceId);
  // R1: convite só sai para quem a empresa já aprovou no quadro dela.
  if (!target || !isInRoster(state, target.companyId, caregiverId)) return state;

  const already = state.invitations.some(
    (i) => i.attendanceId === attendanceId && i.caregiverId === caregiverId && i.status !== "rejected",
  );
  if (already) return state;

  const membros = seriesMembers(state, target);

  const invitation: Invitation = {
    id: `iv_${Date.now()}`,
    attendanceId,
    caregiverId,
    status: "sent",
    createdAt: new Date().toISOString(),
  };

  const next: AppState = { ...state, invitations: [...state.invitations, invitation] };
  /* O convite é um só, mas ele compromete todos os dias da escala: os que ainda estavam "em busca"
     passam a "convidado" juntos, senão a lista da empresa mostraria a mesma escala metade
     convidada e metade em aberto. */
  const withStatus = patchSeries(
    next,
    membros.filter((a) => a.status === "open"),
    { status: "invited" },
  );

  return notify(
    withStatus,
    "caregiver",
    caregiverId,
    "invitation",
    membros.length > 1
      ? `Você recebeu um convite para uma escala de ${membros.length} atendimentos.`
      : "Você recebeu um convite para um atendimento.",
  );
}

export function setOpenApplications(state: AppState, attendanceId: string, open: boolean): AppState {
  return patchAttendance(state, attendanceId, { openApplications: open });
}

// ---------- Cuidador: aceitar / recusar / candidatar-se ----------

export function caregiverInvitations(state: AppState, caregiverId: string | undefined): Invitation[] {
  if (!caregiverId) return [];
  return state.invitations.filter((i) => i.caregiverId === caregiverId && i.status === "sent");
}

/**
 * Atendimentos de publicação aberta em que o cuidador ainda não se candidatou.
 * R1: só entram os de empresas que já aprovaram o cuidador no quadro delas.
 */
export function openOpportunities(state: AppState, caregiverId: string | undefined): Attendance[] {
  if (!caregiverId) return [];
  const appliedTo = state.applications
    .filter((ap) => ap.caregiverId === caregiverId)
    .map((ap) => ap.attendanceId);

  const abertos = state.attendances.filter(
    (a) =>
      a.openApplications &&
      a.status !== "cancelled" &&
      !a.confirmedCaregiverId &&
      !appliedTo.includes(a.id) &&
      isInRoster(state, a.companyId, caregiverId),
  );

  /* Uma escala é uma oportunidade, não sessenta: o cuidador se candidata à contratação inteira,
     então só o primeiro dia de cada série entra na lista. */
  const seriesVistas = new Set<string>();
  return abertos.filter((a) => {
    if (!a.seriesId) return true;
    if (seriesVistas.has(a.seriesId)) return false;
    seriesVistas.add(a.seriesId);
    return true;
  });
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
  const alvo = attendanceById(next, attendanceId);
  if (!alvo) return next;

  // Uma candidatura por contratação, e o estado acompanha a escala inteira.
  return patchSeries(next, seriesMembers(next, alvo), { status: "applications_received" });
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

  const membros = seriesMembers(state, attendance);
  const conflict = conflitoNaSerie(state, invitation.caregiverId, membros);
  if (conflict) {
    return { nextState: state, error: erroDeConflito(conflict) };
  }

  const withInvitation: AppState = {
    ...state,
    invitations: state.invitations.map((i) =>
      i.id === invitationId ? { ...i, status: "accepted" } : i,
    ),
  };
  const next = addApplication(withInvitation, attendance.id, invitation.caregiverId);
  return {
    nextState: notify(
      next,
      "company",
      attendance.companyId,
      "application",
      `Um cuidador aceitou o convite para ${nomeDaContratacao(membros)} e aguarda confirmação.`,
    ),
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
      ? patchSeries(next, seriesMembers(next, attendance), { status: "open" })
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

  // R1: a candidatura só vale para empresa que já aprovou o cuidador no quadro dela.
  if (!isInRoster(state, attendance.companyId, caregiverId)) {
    return { nextState: state, error: "Esta empresa ainda não aprovou seu cadastro." };
  }

  const conflict = conflitoNaSerie(state, caregiverId, seriesMembers(state, attendance));
  if (conflict) {
    return { nextState: state, error: erroDeConflito(conflict) };
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

  /* A confirmação é da contratação, não do dia: a escala inteira passa a ter dono, e é isso que
     enche a agenda da cuidadora de segunda a sexta. Cada dia segue com o próprio check-in. */
  const membros = seriesMembers(next, attendance);
  next = patchSeries(next, membros, {
    status: "confirmed",
    confirmedCaregiverId: application.caregiverId,
  });

  next = notify(
    next,
    "caregiver",
    application.caregiverId,
    "confirmation",
    membros.length > 1
      ? `Você foi confirmado para a escala de ${membros.length} atendimentos! O endereço completo já está disponível.`
      : "Você foi confirmado! O endereço completo já está disponível.",
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
  const companyName = state.companies.find((c) => c.id === attendance.companyId)?.name ?? "Empresa";
  const caregiverName =
    state.caregivers.find((c) => c.id === attendance.confirmedCaregiverId)?.name ?? "Cuidador";
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
        actor: by === "company" ? companyName : caregiverName,
        detail: `Atendimento ${attendanceId} cancelado com ${noticeHours}h de antecedência${
          noticeHours < SHORT_NOTICE_HOURS ? " (< 12h)" : ""
        }: ${reason}`,
        createdAt: now.toISOString(),
        companyId: attendance.companyId,
        caregiverId: attendance.confirmedCaregiverId,
      },
    ],
  };

  if (attendance.confirmedCaregiverId) {
    next = notify(next, "caregiver", attendance.confirmedCaregiverId, "cancellation", `Atendimento cancelado: ${reason}`);
  }

  return next;
}
