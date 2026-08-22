import type { ApprovalStatus } from "./enums";

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  phone: string;
  email: string;
  approvalStatus: ApprovalStatus;
  favoriteCaregiverIds: string[];
}
