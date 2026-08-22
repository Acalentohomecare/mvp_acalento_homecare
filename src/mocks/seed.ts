import type { AppState } from "../types";
import { USERS } from "./users";
import { COMPANIES } from "./companies";
import { CAREGIVERS } from "./caregivers";
import { PATIENTS } from "./patients";
import { ATTENDANCES } from "./attendances";
import { INVITATIONS } from "./invitations";
import { APPLICATIONS } from "./applications";
import { EVALUATIONS } from "./evaluations";
import { NOTIFICATIONS } from "./notifications";
import { MESSAGES } from "./messages";
import { DOCUMENTS } from "./documents";
import { AUDIT_LOG } from "./audit-log";

/** Estado inicial da demo. Clonado para que mutações em runtime nunca alterem os mocks originais. */
export function seedAppState(): AppState {
  return structuredClone({
    users: USERS,
    companies: COMPANIES,
    caregivers: CAREGIVERS,
    patients: PATIENTS,
    attendances: ATTENDANCES,
    invitations: INVITATIONS,
    applications: APPLICATIONS,
    evaluations: EVALUATIONS,
    notifications: NOTIFICATIONS,
    messages: MESSAGES,
    documents: DOCUMENTS,
    auditLog: AUDIT_LOG,
  });
}
