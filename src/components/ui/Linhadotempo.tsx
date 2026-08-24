import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/*
 * Linha do tempo operacional (docs/DESIGN_SYSTEM.md, seção 9.1).
 *
 * O histórico do produto era uma `<ul>` de parágrafos: frase, carimbo de hora, borda embaixo,
 * repete. Lê como notas soltas, não como o registro de uma operação — e "Atividade recente" é
 * justamente onde a coordenadora confere o que aconteceu enquanto ela não estava olhando.
 *
 * O que muda: cada entrada ganha **estrutura**, e a mesma estrutura em toda entrada.
 *
 *     ●  Atendimento de Marli Souza cancelado
 *     │  Paciente foi internada
 *     │  23/08 às 22:44
 *     │
 *     ●  Check-in registrado em Antônio Ferreira
 *     │  Jardim das Flores (simulado)
 *     │  23/08 às 06:58
 *     │
 *     ●  Atendimento de Iracema Bezerra criado
 *        22/08 às 16:05
 *
 * Três degraus, sempre nesta ordem e sempre um embaixo do outro:
 *
 * - **evento** — o que aconteceu, em peso 500, na tinta principal;
 * - **contexto** — a informação complementar (motivo, local, responsável), em `--ink-muted`;
 * - **quando** — o carimbo, tabular, em `--ink-subtle`.
 *
 * O carimbo desceu da direita para debaixo do evento na revisão 16, e é a mudança que mais muda
 * a leitura: encostado à direita, ele obrigava a linha do evento a caber no que sobrasse e abria
 * um vão no meio de toda entrada curta — pior ainda quando um evento tinha contexto e o seguinte
 * não, porque a data trocava de altura de item para item. Empilhado, todo evento tem exatamente a
 * mesma silhueta, e a coluna vira uma varredura de cima para baixo.
 *
 * O conector é um fio de 1px atrás dos marcadores, não uma borda em cada item: fio contínuo é o
 * que faz uma sequência parecer uma sequência. Nada disso vira card — a regra do módulo é que
 * evento de histórico nunca ganha caixa própria, e a linha do tempo inteira também não: ela é
 * conteúdo do documento, colocada sob um `<Secao>`, não dentro de uma moldura.
 *
 * ------------------------------------------------------------------------- clique
 *
 * Quando o evento tem uma entidade atrás (o atendimento que foi criado, o plantão em que o
 * check-in caiu), a entrada inteira vira link — marcador, evento, contexto e carimbo. Só o nome
 * do paciente clicável seria um alvo de 90px numa entrada de 300px, o que no celular é um convite
 * a errar o toque. Evento sem destino continua sendo só registro: nenhum cursor, nenhum hover.
 */

export interface EventoLinhaDoTempo {
  id: string;
  /** O que aconteceu. Frase curta, verbo no particípio, **sem ponto final**. */
  evento: string;
  /** Informação complementar: motivo, local, responsável. Linha própria, tinta secundária. */
  contexto?: ReactNode;
  /** Carimbo já formatado (`utils/date.ts` → `carimbo`): `23/08 às 22:44`. */
  quando: string;
  /**
   * `feito` — aconteceu. `neutro` — rotina, sem nada a sinalizar. `agora` — é o estado corrente.
   * `previsto` — ainda não aconteceu (a régua do ciclo usa isto). `caiu` — cancelamento.
   *
   * O tom pinta **só o marcador**. O texto do evento fica na tinta de sempre: cor semântica no
   * título inteiro é o começo de uma linha do tempo pintada, e a palavra "cancelado" já carrega
   * o significado sem precisar de tinta (regra 3).
   */
  tom?: "feito" | "neutro" | "agora" | "previsto" | "caiu";
  /** Destino da entrada inteira. Sem ele, o evento é registro — não vira alvo de clique. */
  para?: string;
}

const TOM_MARCADOR: Record<NonNullable<EventoLinhaDoTempo["tom"]>, string> = {
  feito: "bg-accent",
  neutro: "bg-linha-strong",
  agora: "bg-status-andamento ring-[3px] ring-status-andamento/20",
  previsto: "border-[1.5px] border-linha-strong bg-surface-raised",
  caiu: "bg-status-cancelado",
};

/*
 * Geometria do trilho. São números crus, e ficam explicados aqui porque é a única forma de o
 * próximo ajuste de espaçamento não quebrar o alinhamento do fio:
 *
 *   centro do marcador  = py-1 (4px) + mt-[7px] + metade do ponto (4px) = 15px do topo da entrada
 *   eixo do fio         = px-2 (8px) + metade do ponto (4px) = 12px, menos meio pixel de fio
 *   respiro entre eventos = pb-3 (12px) no <li>, que o fio atravessa com -bottom-3
 *
 * O offset de 15px serve aos dois tamanhos de `text-note` (15px no celular, 14px no desktop): o
 * centro da primeira linha de texto cai em 15,25px e 14,5px, e meio pixel de diferença não se vê.
 */
const FIO = "absolute left-[11.5px] w-px bg-linha";

export function LinhaDoTempo({
  eventos,
  className = "",
}: {
  eventos: EventoLinhaDoTempo[];
  className?: string;
}) {
  return (
    <ol className={className}>
      {eventos.map((e, i) => {
        const tom = e.tom ?? "feito";
        const primeiro = i === 0;
        const ultimo = i === eventos.length - 1;

        /* O fio nasce no primeiro marcador e morre no último — nunca antes de um nem depois do
           outro, senão a sequência parece continuar para fora da lista. Nos itens do meio ele
           atravessa a entrada inteira; nas pontas, só a metade que tem vizinho. */
        const trilho = primeiro
          ? ultimo
            ? null
            : "top-[15px] -bottom-3"
          : ultimo
            ? "top-0 h-[15px]"
            : "top-0 -bottom-3";

        const conteudo = (
          <>
            {trilho && <span aria-hidden="true" className={`${FIO} ${trilho}`} />}
            <span
              aria-hidden="true"
              className={`relative mt-[7px] size-2 shrink-0 rounded-full ${TOM_MARCADOR[tom]}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-note font-medium text-ink">{e.evento}</p>
              {e.contexto && <p className="prosa mt-0.5 text-meta text-ink-muted">{e.contexto}</p>}
              <p className="numero mt-0.5 text-meta text-ink-subtle">{e.quando}</p>
            </div>
          </>
        );

        /* O `-mx-2` compensa o `px-2`: o marcador nasce na margem do texto da página, e o fundo
           de hover sobra 8px de cada lado em vez de encostar nas letras. É o mesmo recuo da
           lista de atendimentos em `fluxo`, para as duas seções do Início alinharem. */
        const base = "relative flex gap-3 -mx-2 rounded-control px-2 py-1";

        return (
          <li key={e.id} className={ultimo ? "" : "pb-3"}>
            {e.para ? (
              /* `active:` existe para o toque, onde não há hover: o dedo cobre o ponto tocado e,
                 sem mudança imediata de fundo, a pessoa não sabe se o toque pegou. O anel de foco
                 vem da regra global de `:focus-visible` e acompanha o `rounded-control`. */
              <Link
                to={e.para}
                className={`${base} transition-colors duration-150 ease-out hover:bg-surface-sunken/60 active:bg-surface-sunken`}
              >
                {conteudo}
              </Link>
            ) : (
              <div className={base}>{conteudo}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
