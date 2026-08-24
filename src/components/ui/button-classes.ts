/*
 * Fonte única das classes de botão (docs/DESIGN_SYSTEM.md, seção 7). Mora fora do `Button.tsx`
 * pelo mesmo motivo do `field.ts`: `<Button>` e `<ButtonLink>` são elementos diferentes (`button`
 * e `a`) com o mesmo visual, e a única forma de eles não divergirem é não haver duas cópias.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "md" | "sm";

/**
 * Uma variante por peso de decisão: `primary` é a ação da tela e aparece uma vez só.
 *
 * `secondary` é tonal — o petróleo diluído, não um bloco escuro. Enquanto o accent era azul,
 * um botão quase preto ao lado dele se distinguia; agora que a ação primária é o próprio
 * petróleo escuro da marca, dois retângulos escuros lado a lado (o "Fazer check-in" e o
 * "Fazer check-out") deixavam de ter hierarquia. O tonal resolve isso e ainda é a forma certa
 * de dizer "selecionado" nos alternadores do cadastro, onde `ghost` é o não-selecionado.
 */
export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong",
  secondary: "bg-accent-soft text-accent hover:brightness-[0.97]",
  ghost: "border border-linha bg-surface-raised text-ink-muted hover:border-accent/45 hover:text-ink",
  destructive: "bg-status-cancelado text-white hover:brightness-95",
};

/**
 * O piso de 44px vale onde o alvo é o polegar (seção 11). Onde o ponteiro é preciso, a densidade
 * importa mais e o botão pequeno volta a encolher.
 *
 * A régua é `pointer-fine`, não `md`. Largura de tela não diz método de entrada: um tablet em
 * paisagem e um notebook com tela sensível passam de 768px e continuam sendo dedo — com a régua
 * antiga, os dois recebiam alvo de 36px.
 */
export const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-2.5 text-note",
  sm: "min-h-11 px-3 py-1.5 text-label pointer-fine:min-h-9 pointer-fine:px-2.5",
};

export const BUTTON_BASE_CLASS =
  "inline-flex items-center justify-center gap-1.5 rounded-control font-semibold transition-[background-color,border-color,color,transform,filter] duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none";

/**
 * Ação secundária dentro de um card — "Ver perfil", "Buscar cuidadores", "Candidaturas".
 *
 * Não é `<Button>` porque navega, e não é `<ButtonLink>` porque tem peso menor que uma ação de
 * tela. Estava escrita à mão em três telas com a mesma string; duas delas ficaram para trás na
 * revisão de alvo de toque e continuavam com 32px no dedo.
 */
/**
 * Ação dentro de uma **linha de registro** — "Buscar cuidadores", "Candidaturas (2)".
 *
 * Mais leve que o `ACTION_LINK_CLASS`, e de propósito: numa lista de quinze plantões, dois botões
 * com borda por linha somam trinta retângulos e a lista deixa de se ler. Aqui a ação é texto na
 * cor da marca, com sublinhado que só aparece no ponteiro.
 *
 * O `min-h-11` continua: o alvo de 44px é obrigação de toque (seção 11), e ele existe mesmo
 * quando não se vê. Onde o ponteiro é preciso, encolhe — senão duas ações abrem 44px de vão
 * dentro de uma linha de 56px.
 */
export const ROW_ACTION_CLASS =
  "inline-flex min-h-11 items-center rounded-control text-label font-semibold text-accent underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-accent/50 pointer-fine:min-h-7";

export const ACTION_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-control border border-linha px-3 text-label font-semibold transition-colors duration-150 ease-out hover:border-accent pointer-fine:min-h-8 pointer-fine:px-2.5";

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  block = false,
) {
  return `${BUTTON_BASE_CLASS} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${block ? "w-full" : ""}`;
}
