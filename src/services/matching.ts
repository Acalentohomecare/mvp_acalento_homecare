import type { AppState, Attendance, Caregiver, Shift } from "../types";
import { CATEGORY_RANK } from "../constants/activities";
import { attendanceStart } from "./attendances";
import { caregiverRating } from "./caregivers";
import { rosterCaregivers } from "./roster";

/**
 * Quem pode ser oferecido para este atendimento:
 * R1 — o cuidador precisa estar aprovado no quadro desta empresa;
 * R2 — atendimento que exige formação nunca lista cuidador de categoria inferior a
 * `attendance.requiredCategory` (escolhida por quem publicou);
 * R3 — técnico/superior só entra com o registro no conselho conferido.
 * Ordenação: favoritos, proximidade (bairro), histórico com a empresa, avaliação.
 */
export function compatibleCaregivers(state: AppState, attendance: Attendance): Caregiver[] {
  const required = attendance.requiredCategory;

  const pool = rosterCaregivers(state, attendance.companyId).filter((c) => {
    if (CATEGORY_RANK[c.category] < CATEGORY_RANK[required]) return false;
    if (c.category !== "informal" && c.councilRegistrationStatus !== "approved") return false;
    return true;
  });

  const favorites =
    state.companies.find((c) => c.id === attendance.companyId)?.favoriteCaregiverIds ?? [];

  const favorite = (c: Caregiver) => (favorites.includes(c.id) ? 1 : 0);
  const nearby = (c: Caregiver) => (c.neighborhoods.includes(attendance.neighborhood) ? 1 : 0);
  const history = (id: string) =>
    state.attendances.filter((a) => a.companyId === attendance.companyId && a.confirmedCaregiverId === id)
      .length;
  const rating = (id: string) => caregiverRating(state.evaluations, id).average ?? 0;

  // Favoritos primeiro (Etapa 17), depois proximidade, histórico e avaliação.
  return [...pool].sort(
    (a, b) =>
      favorite(b) - favorite(a) ||
      nearby(b) - nearby(a) ||
      history(b.id) - history(a.id) ||
      rating(b.id) - rating(a.id),
  );
}

/**
 * A fila de "Em aberto" do Início, na ordem em que a coordenadora precisa agir.
 *
 * `awaitingCaregiverAttendances` entrega por data de início, e essa é a ordem certa na tela de
 * Atendimentos: lá a pessoa está lendo a escala, e escala se lê no tempo. No Início a pergunta é
 * outra — *qual destes eu não vou conseguir resolver do jeito normal?*
 *
 * Um plantão sem **nenhum** cuidador compatível no quadro (R1, R2 e R3 somados) não se resolve
 * buscando cuidador: não há quem buscar. Ele se resolve aprovando alguém para o quadro, que é
 * outra tela, outra decisão e um prazo bem maior — depende do cadastro do cuidador e da conferência
 * dos documentos. Na ordem por data ele fica onde a data o colocou, no meio da fila, e é
 * justamente o que precisa de mais antecedência.
 *
 * Empatados, a data volta a mandar: entre dois plantões igualmente resolvíveis, o mais próximo é
 * o mais urgente.
 *
 * A regra mora aqui, e não na tela, porque é a mesma pergunta que o `note` da linha já responde
 * ("Nenhum cuidador compatível no quadro"). Ordem e recado saindo do mesmo lugar é o que evita a
 * lista dizer uma coisa na posição e outra no texto.
 */
export function awaitingByUrgency(state: AppState, list: Attendance[]): Attendance[] {
  /* A compatibilidade é medida uma vez por atendimento, antes de ordenar. Dentro do comparador
     ela rodaria O(n log n) vezes e cada chamada varre o quadro inteiro da empresa. */
  const semQuadro = new Map(
    list.map((a) => [a.id, compatibleCaregivers(state, a).length === 0] as const),
  );
  const travado = (a: Attendance) => (semQuadro.get(a.id) ? 1 : 0);

  return [...list].sort(
    (a, b) =>
      travado(b) - travado(a) ||
      attendanceStart(a).getTime() - attendanceStart(b).getTime(),
  );
}

export interface MatchFilters {
  query: string;
  shift: Shift | "all";
  maxRate: string;
}

export function filterMatches(list: Caregiver[], { query, shift, maxRate }: MatchFilters): Caregiver[] {
  const term = query.trim().toLowerCase();
  const limit = Number(maxRate);

  return list.filter((c) => {
    if (shift !== "all" && !c.availability.shifts.includes(shift)) return false;
    if (limit > 0 && c.shiftRate > limit) return false;
    if (!term) return true;
    return [c.name, ...c.neighborhoods, ...(c.specialties ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });
}
