/*
 * Estilos de navegação compartilhados pelos dois layouts (docs/DESIGN_SYSTEM.md, seção 10).
 * Empresa e cuidador tinham a mesma string de classes duplicada — e já divergiam no `hover`.
 */

/**
 * Item da barra lateral. O ativo é tinta da marca sobre fundo suave, não bloco escuro: numa
 * barra que fica o dia inteiro na tela, o retângulo cheio de tinta escura puxa mais atenção do
 * que o conteúdo que ele deveria ajudar a encontrar.
 */
export const sideNavClass = (isActive: boolean) =>
  `flex items-center gap-2.5 rounded-control px-3 py-2 text-note font-medium transition-colors duration-150 ease-out ${
    isActive
      ? "bg-accent-soft font-semibold text-accent"
      : "text-ink-muted hover:bg-surface-raised hover:text-ink"
  }`;

/** Aba da barra inferior do celular. */
export const tabNavClass = (isActive: boolean) =>
  `relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-center text-meta font-medium -tracking-[0.01em] transition-colors duration-150 ease-out ${
    isActive ? "font-semibold text-accent" : "text-ink-subtle"
  }`;

/** Traço da aba ativa: o estado não fica só na cor (DESIGN_SYSTEM.md, seção 3). */
export const TAB_INDICATOR_CLASS = "absolute inset-x-5 top-0 h-0.5 rounded-full bg-accent";

/** Atalho para o conteúdo. A regra mora em `index.css`; ver o comentário lá. */
export const SKIP_LINK_CLASS = "pular-para-conteudo";

/**
 * Botão de ícone do cabeçalho do celular (sino, menu). 44px de alvo com ícone pequeno: a área
 * cresce, o desenho não.
 */
export const HEADER_ICON_CLASS =
  "relative inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-ink";

/** Linha da folha "Mais": destino de navegação secundário, com alvo de 48px. */
export const SHEET_ITEM_CLASS =
  "flex min-h-12 w-full items-center gap-3 rounded-control px-3 text-body font-medium text-ink transition-colors duration-150 ease-out hover:bg-surface-sunken";
