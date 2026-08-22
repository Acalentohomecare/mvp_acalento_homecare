import type { ApprovalStatus } from "./enums";

export type DocumentKind = "id_document" | "selfie" | "cnpj_card" | "council_registration";

/** Documento simulado do cadastro (upload é apenas visual — CLAUDE.md §41). */
export interface Document {
  id: string;
  ownerType: "company" | "caregiver";
  ownerId: string;
  kind: DocumentKind;
  status: ApprovalStatus;
  createdAt: string;
}
