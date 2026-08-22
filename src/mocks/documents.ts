import type { Document } from "../types";
import { isoDate } from "../utils/date";

export const DOCUMENTS: Document[] = [
  { id: "doc1", ownerType: "caregiver", ownerId: "cg3", kind: "id_document", status: "pending", createdAt: isoDate(-1) },
  { id: "doc2", ownerType: "caregiver", ownerId: "cg6", kind: "council_registration", status: "pending", createdAt: isoDate(-2) },
  { id: "doc3", ownerType: "caregiver", ownerId: "cg10", kind: "council_registration", status: "approved", createdAt: isoDate(-90) },
  { id: "doc4", ownerType: "company", ownerId: "co1", kind: "cnpj_card", status: "approved", createdAt: isoDate(-120) },
  { id: "doc5", ownerType: "company", ownerId: "co2", kind: "cnpj_card", status: "approved", createdAt: isoDate(-80) },
];
