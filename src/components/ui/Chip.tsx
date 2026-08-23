import type { ButtonHTMLAttributes } from "react";

type Modo = "unico" | "multiplo";

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> {
  selecionado: boolean;
  /**
   * `unico` — filtro em que só um item fica aceso por vez (abas, período, categoria).
   * `multiplo` — seleção em que vários ficam acesos juntos (dias, turnos).
   */
  modo?: Modo;
}

/**
 * Chip de filtro e de seleção (docs/DESIGN_SYSTEM.md, seção 9.3).
 *
 * Existia copiado em oito telas, e as cópias já divergiam: todas usavam `duration-200`, que a
 * seção 6 reserva para o que muda de **tamanho** — chip só muda de cor, e cor anda em 150ms.
 *
 * A distinção entre os dois modos não é estética. Sete pastilhas azuis sólidas lado a lado (os
 * dias da semana, todos marcados) pesam mais que o formulário inteiro; por isso o chip cheio
 * fica reservado ao filtro onde só um item está aceso por vez, e a seleção múltipla usa o fundo
 * suave.
 */
const SELECIONADO: Record<Modo, string> = {
  unico: "bg-accent text-accent-ink shadow-card",
  multiplo: "border border-accent/35 bg-accent-soft text-accent",
};

const INATIVO =
  "border border-linha bg-surface-raised text-ink-muted hover:border-accent/45 hover:text-ink";

export function Chip({
  selecionado,
  modo = "unico",
  className = "",
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      /* min-h-11 é o alvo de toque de 44px (seção 11); a partir de `md` o ponteiro é preciso e
         o chip volta a encolher, senão uma fila de filtros vira uma barra de botões gordos. */
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-note font-semibold transition-colors duration-150 ease-out md:min-h-8 md:px-3 ${
        selecionado ? SELECIONADO[modo] : INATIVO
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
