export interface Evaluation {
  id: string;
  attendanceId: string;
  from: "company" | "caregiver";
  caregiverId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}
