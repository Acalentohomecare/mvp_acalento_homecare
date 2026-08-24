import type { AppState, Caregiver, CaregiverCategory, User } from "../types";

export interface AuthResult {
  user: User;
}

/** Autenticação simulada (CLAUDE.md §10) — confere e-mail/senha contra `state.users`. */
export function login(state: AppState, email: string, password: string): AuthResult | null {
  const user = state.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  return user ? { user } : null;
}

export interface RegisterCaregiverInput {
  name: string;
  email: string;
  password: string;
  category: CaregiverCategory;
  cpf: string;
  /** Só chega preenchido para categoria "tecnico" ou "superior". */
  councilRegistration?: string;
}

const DEFAULT_ACTIVITIES: Record<CaregiverCategory, string[]> = {
  informal: ["higiene", "companhia"],
  tecnico: ["sinais_vitais"],
  superior: ["visita_enfermagem"],
};

/**
 * Cadastro simulado de um novo cuidador (CLAUDE.md §41). Retorna o próximo AppState em vez de
 * mutar — quem chama decide como persistir (via AppStateProvider), mantendo uma única fonte
 * de verdade para o estado.
 *
 * O cuidador nasce sem vínculo — ou seja, em análise na fila de todas as empresas. Quem aprova
 * é a empresa que vai colocá-lo em plantão (`services/roster.ts`).
 */
export function registerCaregiver(
  state: AppState,
  input: RegisterCaregiverInput,
): { user: User; caregiver: Caregiver; nextState: AppState } {
  const id = `cg_${Date.now()}`;
  const requiresCouncil = input.category !== "informal";

  const caregiver: Caregiver = {
    id,
    name: input.name,
    cpf: input.cpf,
    birthDate: "2000-01-01",
    city: "Cidade Média",
    neighborhoods: ["Centro"],
    category: input.category,
    councilRegistration: requiresCouncil ? input.councilRegistration : undefined,
    councilRegistrationStatus: requiresCouncil ? "pending" : undefined,
    activityIds: DEFAULT_ACTIVITIES[input.category],
    availability: { days: ["mon", "tue", "wed"], shifts: ["morning"] },
    shiftRate: 180,
    verified: false,
    bio: "Cadastro recém-criado na demo.",
    experienceYears: 0,
  };

  const user: User = {
    id: `us_${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: "caregiver",
    caregiverId: id,
  };

  const nextState: AppState = {
    ...state,
    caregivers: [...state.caregivers, caregiver],
    users: [...state.users, user],
    auditLog: [
      ...state.auditLog,
      {
        id: `log_${Date.now()}`,
        action: "Cadastro criado",
        actor: "Sistema",
        detail: `${input.name} criou cadastro de cuidador (${input.category}).`,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  return { user, caregiver, nextState };
}
