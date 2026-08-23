import { createContext } from "react";
import type { Session } from "../types";

export interface SessionContextValue {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
}

/* Ver `app-state-context.ts`: contexto separado do componente para o fast refresh funcionar. */
export const SessionContext = createContext<SessionContextValue | null>(null);
