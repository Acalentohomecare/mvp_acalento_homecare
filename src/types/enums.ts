/** A demo tem dois perfis: a empresa que opera o Home Care e o cuidador. Não existe administrador de plataforma. */
export type UserRole = "company" | "caregiver";

export type CaregiverCategory = "informal" | "tecnico" | "superior";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "blocked";

export type AttendanceType = "shift12" | "shift24" | "hourly" | "single_session";

export type AttendanceStatus =
  | "draft"
  | "open"
  | "invited"
  | "applications_received"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "evaluated"
  | "cancelled";

export type InvitationStatus = "sent" | "accepted" | "rejected";

export type ApplicationStatus = "pending" | "confirmed" | "not_selected";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Shift = "morning" | "afternoon" | "night" | "shift12" | "shift24";

export type NotificationType =
  | "invitation"
  | "confirmation"
  | "reminder"
  | "cancellation"
  | "checkin_pending"
  | "new_message"
  | "application"
  | "approval"
  | "delay";
