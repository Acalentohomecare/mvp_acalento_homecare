import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "../types";
import { clearSession, loadSession, saveSession } from "../services/storage";

interface SessionContextValue {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  useEffect(() => {
    if (session) saveSession(session);
    else clearSession();
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, signIn: setSession, signOut: () => setSession(null) }}>
      {children}
    </SessionContext.Provider>
  );
}
