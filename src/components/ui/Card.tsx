import type { HTMLAttributes } from "react";

/**
 * Superfície elevada padrão (docs/DESIGN_SYSTEM.md, seção 7). Borda clara + sombra azulada
 * rasa: o card precisa se destacar de `--surface` sem virar uma caixa pesada numa lista de
 * quinze plantões.
 */
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-linha bg-surface-raised p-3.5 shadow-card ${className}`}
      {...props}
    />
  );
}
