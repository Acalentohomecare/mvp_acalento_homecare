import type { ReactNode } from "react";

export interface Stat {
  label: string;
  value: ReactNode;
}

/**
 * Faixa de números do painel (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * **Duas formas, um conteúdo.** A partir de `sm` é a faixa emendada de sempre: colunas de largura
 * igual separadas por fio de 1px, que lê como um bloco só. No celular ela vira uma fila que rola
 * na horizontal.
 *
 * O motivo é altura. Cinco números em duas colunas ocupavam três linhas — cerca de 190px do topo
 * da tela mais importante do produto — e empurravam "Pendências", que é o que pede ação, para
 * abaixo da dobra. Em fila, a mesma informação ocupa ~70px e nada é escondido: os dois primeiros
 * números são os que a coordenadora olha primeiro, e os outros estão a um gesto que o polegar já
 * faz.
 *
 * `snap-x` existe para a fila parar alinhada com um cartão, e não no meio de um.
 */
export function StatStrip({ items }: { items: Stat[] }) {
  return (
    <div className="-mx-6 mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-flow-col sm:auto-cols-fr sm:gap-px sm:overflow-hidden sm:rounded-card sm:border sm:border-linha sm:bg-linha sm:px-0 sm:pb-0 sm:shadow-card [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-32 shrink-0 snap-start flex-col justify-between gap-2 rounded-card border border-linha bg-surface-raised px-3.5 py-3 shadow-card sm:min-w-0 sm:rounded-none sm:border-0 sm:shadow-none"
        >
          <div className="text-dado text-ink-subtle uppercase">
            {item.label}
          </div>
          <div className="mt-1 flex items-center gap-1 numero text-title leading-none font-medium text-accent">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
