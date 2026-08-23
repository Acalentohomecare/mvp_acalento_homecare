import type {
  AppState,
  Attendance,
  AttendanceStatus,
  AttendanceType,
  CaregiverCategory,
  Patient,
} from "../types";
import { requiredCategory } from "../constants/activities";

/** Tolerância antes de considerar o check-in atrasado (mesma regra da Etapa 12). */
export const CHECKIN_TOLERANCE_MINUTES = 15;

const OPEN_STATUSES: AttendanceStatus[] = ["open", "invited", "applications_received"];

export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function attendanceStart(attendance: Attendance): Date {
  return new Date(`${attendance.startDate}T${attendance.startTime}`);
}

function byStart(a: Attendance, b: Attendance): number {
  return `${a.startDate}T${a.startTime}`.localeCompare(`${b.startDate}T${b.startTime}`);
}

/** Isolamento de dados: a empresa só enxerga os próprios atendimentos. */
export function companyAttendances(state: AppState, companyId: string | undefined): Attendance[] {
  if (!companyId) return [];
  return state.attendances.filter((a) => a.companyId === companyId);
}

/** Atendimento publicado e ainda sem cuidador confirmado. */
export function isAwaitingCaregiver(attendance: Attendance): boolean {
  return OPEN_STATUSES.includes(attendance.status);
}

export function todayAttendances(list: Attendance[], now = new Date()): Attendance[] {
  const today = todayISO(now);
  return list
    .filter((a) => a.startDate === today && a.status !== "draft" && a.status !== "cancelled")
    .sort(byStart);
}

export function awaitingCaregiverAttendances(list: Attendance[]): Attendance[] {
  return list.filter(isAwaitingCaregiver).sort(byStart);
}

export function upcomingAttendances(list: Attendance[], now = new Date()): Attendance[] {
  const today = todayISO(now);
  return list
    .filter((a) => a.status === "confirmed" && a.startDate > today)
    .sort(byStart);
}

export interface ScheduleDay {
  date: string;
  items: Attendance[];
}

/** Agenda/escala: N dias a partir de `from`, cada um com os atendimentos que não foram cancelados. */
export function scheduleDays(list: Attendance[], from: Date, days: number): ScheduleDay[] {
  return Array.from({ length: days }, (_, offset) => {
    const day = new Date(from);
    day.setDate(day.getDate() + offset);
    const date = todayISO(day);
    return {
      date,
      items: list
        .filter((a) => a.startDate === date && a.status !== "cancelled" && a.status !== "draft")
        .sort(byStart),
    };
  });
}

export function draftAttendances(list: Attendance[]): Attendance[] {
  return list.filter((a) => a.status === "draft").sort(byStart);
}

export function applicationsToReview(list: Attendance[]): Attendance[] {
  return list.filter((a) => a.status === "applications_received").sort(byStart);
}

/** Confirmado, horário já passou da tolerância e o cuidador não fez check-in. */
export function pendingCheckins(list: Attendance[], now = new Date()): Attendance[] {
  return list
    .filter(
      (a) =>
        a.status === "confirmed" &&
        !a.checkinAt &&
        now.getTime() - attendanceStart(a).getTime() > CHECKIN_TOLERANCE_MINUTES * 60_000,
    )
    .sort(byStart);
}

/** Horas realizadas de verdade — calculadas do check-in/check-out, não da duração prevista. */
export function completedHours(list: Attendance[]): number {
  return list.reduce((total, a) => {
    if (!a.checkinAt || !a.checkoutAt) return total;
    const hours =
      (new Date(a.checkoutAt).getTime() - new Date(a.checkinAt).getTime()) / 3_600_000;
    return total + Math.max(hours, 0);
  }, 0);
}

/** Cuidadores com atendimento confirmado ou em andamento nesta empresa. */
export function activeCaregiverIds(list: Attendance[]): string[] {
  const ids = list
    .filter((a) => (a.status === "confirmed" || a.status === "in_progress") && a.confirmedCaregiverId)
    .map((a) => a.confirmedCaregiverId as string);
  return [...new Set(ids)];
}

export interface RecentActivityEntry {
  id: string;
  at: string;
  text: string;
}

/**
 * "Atividade recente" derivada dos próprios atendimentos da empresa — de propósito não usa o
 * `auditLog`, que é global e traz ações de outras empresas/cuidadores (isolamento de dados).
 */
export function recentActivity(
  list: Attendance[],
  patients: Patient[],
  limit = 6,
): RecentActivityEntry[] {
  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "paciente";
  const entries: RecentActivityEntry[] = [];

  for (const a of list) {
    if (a.checkoutAt) {
      entries.push({ id: `${a.id}-out`, at: a.checkoutAt, text: `Atendimento de ${patientName(a.patientId)} concluído.` });
    }
    if (a.checkinAt) {
      entries.push({ id: `${a.id}-in`, at: a.checkinAt, text: `Check-in registrado em ${patientName(a.patientId)}.` });
    }
    if (a.cancellation) {
      entries.push({ id: `${a.id}-cancel`, at: a.cancellation.at, text: `Atendimento de ${patientName(a.patientId)} cancelado: ${a.cancellation.reason}` });
    }
    entries.push({ id: `${a.id}-new`, at: a.createdAt, text: `Atendimento de ${patientName(a.patientId)} criado.` });
  }

  return entries.sort((x, y) => y.at.localeCompare(x.at)).slice(0, limit);
}

/** A categoria exigida vem só das atividades marcadas — é a regra central do produto (R2). */
export function attendanceRequiredCategory(activityIds: string[]): CaregiverCategory {
  return requiredCategory(activityIds);
}

export interface NewAttendanceInput {
  companyId: string;
  patientId: string;
  type: AttendanceType;
  neighborhood: string;
  street: string;
  number: string;
  startDate: string;
  startTime: string;
  durationHours: number;
  recurring: boolean;
  recurrenceDescription?: string;
  activityIds: string[];
  value: number;
}

export function createAttendance(
  state: AppState,
  input: NewAttendanceInput,
  publish: boolean,
): { attendance: Attendance; nextState: AppState } {
  const attendance: Attendance = {
    id: `at_${Date.now()}`,
    companyId: input.companyId,
    patientId: input.patientId,
    type: input.type,
    neighborhood: input.neighborhood,
    street: input.street,
    number: input.number,
    startDate: input.startDate,
    startTime: input.startTime,
    durationHours: input.durationHours,
    recurring: input.recurring,
    recurrenceDescription: input.recurring ? input.recurrenceDescription : undefined,
    activityIds: input.activityIds,
    value: input.value,
    status: publish ? "open" : "draft",
    // A escolha entre convite direto e publicação aberta acontece na Etapa 9.
    openApplications: false,
    createdAt: new Date().toISOString(),
  };

  return {
    attendance,
    nextState: { ...state, attendances: [...state.attendances, attendance] },
  };
}
