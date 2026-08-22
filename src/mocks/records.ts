import type { AttendanceRecord } from "../types";
import { isoDateTime } from "../utils/date";

/** Registros dos atendimentos já encerrados do dataset, para o histórico não nascer vazio. */
export const RECORDS: AttendanceRecord[] = [
  {
    attendanceId: "at5",
    completedActivityIds: ["sinais_vitais", "curativos"],
    observations: [
      {
        id: "ob1",
        text: "Curativo trocado às 10h e às 22h. Paciente sem queixa de dor.",
        createdAt: isoDateTime(-5, "06:50"),
        afterCheckout: false,
      },
    ],
    vitals: { bloodPressure: "130/80", heartRate: "72 bpm", temperature: "36,4 °C" },
    photos: ["curativo-manha.jpg"],
    closedAt: isoDateTime(-5, "07:03"),
  },
  {
    attendanceId: "at6",
    completedActivityIds: ["higiene", "alimentacao", "locomocao"],
    observations: [
      {
        id: "ob2",
        text: "Dona Marli aceitou bem todas as refeições e caminhou pelo corredor duas vezes.",
        createdAt: isoDateTime(-10, "18:40"),
        afterCheckout: false,
      },
    ],
    photos: [],
    closedAt: isoDateTime(-10, "19:05"),
  },
  {
    attendanceId: "at12",
    completedActivityIds: ["higiene", "alimentacao", "companhia"],
    observations: [
      {
        id: "ob3",
        text: "Noite tranquila, sem intercorrências.",
        createdAt: isoDateTime(-2, "06:55"),
        afterCheckout: false,
      },
      {
        id: "ob4",
        text: "Correção: a medicação da manhã foi administrada pela esposa, não por mim.",
        createdAt: isoDateTime(-2, "09:30"),
        afterCheckout: true,
      },
    ],
    photos: [],
    closedAt: isoDateTime(-2, "07:10"),
  },
];
