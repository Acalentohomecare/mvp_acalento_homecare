import type { Notification } from "../types";
import { isoDate, isoDateTime } from "../utils/date";

export const NOTIFICATIONS: Notification[] = [
  { id: "no1", toRole: "caregiver", toId: "cg4", type: "application", text: "Sua candidatura para a sessão de fisioterapia está em análise.", read: false, createdAt: isoDateTime(-1, "20:05") },
  { id: "no2", toRole: "company", toId: "co1", type: "application", text: "Marcos Vidal se candidatou à sessão de fisioterapia de Marli Souza.", read: false, createdAt: isoDateTime(-1, "20:05") },
  { id: "no3", toRole: "company", toId: "co1", type: "new_message", text: "Nova mensagem de Sandra Oliveira sobre o atendimento de hoje.", read: true, createdAt: isoDateTime(-2, "08:00") },
  { id: "no4", toRole: "caregiver", toId: "cg9", type: "invitation", text: "Você recebeu um convite para um atendimento no bairro Jardim das Flores.", read: false, createdAt: isoDateTime(-1, "18:00") },
  { id: "no5", toRole: "company", toId: "co1", type: "confirmation", text: "Sandra Oliveira foi confirmada para o plantão de amanhã.", read: true, createdAt: isoDateTime(-2, "10:00") },
  { id: "no6", toRole: "caregiver", toId: "cg1", type: "confirmation", text: "Você foi confirmada para o plantão de amanhã. O endereço completo já está liberado.", read: true, createdAt: isoDateTime(-2, "10:01") },
  { id: "no7", toRole: "company", toId: "co1", type: "cancellation", text: "O atendimento de Marli Souza foi cancelado com menos de 12h de antecedência.", read: true, createdAt: isoDateTime(-15, "20:00") },
  { id: "no8", toRole: "caregiver", toId: "cg2", type: "reminder", text: "Lembrete: seu plantão começa amanhã às 08:00.", read: false, createdAt: isoDate(0) },
  { id: "no9", toRole: "company", toId: "co1", type: "checkin_pending", text: "Beatriz Nunes ainda não fez check-in no plantão desta manhã.", read: false, createdAt: isoDateTime(0, "07:20") },
  { id: "no10", toRole: "caregiver", toId: "cg8", type: "approval", text: "Seu cadastro foi aprovado! Você já pode receber convites.", read: true, createdAt: isoDate(-60) },
  { id: "no11", toRole: "company", toId: "co2", type: "application", text: "Fernando Lima se candidatou ao atendimento de Benedito Alves.", read: false, createdAt: isoDate(0) },
  { id: "no12", toRole: "company", toId: "co2", type: "confirmation", text: "Beatriz Nunes foi confirmada para o plantão de Cleide Aparecida.", read: true, createdAt: isoDateTime(-1, "12:01") },
];
