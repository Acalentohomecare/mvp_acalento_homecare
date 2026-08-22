import type { AttendanceStatus, AttendanceType } from "./enums";

export interface AttendanceCancellation {
  by: "company" | "caregiver";
  at: string;
  reason: string;
  noticeHours: number;
}

export interface Attendance {
  id: string;
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
  status: AttendanceStatus;
  openApplications: boolean;
  confirmedCaregiverId?: string;
  checkinAt?: string;
  checkinLocation?: string;
  checkoutAt?: string;
  cancellation?: AttendanceCancellation;
  createdAt: string;
}

/** Projeção derivada de Attendance para as telas de agenda/escala — não é uma coleção própria. */
export interface ScheduleEntry {
  attendanceId: string;
  date: string;
  startTime: string;
  durationHours: number;
  status: AttendanceStatus;
  caregiverId?: string;
  patientId: string;
}
