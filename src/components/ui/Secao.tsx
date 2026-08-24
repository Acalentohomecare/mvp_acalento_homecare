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
 *
 * --------------------------------------------------------------- as duas tintas do rótulo
 *
 * `destaque` é a única diferença possível entre duas seções, e ela vive **no rótulo**: tinta
 * cheia (`--ink`) em vez de `--ink-muted`, contagem um degrau acima. Nada mais muda — mesmo
 * desenho, mesmo espaço, nenhuma moldura, nenhum fundo.
 *
 * Isso parece pouco para separar "o que exige decisão agora" de "o que é histórico", e é
 * deliberado. A alternativa óbvia — dar uma superfície à seção inteira, fundo branco com moldura
 * de 1px e canto arredondado — foi tentada e reprovada na revisão 18: mesmo sem sombra e mesmo
 * sendo uma caixa por região (não por registro), o resultado lê como **card**. Borda mais raio
 * mais fundo é a assinatura do card, independentemente do que a caixa contenha, e uma coluna com
 * duas dessas no topo volta a ser a pilha de painéis que o `<Secao>` nasceu para desfazer.
 *
 * A regra que sobrou é a da seção 5 do design system, aplicada até o fim: **o que separa
 * conteúdo é borda de 1px e espaço, e a hierarquia vem de posição, densidade e tinta.** Numa
 * coluna sem molduras, subir o rótulo de `--ink-muted` para `--ink` é um degrau de contraste que
 * se vê de relance — e é o degrau mais barato que existe, porque não custa um pixel de altura
 * nem uma linha a mais de desenho.
 */

interface SecaoProps {
  /** O nome da região. Sai em versalete — escreva em caixa normal. */
  title: string;
  /** Contagem integrada ao título, depois do ponto médio. */
  count?: number;
  /** À direita do rótulo: link "ver todos", filtro curto. Use `SECAO_LINK_CLASS` nos links. */
  actions?: ReactNode;
  /**
   * `padrao` — rótulo em `--ink-muted`. O repouso da tela.
   * `destaque` — o mesmo desenho, com o rótulo em tinta cheia. Para a região que a pessoa
   *   precisa ler primeiro. **Só a tinta muda**: nenhuma moldura, nenhum fundo, nenhum raio.
   */
  variant?: "padrao" | "destaque";
  children: ReactNode;
  className?: string;
}

export function Secao({
  title,
  count,
  actions,
  variant = "padrao",
  children,
  className = "",
}: SecaoProps) {
  const destaque = variant === "destaque";

  return (
    <section className={className}>
      {/* `items-center`, e não `items-baseline`: a ação do cabeçalho é um alvo de 44px no toque
          (`SECAO_LINK_CLASS`), e uma caixa de 44px alinhada pela linha de base empurraria o texto
          do link 12px abaixo do rótulo da seção. Centralizados, os dois voltam a ler como uma
          linha só, em qualquer altura de alvo. */}
      <header className="flex items-center justify-between gap-3 pb-1.5">
        <h2
          className={`flex min-w-0 items-baseline gap-1 text-dado uppercase ${
            destaque ? "text-ink" : "text-ink-muted"
          }`}
        >
          <span className="truncate">{title}</span>
          {count !== undefined && (
            <span className={`numero shrink-0 ${destaque ? "text-ink-muted" : "text-ink-subtle"}`}>
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
