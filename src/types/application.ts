import type { ApplicationStatus } from "./enums";

export interface Application {
  id: string;
  attendanceId: string;
  caregiverId: string;
  status: ApplicationStatus;
  createdAt: string;
}
