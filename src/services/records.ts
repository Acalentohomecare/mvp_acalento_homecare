import type { AppState, Attendance, AttendanceRecord, VitalSigns } from "../types";

export function attendanceRecord(state: AppState, attendanceId: string): AttendanceRecord {
  return (
    state.records.find((r) => r.attendanceId === attendanceId) ?? {
      attendanceId,
      completedActivityIds: [],
      observations: [],
      photos: [],
    }
  );
}

function putRecord(state: AppState, record: AttendanceRecord): AppState {
  const exists = state.records.some((r) => r.attendanceId === record.attendanceId);
  return {
    ...state,
    records: exists
      ? state.records.map((r) => (r.attendanceId === record.attendanceId ? record : r))
      : [...state.records, record],
  };
}

/** R7: depois do check-out o registro fica travado — só cabe nova observação. */
export function isRecordLocked(record: AttendanceRecord): boolean {
  return Boolean(record.closedAt);
}

export interface RecordPatch {
  completedActivityIds?: string[];
  vitals?: VitalSigns;
  photos?: string[];
}

export function updateRecord(state: AppState, attendanceId: string, patch: RecordPatch): AppState {
  const record = attendanceRecord(state, attendanceId);
  if (isRecordLocked(record)) return state;
  return putRecord(state, { ...record, ...patch });
}

export function addObservation(state: AppState, attendanceId: string, text: string): AppState {
  const record = attendanceRecord(state, attendanceId);
  return putRecord(state, {
    ...record,
    observations: [
      ...record.observations,
      {
        id: `ob_${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
        afterCheckout: isRecordLocked(record),
      },
    ],
  });
}

// ---------- Check-in / check-out ----------

export function checkIn(state: AppState, attendance: Attendance): AppState {
  if (attendance.checkinAt) return state;
  const now = new Date().toISOString();
  return {
    ...state,
    attendances: state.attendances.map((a) =>
      a.id === attendance.id
        ? {
            ...a,
            status: "in_progress",
            checkinAt: now,
            checkinLocation: `${a.neighborhood} (simulado)`,
          }
        : a,
    ),
  };
}

/** R6: o check-out só é permitido depois do check-in do mesmo atendimento. */
export function canCheckOut(attendance: Attendance): boolean {
  return Boolean(attendance.checkinAt) && !attendance.checkoutAt;
}

export function checkOut(state: AppState, attendance: Attendance): AppState {
  if (!canCheckOut(attendance)) return state;
  const now = new Date().toISOString();

  const next: AppState = {
    ...state,
    attendances: state.attendances.map((a) =>
      a.id === attendance.id ? { ...a, status: "completed", checkoutAt: now } : a,
    ),
  };

  // O check-out fecha o registro (R7).
  return putRecord(next, { ...attendanceRecord(next, attendance.id), closedAt: now });
}
