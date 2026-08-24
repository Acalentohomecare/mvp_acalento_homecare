import type { ReactNode } from "react";

/*
 * Seção sem moldura (docs/DESIGN_SYSTEM.md, seção 7 — `<Secao>`).
 *
 * O terceiro degrau da escada de contêineres do produto, e ele existe porque faltava um:
 *
 * - `<Card>`    — superfície **elevada**. Flutua sobre a página.
 * - `<Painel>`  — bloco **delimitado**. Moldura de 1px, sem sombra.
 * - `<Secao>`   — região **nomeada**. Nenhuma moldura: só um rótulo e o conteúdo abaixo dele.
 *
 * Sem esse degrau, toda lista virava painel, e o Início da empresa acabava com cinco molduras
 * empilhadas numa tela só — cada uma anunciando "aqui começa uma caixa" antes de deixar ler o
 * que interessa. Numa tela de trabalho, as caixas somam mais peso visual do que o conteúdo que
 * separam: cinco bordas, cinco faixas de cabeçalho, cinco fundos brancos sobre o fundo cinza.
 *
 * A seção resolve isso invertendo a pergunta. Uma lista de plantões **já parece uma lista** —
 * os fios entre as linhas e o alinhamento das colunas fazem esse trabalho sozinhos. O que ela
 * precisa é de um nome, não de uma parede.
 *
 * ------------------------------------------------------------------------- o cabeçalho
 *
 * Rótulo em `text-dado` versalete, na tinta `--ink-muted`, com a contagem colada por um ponto
 * médio:
 *
 *     ATENDIMENTOS DE HOJE · 3
 *
 * A contagem é **número puro**, não `<Contador>`. A pastilha do contador serve dentro de uma
 * faixa de cabeçalho, onde precisa se destacar de um fundo; solta sobre a página ela vira mais
 * uma caixinha — exatamente o que a seção existe para não ter.
 *
 * Quando usar cada um: se o conteúdo é uma lista ou uma tabela que já se delimita sozinha, use
 * `<Secao>`. Se é conteúdo solto que precisa ser recortado do resto da página (um resumo, um
 * formulário curto, um bloco de dados), use `<Painel>`.
 */

interface SecaoProps {
  /** O nome da região. Sai em versalete — escreva em caixa normal. */
  title: string;
  /** Contagem integrada ao título, depois do ponto médio. */
  count?: number;
  /** À direita do rótulo: link "ver todos", filtro curto. Use `SECAO_LINK_CLASS` nos links. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Secao({ title, count, actions, children, className = "" }: SecaoProps) {
  return (
    <section className={className}>
      {/* `items-center`, e não `items-baseline`: a ação do cabeçalho é um alvo de 44px no toque
          (`SECAO_LINK_CLASS`), e uma caixa de 44px alinhada pela linha de base empurraria o texto
          do link 12px abaixo do rótulo da seção. Centralizados, os dois voltam a ler como uma
          linha só, em qualquer altura de alvo. */}
      <header className="flex items-center justify-between gap-3 pb-1.5">
        <h2 className="flex min-w-0 items-baseline gap-1 text-dado text-ink-muted uppercase">
          <span className="truncate">{title}</span>
          {count !== undefined && (
            <span className="numero shrink-0 text-ink-subtle">
              <span aria-hidden="true">· </span>
              {count}
            </span>
          )}
        </h2>
        {/* A margem negativa é a técnica da seção 11: **aumenta a área, não o desenho.** O link
            tem 44px de altura clicável no dedo e devolve 20px ao layout, então o cabeçalho cresce
            só o necessário para caber o alvo — e no ponteiro, onde o alvo encolhe sozinho, não
            cresce nada. */}
        {actions && (
          <div className="-my-2.5 flex shrink-0 items-center gap-2 pointer-fine:my-0">{actions}</div>
        )}
      </header>
      {children}
    </section>
  );
}
