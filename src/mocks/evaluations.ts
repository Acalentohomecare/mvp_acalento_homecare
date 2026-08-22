import type { Evaluation } from "../types";
import { isoDate } from "../utils/date";

/**
 * 12 avaliações no total. cg1, cg4 e cg5 chegam a 3+ avaliações de empresa (média pública visível,
 * R10); cg2 fica propositalmente com 1 avaliação só, para demonstrar a média ainda não liberada.
 * As entradas "hist-*" representam histórico anterior ao período visível na demo — não têm um
 * Attendance correspondente nos 15 registros, de propósito (histórico anterior ao dataset atual).
 */
export const EVALUATIONS: Evaluation[] = [
  { id: "ev1", attendanceId: "at5", from: "company", caregiverId: "cg5", rating: 5, comment: "Excelente cuidado técnico.", createdAt: isoDate(-5) },
  { id: "ev2", attendanceId: "at5", from: "caregiver", caregiverId: "cg5", rating: 5, comment: "Empresa muito organizada e comunicativa.", createdAt: isoDate(-5) },
  { id: "ev3", attendanceId: "at6", from: "company", caregiverId: "cg1", rating: 5, comment: "Sandra é atenciosa e pontual.", createdAt: isoDate(-9) },
  { id: "ev4", attendanceId: "at6", from: "caregiver", caregiverId: "cg1", rating: 5, comment: "Equipe sempre solícita, ótima parceria.", createdAt: isoDate(-9) },
  { id: "ev5", attendanceId: "hist-a", from: "company", caregiverId: "cg1", rating: 5, comment: "Ótimo atendimento em plantão anterior.", createdAt: isoDate(-40) },
  { id: "ev6", attendanceId: "hist-b", from: "company", caregiverId: "cg1", rating: 4, comment: "Muito boa, pequeno atraso uma vez.", createdAt: isoDate(-25) },
  { id: "ev7", attendanceId: "hist-c", from: "company", caregiverId: "cg5", rating: 4, comment: "Boa técnica, mantém tudo documentado.", createdAt: isoDate(-30) },
  { id: "ev8", attendanceId: "hist-d", from: "company", caregiverId: "cg5", rating: 5, comment: "Muito cuidadosa com a medicação.", createdAt: isoDate(-18) },
  { id: "ev9", attendanceId: "hist-e", from: "company", caregiverId: "cg4", rating: 5, comment: "Fisioterapia excelente, paciente evoluiu rápido.", createdAt: isoDate(-35) },
  { id: "ev10", attendanceId: "hist-f", from: "company", caregiverId: "cg4", rating: 4, comment: "Pontual e comunicativo.", createdAt: isoDate(-20) },
  { id: "ev11", attendanceId: "hist-g", from: "company", caregiverId: "cg4", rating: 5, comment: "Recomendamos para outros pacientes.", createdAt: isoDate(-12) },
  { id: "ev12", attendanceId: "hist-h", from: "company", caregiverId: "cg2", rating: 5, comment: "Muito cuidadosa.", createdAt: isoDate(-20) },
];
