/**
 * Esqueleto de carregamento (docs/DESIGN_SYSTEM.md, seção 8.1).
 *
 * Duas regras mandam aqui. A primeira: o esqueleto **reproduz a forma real**, não retângulos
 * genéricos — quem espera já começa a ler o layout, e quando o dado chega nada se move. A
 * segunda: ele ocupa **exatamente** a altura do conteúdo que substitui. Layout que salta quando
 * o dado chega é pior do que tela em branco, e no celular derruba o toque da pessoa no botão
 * errado.
 *
 * A pulsação é por opacidade (`.esqueleto` em `index.css`), nunca brilho varrendo, e fica
 * estática sob `prefers-reduced-motion`.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`esqueleto block bg-surface-sunken ${className}`} />;
}

/**
 * Esqueleto de um card de lista (atendimento, cuidador): nome, subtítulo, crachá à direita e a
 * faixa de metadados embaixo. As larguras são desiguais de propósito — barra toda do mesmo
 * tamanho lê como tabela, não como card.
 */
export function SkeletonCard() {
  return (
    <div className="rounded-card border border-linha bg-surface-raised p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-[18px] w-2/5 rounded-control" />
          <Skeleton className="mt-1.5 h-3.5 w-1/4 rounded-control" />
        </div>
        <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <Skeleton className="h-3.5 w-16 rounded-control" />
        <Skeleton className="h-3.5 w-12 rounded-control" />
        <Skeleton className="h-3.5 w-24 rounded-control" />
      </div>
      <Skeleton className="mt-2.5 h-3.5 w-1/3 rounded-control" />
    </div>
  );
}

/**
 * Três cards, nunca a lista inteira: prometer dez e entregar dois é pior do que não prometer.
 * O `role="status"` é quem anuncia — os blocos são todos `aria-hidden`.
 */
export function SkeletonLista({ itens = 3 }: { itens?: number }) {
  return (
    <div role="status" aria-live="polite" aria-label="Carregando" className="flex flex-col gap-2.5">
      {Array.from({ length: itens }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
