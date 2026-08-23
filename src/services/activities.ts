import type { Activity, AppState, CaregiverCategory } from "../types";
import { ACTIVITIES } from "../constants/activities";

/**
 * Catálogo completo: o fixo (`constants/activities.ts`) mais o que as empresas cadastraram em
 * "Novo atendimento". Compartilhado entre empresas de propósito, como o catálogo fixo já é — não
 * existe um "quadro de atividades" por empresa no produto.
 */
export function allActivities(state: AppState): Activity[] {
  return [...ACTIVITIES, ...state.customActivities];
}

export interface NewActivityInput {
  name: string;
  minCategory: CaregiverCategory;
}

export function createCustomActivity(
  state: AppState,
  input: NewActivityInput,
): { activity: Activity; nextState: AppState } {
  const activity: Activity = { id: `custom_${Date.now()}`, name: input.name, minCategory: input.minCategory };
  return {
    activity,
    nextState: { ...state, customActivities: [...state.customActivities, activity] },
  };
}
