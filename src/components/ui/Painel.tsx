import type { ReactNode } from "react";

/*
 * Painel de conteúdo (docs/DESIGN_SYSTEM.md, seção 7.2).
 *
 * É o contêiner que substituiu a maior parte dos `<Card>` do módulo de Atendimentos. A diferença
 * não é de estilo, é de papel:
 *
 * - `<Card>` é uma **superfície elevada** — uma coisa que flutua sobre a página. Serve para o que
 *   é destacado do fluxo: a caixa de entrada, o resumo que acompanha a rolagem.
 * - `<Painel>` é um **bloco do documento** — delimita uma região de conteúdo sem fingir altura.
 *   Borda de 1px, sem sombra, cabeçalho opcional numa faixa rebaixada.
 *
 * Sem essa distinção, tudo virava card: quinze plantões em quinze caixas com sombra, e dentro de
 * cada tela mais caixas dentro de caixas. Card dentro de card é sempre erro; painel dentro de
 * painel também. Um painel pode conter listas, tabelas e linhas de dado — não outro painel.
 *
 * A variante `quieto` desce mais um degrau: mantém a moldura de 1px e perde o preenchimento
 * branco e a faixa do cabeçalho. Sobre o fundo `--surface`, ele deixa de flutuar e passa a
 * **delimitar** — que é a própria definição de painel. É a forma certa para o bloco de apoio que
 * acompanha a leitura (Pendências, no Início da empresa): ainda é um card, mas não pede a
 * atenção que a fila de plantões ao lado precisa ter.
 */

interface PainelProps {
  /** Cabeçalho do painel. Sem ele, o painel é só a moldura. */
  title?: string;
  /** Contagem ao lado do título — a pastilha discreta, nunca uma pílula colorida. */
  count?: number;
  /** Ações do cabeçalho, à direita: link "ver tudo", botão pequeno. */
  actions?: ReactNode;
  /** Remove o padding interno — para quando o filho é uma lista que sangra até a borda. */
  flush?: boolean;
  /**
   * `padrao` — superfície branca e cabeçalho em faixa afundada. É o painel de conteúdo.
   * `quieto` — a mesma moldura de 1px, **sem** o preenchimento branco e sem a faixa do
   *   cabeçalho. Para o bloco de apoio que acompanha a leitura sem disputar com ela.
   */
  variant?: "padrao" | "quieto";
  children: ReactNode;
  className?: string;
}

export function Painel({
  title,
  count,
  actions,
  flush = false,
  variant = "padrao",
  children,
  className = "",
}: PainelProps) {
  const quieto = variant === "quieto";

  return (
    <section
      className={`overflow-hidden rounded-card border border-linha ${
        quieto ? "bg-transparent" : "bg-surface-raised"
      } ${className}`}
    >
      {title && (
        <header
          className={`flex items-center justify-between gap-3 ${
            quieto
              ? "px-3 pt-2.5 pb-1.5"
              : "border-b border-linha bg-surface-sunken/60 px-3.5 py-2"
          }`}
        >
          <h2 className="flex min-w-0 items-center gap-2 text-heading text-ink">
            <span className="truncate">{title}</span>
            {count !== undefined &&
              /* No painel quieto a contagem é número puro: a pastilha é mais uma caixinha, e o
                 painel existe justamente para ter menos caixa. */
              (quieto ? (
                <span className="numero shrink-0 text-meta text-ink-subtle">{count}</span>
              ) : (
                <Contador valor={count} />
              ))}
          </h2>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? "" : quieto ? "px-3 pb-3" : "p-3.5"}>{children}</div>
    </section>
  );
}

/**
 * Contagem ao lado de um título. Era `rounded-full` e virava mais uma pílula na tela; agora é um
 * retângulo de 3px, do mesmo vocabulário do marcador de estado. Tabular, porque é número.
 */
export function Contador({ valor, className = "" }: { valor: number; className?: string }) {
  return (
    <span
      className={`numero shrink-0 rounded-marker bg-surface-sunken px-1.5 py-px text-meta leading-[1.4] font-semibold text-ink-subtle ${className}`}
    >
      {valor}
    </span>
  );
}

/**
 * Linha de dado: termo à esquerda, valor à direita (docs/DESIGN_SYSTEM.md, seção 7.3).
 *
 * Substitui os blocos de `grid grid-cols-2` que existiam para mostrar duas informações dentro de
 * um card. Como lista de definição de verdade (`<dl>`), quem usa leitor de tela ouve o par
 * termo/valor em vez de duas frases soltas — e visualmente a coluna de valores alinha sozinha,
 * que é o que faz um bloco de dados parecer registro e não texto corrido.
 */
export function ListaDeDados({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <dl className={`divide-y divide-linha ${className}`}>{children}</dl>;
}

export function Dado({
  termo,
  children,
  className = "",
}: {
  termo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0 ${className}`}>
      <dt className="shrink-0 text-note text-ink-subtle">{termo}</dt>
      <dd className="min-w-0 text-right text-note text-ink">{children}</dd>
    </div>
  );
}
