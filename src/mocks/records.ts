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
  {
    attendanceId: "at16",
    completedActivityIds: ["higiene", "alimentacao", "companhia"],
    observations: [
      {
        id: "ob10",
        text: "Dia tranquilo. Dona Marli almoçou bem e ficou na sala assistindo TV à tarde.",
        createdAt: isoDateTime(-3, "18:50"),
        afterCheckout: false,
      },
    ],
    photos: [],
    closedAt: isoDateTime(-3, "19:02"),
  },
  {
    attendanceId: "at17",
    completedActivityIds: ["higiene", "alimentacao", "locomocao"],
    observations: [
      {
        id: "ob11",
        text: "Dona Iracema caminhou até o quintal com apoio. Aparelho auditivo funcionando bem.",
        createdAt: isoDateTime(-7, "18:55"),
        afterCheckout: false,
      },
    ],
    photos: [],
    closedAt: isoDateTime(-7, "19:10"),
  },
  {
    attendanceId: "at18",
    completedActivityIds: ["higiene", "alimentacao", "companhia"],
    observations: [
      {
        id: "ob12",
        text: "Dona Cleide usou o andador sem dificuldade. Filho passou no fim da tarde.",
        createdAt: isoDateTime(-17, "18:45"),
        afterCheckout: false,
      },
    ],
    photos: [],
    closedAt: isoDateTime(-17, "19:00"),
  },
  {
    attendanceId: "at19",
    completedActivityIds: ["higiene", "alimentacao", "companhia"],
    observations: [
      {
        id: "ob13",
        text: "Plantão sem intercorrências. Medicação administrada nos horários.",
        createdAt: isoDateTime(-38, "18:58"),
        afterCheckout: false,
      },
    ],
    photos: [],
    closedAt: isoDateTime(-38, "19:04"),
  },
];
