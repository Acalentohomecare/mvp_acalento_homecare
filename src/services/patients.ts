import type { AppState, Patient } from "../types";

/** Isolamento de dados: a empresa só enxerga os próprios pacientes. */
export function companyPatients(state: AppState, companyId: string | undefined): Patient[] {
  if (!companyId) return [];
  return state.patients.filter((p) => p.companyId === companyId);
}

/** Separa "Rua das Acácias, 245" em logradouro e número para preencher o endereço do atendimento. */
export function splitAddress(address: string): { street: string; number: string } {
  const at = address.lastIndexOf(",");
  if (at === -1) return { street: address.trim(), number: "" };
  return { street: address.slice(0, at).trim(), number: address.slice(at + 1).trim() };
}

export interface NewPatientInput {
  companyId: string;
  name: string;
  age: number;
  city: string;
  neighborhood: string;
  address: string;
  guardianName?: string;
  notes?: string;
  walksAlone: boolean;
  usesOxygen: boolean;
  usesFeedingTube: boolean;
  petsAtHome: string;
}

export function createPatient(
  state: AppState,
  input: NewPatientInput,
): { patient: Patient; nextState: AppState } {
  const patient: Patient = { id: `pt_${Date.now()}`, ...input };
  return { patient, nextState: { ...state, patients: [...state.patients, patient] } };
}
