import type {
  Activity,
  AppState,
  Caregiver,
  CaregiverAvailability,
  CaregiverCategory,
  Evaluation,
} from "../types";
import { ACTIVITIES, CATEGORY_RANK } from "../constants/activities";

/** R10: a média pública só aparece a partir da 3ª avaliação recebida. */
export const MIN_EVALUATIONS_FOR_PUBLIC_AVERAGE = 3;

export interface CaregiverRating {
  count: number;
  /** `null` enquanto a 3ª avaliação não chega (R10). */
  average: number | null;
}

/** Só avaliações feitas pela empresa contam para a reputação do cuidador. */
export function caregiverEvaluations(evaluations: Evaluation[], caregiverId: string): Evaluation[] {
  return evaluations
    .filter((e) => e.caregiverId === caregiverId && e.from === "company")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function caregiverRating(evaluations: Evaluation[], caregiverId: string): CaregiverRating {
  const received = caregiverEvaluations(evaluations, caregiverId);
  const count = received.length;
  if (count < MIN_EVALUATIONS_FOR_PUBLIC_AVERAGE) return { count, average: null };
  return { count, average: received.reduce((sum, e) => sum + e.rating, 0) / count };
}

/** O selo de verificado significa que alguma empresa já conferiu documento e selfie (R1). */
export function isVerified(caregiver: Caregiver): boolean {
  return caregiver.verified;
}

export function requiresCouncil(category: CaregiverCategory): boolean {
  return category !== "informal";
}

/** Atividades que a categoria do cuidador o autoriza a executar (base da R2). */
export function allowedActivities(category: CaregiverCategory): Activity[] {
  return ACTIVITIES.filter((a) => CATEGORY_RANK[a.minCategory] <= CATEGORY_RANK[category]);
}

export function activityNames(activityIds: string[]): string[] {
  return activityIds
    .map((id) => ACTIVITIES.find((a) => a.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

// ---------- Favoritos da empresa (Etapa 17) ----------

export function isFavorite(state: AppState, companyId: string | undefined, caregiverId: string): boolean {
  if (!companyId) return false;
  const company = state.companies.find((c) => c.id === companyId);
  return Boolean(company?.favoriteCaregiverIds.includes(caregiverId));
}

export function toggleFavorite(state: AppState, companyId: string, caregiverId: string): AppState {
  return {
    ...state,
    companies: state.companies.map((c) => {
      if (c.id !== companyId) return c;
      const has = c.favoriteCaregiverIds.includes(caregiverId);
      return {
        ...c,
        favoriteCaregiverIds: has
          ? c.favoriteCaregiverIds.filter((id) => id !== caregiverId)
          : [...c.favoriteCaregiverIds, caregiverId],
      };
    }),
  };
}

export interface CaregiverFilters {
  query: string;
  category: CaregiverCategory | "all";
  favoritesOnly?: boolean;
  favoriteIds?: string[];
}

export function filterCaregivers(
  list: Caregiver[],
  { query, category, favoritesOnly, favoriteIds = [] }: CaregiverFilters,
): Caregiver[] {
  const term = query.trim().toLowerCase();
  return list.filter((c) => {
    if (category !== "all" && c.category !== category) return false;
    if (favoritesOnly && !favoriteIds.includes(c.id)) return false;
    if (!term) return true;
    const haystack = [c.name, c.city, ...c.neighborhoods, ...(c.specialties ?? [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export interface CaregiverProfilePatch {
  bio: string;
  experienceYears: number;
  city: string;
  neighborhoods: string[];
  shiftRate: number;
  activityIds: string[];
  availability: CaregiverAvailability;
  councilRegistration?: string;
  specialties?: string[];
}

/**
 * Edição do próprio perfil pelo cuidador (tela 17). Duas regras entram aqui:
 * R3 — alterar o registro no conselho devolve o registro para conferência das empresas;
 * R12 — toda alteração de cadastro fica registrada com data, hora e responsável.
 */
export function updateCaregiverProfile(
  state: AppState,
  caregiverId: string,
  patch: CaregiverProfilePatch,
): AppState {
  const caregiver = state.caregivers.find((c) => c.id === caregiverId);
  if (!caregiver) return state;

  const needsCouncil = requiresCouncil(caregiver.category);
  const nextCouncil = needsCouncil ? patch.councilRegistration?.trim() || undefined : undefined;
  const councilChanged = needsCouncil && nextCouncil !== caregiver.councilRegistration;

  const updated: Caregiver = {
    ...caregiver,
    bio: patch.bio,
    experienceYears: patch.experienceYears,
    city: patch.city,
    neighborhoods: patch.neighborhoods,
    shiftRate: patch.shiftRate,
    activityIds: patch.activityIds,
    availability: patch.availability,
    councilRegistration: nextCouncil,
    specialties: needsCouncil ? patch.specialties : undefined,
    councilRegistrationStatus: councilChanged ? "pending" : caregiver.councilRegistrationStatus,
  };

  return {
    ...state,
    caregivers: state.caregivers.map((c) => (c.id === caregiverId ? updated : c)),
    auditLog: [
      ...state.auditLog,
      {
        id: `log_${Date.now()}`,
        action: "Cadastro alterado",
        actor: caregiver.name,
        detail: councilChanged
          ? `${caregiver.name} atualizou o perfil e alterou o registro no conselho — volta para conferência.`
          : `${caregiver.name} atualizou o perfil.`,
        createdAt: new Date().toISOString(),
        caregiverId,
      },
    ],
  };
}
