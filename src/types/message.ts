export interface Message {
  id: string;
  attendanceId: string;
  from: "company" | "caregiver";
  text: string;
  createdAt: string;
}
