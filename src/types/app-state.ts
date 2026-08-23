import type { Activity } from "./activity";
import type { Application } from "./application";
import type { Attendance } from "./attendance";
import type { AuditLogEntry } from "./audit-log";
import type { Caregiver } from "./caregiver";
import type { Company } from "./company";
import type { DashboardAlert } from "./dashboard";
import type { Document } from "./document";
import type { Evaluation } from "./evaluation";
import type { Invitation } from "./invitation";
import type { Message } from "./message";
import type { Notification } from "./notification";
import type { Patient } from "./patient";
import type { CaregiverLink } from "./roster";
import type { AttendanceRecord } from "./record";
import type { User } from "./user";

/** Tudo que é mutável durante a demo — persistido como um único blob no localStorage. */
export interface AppState {
  users: User[];
  companies: Company[];
  caregivers: Caregiver[];
  /** Quem cada empresa aprovou para o seu quadro (R1). */
  caregiverLinks: CaregiverLink[];
  patients: Patient[];
  attendances: Attendance[];
  invitations: Invitation[];
  applications: Application[];
  evaluations: Evaluation[];
  notifications: Notification[];
  messages: Message[];
  documents: Document[];
  auditLog: AuditLogEntry[];
  dashboardAlerts: DashboardAlert[];
  records: AttendanceRecord[];
  /** Atividades que a empresa cadastrou além do catálogo padrão (`constants/activities.ts`). */
  customActivities: Activity[];
}
