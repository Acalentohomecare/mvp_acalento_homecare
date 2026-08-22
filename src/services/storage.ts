import type { AppState } from "../types";
import { seedAppState } from "../mocks/seed";

const STORAGE_KEY = "acalento:app-state:v1";

/**
 * Camada de persistência (CLAUDE.md §15/§19). Hoje é `localStorage`; assíncrona de propósito
 * para que uma futura `ApiService` substitua isto sem as telas saberem a diferença.
 */
export async function loadAppState(): Promise<AppState> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AppState;
    } catch {
      // JSON corrompido — cai para o seed abaixo.
    }
  }
  const seed = seedAppState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export async function saveAppState(state: AppState): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Restaura a demo ao dataset inicial (CLAUDE.md §16 — "Restaurar dados da demonstração"). */
export async function resetAppState(): Promise<AppState> {
  const seed = seedAppState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
