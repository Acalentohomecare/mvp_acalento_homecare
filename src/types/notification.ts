import type { NotificationType } from "./enums";

export interface Notification {
  id: string;
  toRole: "company" | "caregiver";
  toId: string;
  type: NotificationType;
  text: string;
  read: boolean;
  createdAt: string;
}
