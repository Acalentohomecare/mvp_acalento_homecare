import type { InvitationStatus } from "./enums";

export interface Invitation {
  id: string;
  attendanceId: string;
  caregiverId: string;
  status: InvitationStatus;
  createdAt: string;
}
