import type { User } from "../types";

/**
 * Contas de demonstração (CLAUDE.md §10). As duas oficiais usam exatamente os e-mails
 * documentados; as demais contas de cuidador existem para explorar as diferentes categorias.
 */
export const USERS: User[] = [
  { id: "us1", name: "Acalento Gestão", email: "empresa@demo.com", password: "123456", role: "company", companyId: "co1" },
  { id: "us2", name: "Cuidar Bem Serviços de Home Care", email: "empresa2@demo.com", password: "123456", role: "company", companyId: "co2" },
  { id: "us3", name: "Sandra Oliveira", email: "cuidador@demo.com", password: "123456", role: "caregiver", caregiverId: "cg1" },
  { id: "us4", name: "Beatriz Nunes", email: "beatriz@demo.com", password: "123456", role: "caregiver", caregiverId: "cg2" },
  { id: "us5", name: "Marcos Vidal", email: "marcos@demo.com", password: "123456", role: "caregiver", caregiverId: "cg4" },
  { id: "us6", name: "Juliana Prado", email: "juliana@demo.com", password: "123456", role: "caregiver", caregiverId: "cg5" },
  { id: "us7", name: "Fernando Lima", email: "fernando@demo.com", password: "123456", role: "caregiver", caregiverId: "cg8" },
  { id: "us8", name: "Débora Nascimento", email: "debora@demo.com", password: "123456", role: "caregiver", caregiverId: "cg9" },
];
