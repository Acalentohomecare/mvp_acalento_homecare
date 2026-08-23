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
      : "text-ink/60 hover:bg-surface-raised hover:text-ink"
  }`;

/** Aba da barra inferior do celular. */
export const tabNavClass = (isActive: boolean) =>
  `relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-center text-meta font-medium -tracking-[0.01em] transition-colors duration-150 ease-out ${
    isActive ? "font-semibold text-accent" : "text-ink/45"
  }`;

/** Traço da aba ativa: o estado não fica só na cor (DESIGN_SYSTEM.md, seção 3). */
export const TAB_INDICATOR_CLASS = "absolute inset-x-5 top-0 h-0.5 rounded-full bg-accent";
