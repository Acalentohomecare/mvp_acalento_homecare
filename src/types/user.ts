import type { UserRole } from "./enums";

/** Identidade de autenticação simulada. `companyId`/`caregiverId` apontam para o perfil real. */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyId?: string;
  caregiverId?: string;
}
