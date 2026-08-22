/** Paciente é uma entidade própria da Empresa (CLAUDE.md §21), não mais um campo embutido no Atendimento. */
export interface Patient {
  id: string;
  companyId: string;
  name: string;
  age: number;
  birthDate?: string;
  guardianName?: string;
  city: string;
  neighborhood: string;
  address: string;
  notes?: string;
  walksAlone: boolean;
  usesOxygen: boolean;
  usesFeedingTube: boolean;
  petsAtHome: string;
}
