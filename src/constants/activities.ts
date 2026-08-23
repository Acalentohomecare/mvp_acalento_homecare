import type { Activity } from "../types";

/** Catálogo de atividades disponíveis para um atendimento (CLAUDE.md §23). */
export const ACTIVITIES: Activity[] = [
  { id: "higiene", name: "Higiene e banho", minCategory: "informal" },
  { id: "alimentacao", name: "Alimentação", minCategory: "informal" },
  { id: "locomocao", name: "Apoio para locomoção", minCategory: "informal" },
  { id: "companhia", name: "Companhia e acompanhamento", minCategory: "informal" },
  {
    id: "lembrete_medicacao",
    name: "Lembrete de medicação já separada",
    minCategory: "informal",
  },
  { id: "sinais_vitais", name: "Verificação de sinais vitais", minCategory: "tecnico" },
  { id: "medicacao_prescrita", name: "Administração de medicação prescrita", minCategory: "tecnico" },
  { id: "curativos", name: "Curativos simples", minCategory: "tecnico" },
  { id: "fisioterapia", name: "Sessão de fisioterapia", minCategory: "superior" },
  { id: "visita_enfermagem", name: "Avaliação e visita de enfermagem", minCategory: "superior" },
  { id: "plano_cuidado", name: "Plano de cuidado", minCategory: "superior" },
];

/**
 * Hierarquia de formação: uma categoria executa tudo que as anteriores executam.
 *
 * Só governa o que um cuidador pode listar como atividade própria (`allowedActivities`, usada no
 * perfil do cuidador) e a comparação de categoria no matching. O perfil necessário de um
 * atendimento não vem mais daqui — é escolhido por quem publica (`Attendance.requiredCategory`).
 */
export const CATEGORY_RANK: Record<Activity["minCategory"], number> = {
  informal: 0,
  tecnico: 1,
  superior: 2,
};
