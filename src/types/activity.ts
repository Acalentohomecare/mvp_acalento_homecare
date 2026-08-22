import type { CaregiverCategory } from "./enums";

/** Catálogo de atividades de um atendimento; `minCategory` determina a categoria mínima exigida. */
export interface Activity {
  id: string;
  name: string;
  minCategory: CaregiverCategory;
}
