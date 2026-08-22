import type { AppState, Message } from "../types";

/** A conversa é sempre vinculada a um atendimento (CLAUDE.md §31). */
export function attendanceMessages(state: AppState, attendanceId: string): Message[] {
  return state.messages
    .filter((m) => m.attendanceId === attendanceId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function sendMessage(
  state: AppState,
  attendanceId: string,
  from: "company" | "caregiver",
  text: string,
): AppState {
  const attendance = state.attendances.find((a) => a.id === attendanceId);
  if (!attendance || !text.trim()) return state;

  const message: Message = {
    id: `ms_${Date.now()}`,
    attendanceId,
    from,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const recipient =
    from === "company"
      ? { role: "caregiver" as const, id: attendance.confirmedCaregiverId }
      : { role: "company" as const, id: attendance.companyId };

  const next: AppState = { ...state, messages: [...state.messages, message] };
  if (!recipient.id) return next;

  return {
    ...next,
    notifications: [
      ...next.notifications,
      {
        id: `no_${Date.now()}`,
        toRole: recipient.role,
        toId: recipient.id,
        type: "new_message",
        text: "Nova mensagem em um atendimento.",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
