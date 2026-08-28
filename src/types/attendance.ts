import type { AttendanceStatus, AttendanceType, CaregiverCategory } from "./enums";

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
  /**
   * Escala fixa: o id que amarra os dias gerados por uma mesma publicação.
   *
   * Não existe entidade "escala" — a série é a coleção de atendimentos que compartilham este id,
   * e tudo que a interface mostra sobre ela (período, dias da semana, quantidade) é derivado dos
   * membros. Um atendimento avulso simplesmente não tem `seriesId`.
   *
   * O dia continua sendo a unidade de operação: cada membro tem o próprio check-in, o próprio
   * registro e a própria avaliação. O que vale para a escala inteira é a **contratação** —
   * convite, aceite e confirmação acontecem de uma vez para todos os dias.
   */
  seriesId?: string;
  activityIds: string[];
  /** Escolhido por quem publica o atendimento — não é derivado das atividades marcadas. */
  requiredCategory: CaregiverCategory;
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
