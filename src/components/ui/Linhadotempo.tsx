import type { ReactNode } from "react";

/*
 * Linha do tempo operacional (docs/DESIGN_SYSTEM.md, seção 9.5).
 *
 * O histórico do produto era uma `<ul>` de parágrafos: frase, carimbo de hora, borda embaixo,
 * repete. Lê como notas soltas, não como o registro de uma operação — e "Atividade recente" é
 * justamente onde a coordenadora confere o que aconteceu enquanto ela não estava olhando.
 *
 * O que muda: cada entrada ganha **estrutura**, e a mesma estrutura em toda entrada.
 *
 *     ●─┐  Check-in registrado                          07:04
 *       │  Sandra Oliveira · Vila Mariana, portaria
 *       │
 *     ●─┘  Cuidador confirmado                          ontem, 18:22
 *          Coordenação
 *
 * - **evento** — o que aconteceu, em peso 500, na tinta principal;
 * - **quem** e **contexto** — a linha de apoio, terciária;
 * - **quando** — tabular, encostado à direita, para a coluna de horas alinhar sozinha.
 *
 * O conector é um fio de 1px atrás dos marcadores, não uma borda em cada item: fio contínuo é o
 * que faz uma sequência parecer uma sequência. Nada disso vira card — a regra do módulo é que
 * evento de histórico nunca ganha caixa própria.
 */

export interface EventoLinhaDoTempo {
  id: string;
  /** O que aconteceu. Frase curta, verbo no particípio: "Convite enviado", "Check-out registrado". */
  evento: string;
  /** Quem fez e onde. Opcional — nem todo evento tem responsável nomeado. */
  contexto?: ReactNode;
  /** Carimbo já formatado. Sai em tabular, alinhado à direita. */
  quando: string;
  /**
   * `feito` — aconteceu. `agora` — é o estado corrente. `previsto` — ainda não aconteceu (a
   * régua do ciclo usa isto). `caiu` — cancelamento, o único evento que muda de tinta.
   */
  tom?: "feito" | "agora" | "previsto" | "caiu";
}

const TOM_MARCADOR: Record<NonNullable<EventoLinhaDoTempo["tom"]>, string> = {
  feito: "bg-accent",
  agora: "bg-status-andamento ring-[3px] ring-status-andamento/20",
  previsto: "border-[1.5px] border-linha-strong bg-surface-raised",
  caiu: "bg-status-cancelado",
};

const TOM_TEXTO: Record<NonNullable<EventoLinhaDoTempo["tom"]>, string> = {
  feito: "text-ink",
  agora: "text-status-andamento",
  previsto: "text-ink-subtle",
  caiu: "text-status-cancelado",
};

export function LinhaDoTempo({
  eventos,
  className = "",
}: {
  eventos: EventoLinhaDoTempo[];
  className?: string;
}) {
  return (
    <ol className={`relative ${className}`}>
      {eventos.map((e, i) => {
        const tom = e.tom ?? "feito";
        const ultimo = i === eventos.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-3.5 last:pb-0">
            {/* Trilho: o fio nasce no marcador e morre no próximo. No último item ele some, senão
                a sequência parece continuar para fora da lista. */}
            {!ultimo && (
              <span
                aria-hidden="true"
                className="absolute top-3 bottom-0 left-[3.5px] w-px bg-linha"
              />
            )}
            <span
              aria-hidden="true"
              className={`relative mt-[5px] size-2 shrink-0 rounded-full ${TOM_MARCADOR[tom]}`}
            />
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className={`min-w-0 text-note font-medium ${TOM_TEXTO[tom]}`}>{e.evento}</p>
              <p className="numero shrink-0 text-meta text-ink-subtle">{e.quando}</p>
              {e.contexto && (
                <p className="w-full min-w-0 text-meta text-ink-subtle">{e.contexto}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
