import type { ApprovalStatus, CaregiverCategory, Shift, Weekday } from "./enums";

export interface CaregiverAvailability {
  days: Weekday[];
  shifts: Shift[];
}

export interface Caregiver {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  city: string;
  neighborhoods: string[];
  category: CaregiverCategory;
  /** Só se aplica a categoria "tecnico" ou "superior" (ex.: "COREN 45231"). */
  councilRegistration?: string;
  councilRegistrationStatus?: ApprovalStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  activityIds: string[];
  availability: CaregiverAvailability;
  shiftRate: number;
  verified: boolean;
  bio: string;
  experienceYears: number;
}
