import { createContext, useEffect, useState, type ReactNode } from "react";
import type { AppState } from "../types";
import { loadAppState, resetAppState, saveAppState } from "../services/storage";

type StateUpdater = AppState | ((prev: AppState) => AppState);

interface AppStateContextValue {
  state: AppState | null;
  setState: (updater: StateUpdater) => void;
  reset: () => Promise<void>;
}

export const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState | null>(null);

  useEffect(() => {
    loadAppState().then(setStateRaw);
  }, []);

  const setState = (updater: StateUpdater) => {
    setStateRaw((prev) => {
      if (!prev) return prev;
      const next = typeof updater === "function" ? (updater as (p: AppState) => AppState)(prev) : updater;
      saveAppState(next);
      return next;
    });
  };

  const reset = async () => {
    const seed = await resetAppState();
    setStateRaw(seed);
  };

  return (
    <AppStateContext.Provider value={{ state, setState, reset }}>{children}</AppStateContext.Provider>
  );
}
