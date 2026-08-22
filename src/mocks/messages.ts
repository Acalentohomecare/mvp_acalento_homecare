import type { Message } from "../types";
import { isoDateTime } from "../utils/date";

export const MESSAGES: Message[] = [
  { id: "ms1", attendanceId: "at2", from: "company", text: "Oi Marcos, tudo certo para a sessão de quarta?", createdAt: isoDateTime(-1, "20:10") },
  { id: "ms2", attendanceId: "at2", from: "caregiver", text: "Tudo certo! Confirmo presença às 15h.", createdAt: isoDateTime(-1, "20:20") },
  { id: "ms3", attendanceId: "at6", from: "company", text: "Sandra, obrigada pelo plantão de ontem!", createdAt: isoDateTime(-9, "09:00") },
  { id: "ms4", attendanceId: "at6", from: "caregiver", text: "Fico feliz em ajudar, qualquer coisa me chamem.", createdAt: isoDateTime(-9, "09:15") },
  { id: "ms5", attendanceId: "at1", from: "company", text: "Sandra, o endereço já está liberado no seu app. Qualquer dúvida me chama.", createdAt: isoDateTime(-2, "10:05") },
  { id: "ms6", attendanceId: "at1", from: "caregiver", text: "Perfeito, chego certinho às 7h.", createdAt: isoDateTime(-2, "10:30") },
  { id: "ms7", attendanceId: "at13", from: "company", text: "Beatriz, bem-vinda ao atendimento de dona Cleide!", createdAt: isoDateTime(-1, "12:05") },
  { id: "ms8", attendanceId: "at13", from: "caregiver", text: "Obrigada! Vou chegar com antecedência para me organizar.", createdAt: isoDateTime(-1, "12:20") },
];
