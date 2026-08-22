import type { AppState, Attendance, Caregiver, Shift } from "../types";
import { CATEGORY_RANK } from "../constants/activities";
import { attendanceRequiredCategory } from "./attendances";
import { caregiverRating } from "./caregivers";

/**
 * Quem pode ser oferecido para este atendimento:
 * R1 — cadastro precisa estar aprovado;
 * R2 — atendimento que exige formação nunca lista cuidador de categoria inferior;
 * R3 — técnico/superior só entra com o registro no conselho conferido.
 * Ordenação: proximidade (bairro), histórico com a empresa, avaliação.
 */
export function compatibleCaregivers(state: AppState, attendance: Attendance): Caregiver[] {
  const required = attendanceRequiredCategory(attendance.activityIds);

  const pool = state.caregivers.filter((c) => {
    if (c.approvalStatus !== "approved") return false;
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
