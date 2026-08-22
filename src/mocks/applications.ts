import type { Application } from "../types";
import { isoDateTime } from "../utils/date";

export const APPLICATIONS: Application[] = [
  { id: "ap1", attendanceId: "at2", caregiverId: "cg4", status: "pending", createdAt: isoDateTime(-1, "20:05") },
  { id: "ap2", attendanceId: "at1", caregiverId: "cg1", status: "confirmed", createdAt: isoDateTime(-2, "10:00") },
  { id: "ap3", attendanceId: "at11", caregiverId: "cg4", status: "confirmed", createdAt: isoDateTime(-3, "09:05") },
  { id: "ap4", attendanceId: "at13", caregiverId: "cg2", status: "confirmed", createdAt: isoDateTime(-1, "12:00") },
  { id: "ap5", attendanceId: "at13", caregiverId: "cg5", status: "not_selected", createdAt: isoDateTime(-1, "13:00") },
  { id: "ap6", attendanceId: "at14", caregiverId: "cg8", status: "pending", createdAt: isoDateTime(0, "08:30") },
];
