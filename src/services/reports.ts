import type { AppState, Attendance } from "../types";

export interface ReportFilters {
  from: string;
  to: string;
  caregiverId: string;
  patientId: string;
}

export interface ReportRow {
  attendanceId: string;
  date: string;
  caregiverId: string;
  caregiverName: string;
  patientName: string;
  plannedHours: number;
  workedHours: number;
  value: number;
}

/** Horas realizadas saem do check-in/check-out; horas previstas, da duração contratada. */
function workedHours(attendance: Attendance): number {
  if (!attendance.checkinAt || !attendance.checkoutAt) return 0;
  const hours =
    (new Date(attendance.checkoutAt).getTime() - new Date(attendance.checkinAt).getTime()) /
    3_600_000;
  return Math.max(hours, 0);
}

export function buildReport(
  state: AppState,
  companyId: string | undefined,
  filters: ReportFilters,
): ReportRow[] {
  if (!companyId) return [];

  return state.attendances
    .filter((a) => a.companyId === companyId)
    .filter((a) => a.status === "completed" || a.status === "evaluated")
    .filter((a) => (filters.from ? a.startDate >= filters.from : true))
    .filter((a) => (filters.to ? a.startDate <= filters.to : true))
    .filter((a) => (filters.caregiverId ? a.confirmedCaregiverId === filters.caregiverId : true))
    .filter((a) => (filters.patientId ? a.patientId === filters.patientId : true))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((a) => ({
      attendanceId: a.id,
      date: a.startDate,
      caregiverId: a.confirmedCaregiverId ?? "",
      caregiverName:
        state.caregivers.find((c) => c.id === a.confirmedCaregiverId)?.name ?? "—",
      patientName: state.patients.find((p) => p.id === a.patientId)?.name ?? "—",
      plannedHours: a.durationHours,
      workedHours: workedHours(a),
      value: a.value,
    }));
}

export interface ReportTotals {
  attendances: number;
  plannedHours: number;
  workedHours: number;
  value: number;
}

export interface CaregiverReportSummary {
  caregiverId: string;
  caregiverName: string;
  attendances: number;
  plannedHours: number;
  workedHours: number;
  value: number;
}

export function reportTotals(rows: ReportRow[]): ReportTotals {
  return rows.reduce<ReportTotals>(
    (totals, row) => ({
      attendances: totals.attendances + 1,
      plannedHours: totals.plannedHours + row.plannedHours,
      workedHours: totals.workedHours + row.workedHours,
      value: totals.value + row.value,
    }),
    { attendances: 0, plannedHours: 0, workedHours: 0, value: 0 },
  );
}

export function caregiverReportSummary(rows: ReportRow[]): CaregiverReportSummary[] {
  const summaries = new Map<string, CaregiverReportSummary>();

  rows.forEach((row) => {
    const current = summaries.get(row.caregiverId) ?? {
      caregiverId: row.caregiverId,
      caregiverName: row.caregiverName,
      attendances: 0,
      plannedHours: 0,
      workedHours: 0,
      value: 0,
    };

    summaries.set(row.caregiverName, {
      ...current,
      attendances: current.attendances + 1,
      plannedHours: current.plannedHours + row.plannedHours,
      workedHours: current.workedHours + row.workedHours,
      value: current.value + row.value,
    });
  });

  return [...summaries.values()];
}
