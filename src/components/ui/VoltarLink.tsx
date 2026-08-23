import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Link de volta do cabeçalho de tela (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * Estava copiado em seis telas com a mesma string de classes, e nas seis o alvo tinha 21px de
 * altura — metade do mínimo. Não é um link no meio de uma frase (esses a WCAG isenta): é o
 * controle de navegação da tela, e no celular ele é tocado com o polegar.
 *
 * A área cresce por padding com margem negativa, então o texto continua alinhado à margem da
 * página; onde o ponteiro é preciso, ela volta ao tamanho justo.
 */
export function VoltarLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 text-note text-ink-subtle transition-colors duration-150 ease-out hover:text-ink pointer-fine:ml-0 pointer-fine:min-h-0 pointer-fine:px-0"
    >
      <ArrowLeft size={14} aria-hidden="true" /> {children}
    </Link>
  );
}
