import type { Invitation } from "../types";
import { isoDateTime } from "../utils/date";

export const INVITATIONS: Invitation[] = [
  { id: "iv1", attendanceId: "at1", caregiverId: "cg1", status: "accepted", createdAt: isoDateTime(-2, "09:30") },
  { id: "iv2", attendanceId: "at2", caregiverId: "cg4", status: "accepted", createdAt: isoDateTime(-1, "20:00") },
  { id: "iv3", attendanceId: "at11", caregiverId: "cg4", status: "accepted", createdAt: isoDateTime(-3, "09:00") },
  { id: "iv4", attendanceId: "at10", caregiverId: "cg9", status: "sent", createdAt: isoDateTime(-1, "18:00") },
];
