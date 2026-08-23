import type { ReactNode } from "react";

/**
 * Fila de filtros (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * No celular ela **rola na horizontal**; a partir de `md` volta a quebrar em linhas.
 *
 * Quebrar linha é o comportamento errado em tela pequena: as três abas de Cuidadores viravam
 * duas linhas, as cinco categorias mais duas, e a pessoa gastava metade da altura útil em
 * controle antes de ver o primeiro cuidador. Rolagem horizontal resolve isso sem esconder
 * nenhuma opção — e é o gesto que o polegar já usa.
 *
 * O `-mx-6 px-6` é o que faz a fila sangrar até a borda da tela em vez de parar na margem da
 * página: fila que rola e para antes da borda parece cortada, não rolável. A barra de rolagem
 * some porque em telas de toque ela não é o que comunica o gesto — o item cortado na borda é.
 */
export function FilterRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`-mx-6 flex gap-1.5 overflow-x-auto px-6 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}
