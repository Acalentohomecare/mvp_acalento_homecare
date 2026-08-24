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
 * Esqueleto de uma **linha de registro** de atendimento — a mesma grade do
 * `<AttendanceRow>`, com as mesmas colunas nos mesmos lugares.
 *
 * Era um esqueleto de card, e o card não existe mais nesta lista: a espera prometia uma caixa de
 * 150px e chegava uma linha de 56px, então a tela inteira subia no momento em que o dado
 * carregava. As larguras são desiguais de propósito — barra toda do mesmo tamanho lê como
 * tabela vazia, não como registro chegando.
 */
export function SkeletonLinha({ largura = "w-2/5" }: { largura?: string }) {
  return (
    <li className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-0.5 px-3.5 py-2.5 lg:grid-cols-[3.5rem_minmax(0,1fr)_10rem_5.5rem_8.5rem] lg:items-center lg:gap-x-4">
      <div className="col-start-1 row-span-3 row-start-1 lg:row-span-2">
        <Skeleton className="h-3 w-9 rounded-marker" />
        <Skeleton className="mt-1 h-3.5 w-10 rounded-marker" />
      </div>
      <Skeleton className={`col-start-2 row-start-1 h-4 rounded-marker ${largura}`} />
      <Skeleton className="col-start-2 row-start-2 h-3 w-3/5 rounded-marker" />
      <Skeleton className="col-start-2 row-start-3 h-3 w-1/3 rounded-marker lg:col-start-3 lg:row-span-2 lg:row-start-1" />
      <Skeleton className="col-start-3 row-start-1 h-3.5 w-14 rounded-marker lg:col-start-4 lg:row-span-2 lg:row-start-1" />
      <Skeleton className="col-start-3 row-span-2 row-start-2 h-3 w-20 rounded-marker lg:col-start-5 lg:row-span-2 lg:row-start-1" />
    </li>
  );
}

/**
 * Um registro carregando: a moldura já existe, as linhas chegam.
 *
 * Quatro linhas, nunca a lista inteira — prometer quinze e entregar três é pior do que não
 * prometer. O `role="status"` é quem anuncia; os blocos são todos `aria-hidden`.
 */
export function SkeletonLista({ itens = 4 }: { itens?: number }) {
  /* Larguras fixas por posição e não aleatórias: sorteio faz o esqueleto mudar de forma a cada
     render e a espera "pisca" quando o React reconcilia. */
  const larguras = ["w-2/5", "w-1/2", "w-1/3", "w-[45%]", "w-2/5", "w-1/2"];
  return (
    <ul
      role="status"
      aria-live="polite"
      aria-label="Carregando atendimentos"
      className="divide-y divide-linha overflow-hidden rounded-card border border-linha bg-surface-raised"
    >
      {Array.from({ length: itens }, (_, i) => (
        <SkeletonLinha key={i} largura={larguras[i % larguras.length]} />
      ))}
    </ul>
  );
}

/**
 * Esqueleto de um card de pessoa (cuidador, candidatura) — onde o card continua sendo a forma
 * certa, porque o conteúdo é um retrato e não um registro.
 */
export function SkeletonCard() {
  return (
    <div className="rounded-card border border-linha bg-surface-raised p-3.5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-[18px] w-2/5 rounded-marker" />
          <Skeleton className="mt-1.5 h-3.5 w-1/3 rounded-marker" />
          <div className="mt-2.5 flex gap-2">
            <Skeleton className="h-5 w-20 rounded-marker" />
            <Skeleton className="h-5 w-12 rounded-marker" />
          </div>
        </div>
      </div>
    </div>
  );
}
