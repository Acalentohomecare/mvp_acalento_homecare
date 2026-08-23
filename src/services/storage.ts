import type { AppState, Session } from "../types";
import { seedAppState } from "../mocks/seed";

// v2: o quadro de cuidadores passou a ser da empresa (`caregiverLinks`); dados v1 não migram.
const STORAGE_KEY = "acalento:app-state:v2";
const SESSION_KEY = "acalento:session:v1";

/**
 * Camada única de acesso a dados (CLAUDE.md §15/§19). Este é o **único** módulo do projeto que
 * conhece `localStorage` — nenhuma tela fala com o navegador direto. As funções de estado são
 * assíncronas de propósito, para que uma futura `ApiService` substitua isto sem as telas saberem.
 */
export async function loadAppState(): Promise<AppState> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      // Mesclado sobre o seed: um estado salvo antes de uma coleção nova existir não quebra a demo.
      return { ...seedAppState(), ...(JSON.parse(raw) as Partial<AppState>) };
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
  clearSession();
  return seed;
}

// ---------- Sessão simulada ----------

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
