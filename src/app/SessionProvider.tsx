import { createContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "../types";

const SESSION_KEY = "acalento:session:v1";

interface SessionContextValue {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, signIn: setSession, signOut: () => setSession(null) }}>
      {children}
    </SessionContext.Provider>
  );
}
