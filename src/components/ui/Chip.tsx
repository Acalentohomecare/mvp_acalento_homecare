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
 *
 * **O chip deixou de ser pílula.** Raio de 999px é a forma que este produto tirou de circulação na
 * revisão do módulo de Atendimentos: virou o `--radius-control` de 6px, o mesmo de botão e campo,
 * porque chip **é** um controle e não uma etiqueta. A sombra da variante acesa saiu junto — a
 * seleção já é dita por cor cheia, e sombra passou a significar só elevação de verdade.
 *
 * Para escolher **um** recorte entre vários — as abas de uma lista — quem entra agora é `<Tabs>`.
 * `<Chip>` ficou com o que sempre foi o trabalho dele: **seleção**, vários itens acesos ao mesmo
 * tempo (dia, turno, atividade, tipo de atendimento).
 */
const SELECIONADO: Record<Modo, string> = {
  unico: "bg-accent text-accent-ink",
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
      /* min-h-11 é o alvo de toque de 44px (seção 11); onde o ponteiro é preciso o chip volta a
         encolher, senão uma fila de filtros vira uma barra de botões gordos. A régua é o ponteiro
         e não a largura: tablet largo continua sendo dedo. */
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-control px-3 py-1.5 text-note font-semibold whitespace-nowrap transition-colors duration-150 ease-out pointer-fine:min-h-8 pointer-fine:px-2.5 ${
        selecionado ? SELECIONADO[modo] : INATIVO
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
