import type { AppState, Notification, Session } from "../types";
import { CHECKIN_TOLERANCE_MINUTES, attendanceStart } from "./attendances";

/** Véspera e 1h antes (documento, seção 1.3 item 6). */
const REMINDER_WINDOWS = [
  { suffix: "eve", hoursBefore: 24, label: "amanhã" },
  { suffix: "1h", hoursBefore: 1, label: "em 1 hora" },
];

function push(list: Notification[], n: Notification): Notification[] {
  return list.some((x) => x.id === n.id) ? list : [...list, n];
}

/**
 * Gera os avisos automáticos que dependem só da passagem do tempo: lembretes de atendimento
 * (Etapa 11) e falta de check-in (Etapa 12). Idempotente — o id é derivado do atendimento, então
 * rodar de novo não duplica nada.
 */
export function syncAutomaticNotifications(state: AppState, now = new Date()): AppState {
  let notifications = state.notifications;

  for (const attendance of state.attendances) {
    if (attendance.status === "cancelled" || attendance.status === "draft") continue;

    const start = attendanceStart(attendance);
    const minutesToStart = (start.getTime() - now.getTime()) / 60_000;

    // Lembretes para o cuidador confirmado.
    if (attendance.confirmedCaregiverId && !attendance.checkinAt) {
      for (const window of REMINDER_WINDOWS) {
        const due = minutesToStart <= window.hoursBefore * 60 && minutesToStart > 0;
        if (!due) continue;
        notifications = push(notifications, {
          id: `rem_${attendance.id}_${window.suffix}`,
          toRole: "caregiver",
          toId: attendance.confirmedCaregiverId,
          type: "reminder",
          text: `Lembrete: você tem um atendimento ${window.label}, às ${attendance.startTime}.`,
          read: false,
          createdAt: now.toISOString(),
        });
      }
    }

    // Falta de check-in passados 15 min do horário combinado.
    const late = -minutesToStart > CHECKIN_TOLERANCE_MINUTES;
    if (attendance.status === "confirmed" && !attendance.checkinAt && late) {
      notifications = push(notifications, {
        id: `late_${attendance.id}`,
        toRole: "company",
        toId: attendance.companyId,
        type: "checkin_pending",
        text: `Check-in não registrado até ${CHECKIN_TOLERANCE_MINUTES} min após o horário combinado.`,
        read: false,
        createdAt: now.toISOString(),
      });
    }
  }

  return notifications === state.notifications ? state : { ...state, notifications };
}

export function sessionNotifications(state: AppState, session: Session | null): Notification[] {
  if (!session) return [];
  const id = session.role === "company" ? session.companyId : session.caregiverId;
  if (!id) return [];
  return state.notifications
    .filter((n) => n.toRole === session.role && n.toId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(state: AppState, session: Session | null): number {
  return sessionNotifications(state, session).filter((n) => !n.read).length;
}

export function markAllRead(state: AppState, session: Session | null): AppState {
  const ids = new Set(sessionNotifications(state, session).map((n) => n.id));
  return {
    ...state,
    notifications: state.notifications.map((n) => (ids.has(n.id) ? { ...n, read: true } : n)),
  };
}
