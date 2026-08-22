import type { UserRole } from "./enums";

/** Identidade de quem está logado — persistida separadamente do AppState (CLAUDE.md §15). */
export interface Session {
  userId: string;
  role: UserRole;
  companyId?: string;
  caregiverId?: string;
}
