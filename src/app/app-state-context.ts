import { createContext } from "react";
import type { AppState } from "../types";

export type StateUpdater = AppState | ((prev: AppState) => AppState);

export interface AppStateContextValue {
  state: AppState | null;
  setState: (updater: StateUpdater) => void;
  reset: () => Promise<void>;
}

/*
 * Mora fora do `AppStateProvider` pelo mesmo motivo do `ui/toast-context.ts`: um módulo que
 * exporta componente **e** valor derruba o fast refresh do Vite — a cada edição do provedor, o
 * estado inteiro da demonstração era recarregado do zero.
 */
export const AppStateContext = createContext<AppStateContextValue | null>(null);
