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
 * Ação da **camada 5** de uma linha de registro — "Buscar cuidadores", "Candidaturas (2)"
 * (docs/DESIGN_SYSTEM.md, seção 9.0).
 *
 * Mais leve que o `ACTION_LINK_CLASS`, e de propósito: numa lista de quinze plantões, dois botões
 * com borda por linha somam trinta retângulos e a lista deixa de se ler. Aqui a ação é texto na
 * cor da marca, com sublinhado que só aparece no ponteiro.
 *
 * **A tinta da marca é o que separa ação de informação.** A camada 4 (o recado neutro, em
 * `--ink-subtle`) fica logo acima, e as duas chegaram a dividir a mesma faixa horizontal. Cor de
 * marca mais peso 600 mais sublinhado no hover é o conjunto que diz "isto é clicável" antes de
 * qualquer ponteiro aparecer — que é o que uma pessoa no celular precisa saber sem hover nenhum.
 *
 * O `min-h-11` continua: o alvo de 44px é obrigação de toque (seção 11), e ele existe mesmo
 * quando não se vê. Onde o ponteiro é preciso, encolhe — senão duas ações abrem 44px de vão
 * dentro de uma linha de 56px.
 *
 * `active:` é o estado que faltava, e ele **precisa** existir aqui: a linha inteira já escurece no
 * toque (`active:bg-surface-sunken` na `<li>`), e `:active` sobe para os ancestrais — sem uma
 * resposta do próprio link, tocar "Buscar cuidadores" acendia a linha toda e parecia que o dedo
 * tinha aberto a ficha do plantão em vez da busca. Agora a tinta mais escura do accent diz qual
 * dos dois alvos pegou. O foco de teclado vem do anel global de `:focus-visible` (index.css).
 */
export const ROW_ACTION_CLASS =
  "inline-flex min-h-11 items-center rounded-control text-label font-semibold text-accent underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-accent/50 active:text-accent-strong active:decoration-accent-strong/60 pointer-fine:min-h-7";

/**
 * Ação secundária dentro de um card — "Ver perfil", "Ver candidaturas".
 *
 * Não é `<Button>` porque navega, e não é `<ButtonLink>` porque tem peso menor que uma ação de
 * tela. Estava escrita à mão em três telas com a mesma string; duas delas ficaram para trás na
 * revisão de alvo de toque e continuavam com 32px no dedo.
 */
export const ACTION_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-control border border-linha px-3 text-label font-semibold transition-colors duration-150 ease-out hover:border-accent pointer-fine:min-h-8 pointer-fine:px-2.5";

/**
 * Link do cabeçalho de uma `<Secao>` — "Ver todos", "Ver escala".
 *
 * Mesma família da ação de linha (tinta da marca, sublinhado no ponteiro), um degrau menor em
 * tamanho porque acompanha um rótulo `text-dado` e não uma linha de conteúdo.
 *
 * O `min-h-11` é a correção que faltava: era um texto de 13px solto num cabeçalho, com ~18px de
 * altura clicável — abaixo do piso de 44px da seção 11, e num link que a coordenadora usa de pé,
 * com o telefone numa mão. O contêiner de ações da `<Secao>` compensa a altura extra com margem
 * negativa, então o cabeçalho não engorda: **aumenta a área, não o desenho.**
 */
export const SECAO_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-control text-meta font-semibold text-accent underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-accent/50 active:text-accent-strong active:decoration-accent-strong/60 pointer-fine:min-h-0";

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  block = false,
) {
  return `${BUTTON_BASE_CLASS} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${block ? "w-full" : ""}`;
}
