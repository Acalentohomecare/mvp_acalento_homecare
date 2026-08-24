import type { ReactNode } from "react";

/*
 * Estado vazio (docs/DESIGN_SYSTEM.md, seção 8.2).
 *
 * Existia copiado em oito telas, com quatro paddings diferentes (`py-6`, `py-7`, `py-10`) e sempre
 * a mesma moldura tracejada e centralizada. A borda tracejada é o clichê de estado vazio: ela
 * desenha um buraco no lugar do conteúdo e chama atenção justamente para o que não existe.
 *
 * Aqui o vazio é **quieto e alinhado à esquerda**, como uma anotação no lugar onde o registro
 * estaria — não uma caixa. Quando há uma saída (publicar o primeiro atendimento, limpar o
 * filtro), ela vem junto: estado vazio sem porta de saída é um beco.
 *
 * Duas naturezas, e elas não são a mesma coisa:
 * - **vazio de verdade** — não existe registro nenhum ainda. A saída é criar.
 * - **vazio de filtro** — existe registro, o recorte é que não achou. A saída é afrouxar o filtro,
 *   e a frase precisa dizer isso, senão a pessoa acha que perdeu os dados.
 */

interface VazioProps {
  /** A frase. Curta, específica, sem "Ops!" nem exclamação. */
  children: ReactNode;
  /** A saída: um botão, um link. */
  acao?: ReactNode;
  /**
   * `bloco` ocupa a altura de uma lista curta; `linha` é a anotação de uma seção pequena.
   * `solto` é o mesmo `linha` **sem** recuo horizontal, para a seção sem moldura (`<Secao>`),
   * onde não existe borda de painel da qual afastar o texto — ali o recuo só desalinharia a
   * frase em relação às linhas da lista logo acima.
   */
  porte?: "linha" | "bloco" | "solto";
  className?: string;
}

export function Vazio({ children, acao, porte = "bloco", className = "" }: VazioProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 text-note text-ink-subtle ${
        porte === "bloco" ? "px-3.5 py-6" : porte === "linha" ? "px-3.5 py-3" : "py-3"
      } ${className}`}
    >
      <p className="prosa min-w-0">{children}</p>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
