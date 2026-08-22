import type { AppState, Attendance, Evaluation } from "../types";

/** R9: a avaliação só pode acontecer depois do atendimento concluído. */
export function canEvaluate(attendance: Attendance): boolean {
  return attendance.status === "completed" || attendance.status === "evaluated";
}

export function evaluationFor(
  state: AppState,
  attendanceId: string,
  from: "company" | "caregiver",
): Evaluation | undefined {
  return state.evaluations.find((e) => e.attendanceId === attendanceId && e.from === from);
}

export function createEvaluation(
  state: AppState,
  attendance: Attendance,
  from: "company" | "caregiver",
  rating: 1 | 2 | 3 | 4 | 5,
  comment: string,
): AppState {
  if (!canEvaluate(attendance)) return state;
  if (evaluationFor(state, attendance.id, from)) return state;
  if (!attendance.confirmedCaregiverId) return state;

  const evaluation: Evaluation = {
    id: `ev_${Date.now()}`,
    attendanceId: attendance.id,
    from,
    caregiverId: attendance.confirmedCaregiverId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    evaluations: [...state.evaluations, evaluation],
    attendances: state.attendances.map((a) =>
      a.id === attendance.id ? { ...a, status: "evaluated" } : a,
    ),
  };
}

/** Histórico de atendimentos de um cuidador dentro de uma empresa (tela 15/07). */
export function caregiverHistory(
  state: AppState,
  caregiverId: string,
  companyId: string,
): Attendance[] {
  return state.attendances
    .filter((a) => a.companyId === companyId && a.confirmedCaregiverId === caregiverId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}
