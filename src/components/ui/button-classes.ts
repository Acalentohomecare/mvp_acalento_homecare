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
  primary: "bg-accent text-accent-ink shadow-card hover:bg-accent-strong",
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

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  block = false,
) {
  return `${BUTTON_BASE_CLASS} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${block ? "w-full" : ""}`;
}
