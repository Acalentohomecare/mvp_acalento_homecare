import type { HTMLAttributes } from "react";

/**
 * Superfície do produto (docs/DESIGN_SYSTEM.md, seção 7.1).
 *
 * **A sombra saiu.** Era `shadow-card` em todo card, e com ela cada bloco de conteúdo flutuava um
 * pouco acima da página — quinze plantões, quinze objetos soltos. Sombra passou a significar uma
 * coisa só neste produto: **elevação de verdade**, o que está por cima de outra coisa e pode ser
 * fechado. Modal, barra de ação flutuante do celular, menu. Nada mais.
 *
 * O que separa conteúdo agora é borda de 1px e espaço. É mais quieto, e é o que sistemas de
 * operação usam: a hierarquia vem de posição e densidade, não de altura falsa.
 *
 * Quando usar o quê:
 * - `<Card>`    um bloco solto no fluxo: caixa de entrada, resumo lateral, aviso destacado.
 * - `<Painel>`  uma região com cabeçalho e conteúdo estruturado dentro.
 * - nenhum dos dois: listas de registro, que usam a moldura do próprio `<AttendanceList>`.
 *
 * Card dentro de card é sempre erro.
 */
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-linha bg-surface-raised p-3.5 ${className}`}
      {...props}
    />
  );
}
