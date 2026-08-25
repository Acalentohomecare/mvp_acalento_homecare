import type { Evaluation } from "../types";
import { isoDate } from "../utils/date";

/**
 * 13 avaliações, todas **da empresa sobre o cuidador** — a única direção que existe no produto.
 *
 * cg1 tem 6 e cg4/cg5 têm 3 (média pública visível, R10); cg2 fica propositalmente com
 * 1 só, para demonstrar a média ainda não liberada. Eram 12 enquanto o cuidador também podia
 * avaliar a empresa, mas aquelas duas nunca entraram em conta nenhuma — `caregiverEvaluations` já
 * as descartava —, então removê-las não mudou nenhuma nota exibida na demo.
 *
 * As entradas "hist-*" representam histórico anterior ao período visível na demo — não têm um
 * Attendance correspondente nos 19 registros, de propósito (histórico anterior ao dataset atual).
 */
export const EVALUATIONS: Evaluation[] = [
  { id: "ev1", attendanceId: "at5", caregiverId: "cg5", rating: 5, comment: "Excelente cuidado técnico.", createdAt: isoDate(-5) },
  { id: "ev3", attendanceId: "at6", caregiverId: "cg1", rating: 5, comment: "Sandra é atenciosa e pontual.", createdAt: isoDate(-9) },
  { id: "ev5", attendanceId: "hist-a", caregiverId: "cg1", rating: 5, comment: "Ótimo atendimento em plantão anterior.", createdAt: isoDate(-40) },
  { id: "ev6", attendanceId: "hist-b", caregiverId: "cg1", rating: 4, comment: "Muito boa, pequeno atraso uma vez.", createdAt: isoDate(-25) },
  { id: "ev7", attendanceId: "hist-c", caregiverId: "cg5", rating: 4, comment: "Boa técnica, mantém tudo documentado.", createdAt: isoDate(-30) },
  { id: "ev8", attendanceId: "hist-d", caregiverId: "cg5", rating: 5, comment: "Muito cuidadosa com a medicação.", createdAt: isoDate(-18) },
  { id: "ev9", attendanceId: "hist-e", caregiverId: "cg4", rating: 5, comment: "Fisioterapia excelente, paciente evoluiu rápido.", createdAt: isoDate(-35) },
  { id: "ev10", attendanceId: "hist-f", caregiverId: "cg4", rating: 4, comment: "Pontual e comunicativo.", createdAt: isoDate(-20) },
  { id: "ev11", attendanceId: "hist-g", caregiverId: "cg4", rating: 5, comment: "Recomendamos para outros pacientes.", createdAt: isoDate(-12) },
  { id: "ev12", attendanceId: "hist-h", caregiverId: "cg2", rating: 5, comment: "Muito cuidadosa.", createdAt: isoDate(-20) },
  { id: "ev13", attendanceId: "at17", caregiverId: "cg1", rating: 5, comment: "Sempre pontual e muito atenciosa com dona Iracema.", createdAt: isoDate(-6) },
  { id: "ev14", attendanceId: "at18", caregiverId: "cg1", rating: 5, comment: "Cuidado excelente e comunicação clara com a família.", createdAt: isoDate(-16) },
  { id: "ev15", attendanceId: "at19", caregiverId: "cg1", rating: 4, comment: "Bom plantão, sem intercorrências.", createdAt: isoDate(-37) },
];
