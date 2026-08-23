import { createContext } from "react";

export type ToastTom = "sucesso" | "erro";

export interface ToastContextValue {
  /** Confirma uma ação cujo efeito não está visível na tela (DESIGN_SYSTEM.md, seção 8.4). */
  avisar: (texto: string, tom?: ToastTom) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
