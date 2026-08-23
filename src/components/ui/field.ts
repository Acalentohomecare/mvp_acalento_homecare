/*
 * Fonte única do visual de campo (docs/DESIGN_SYSTEM.md, seção 7). Input, Select e Textarea
 * compartilham a mesma moldura: antes cada um repetia a string de classes e qualquer ajuste
 * precisava ser feito em três lugares — foi assim que o `focus` acabou diferente entre eles.
 */
export const FIELD_LABEL_CLASS = "mb-1.5 block text-label font-medium text-ink-muted";

/*
 * `text-body` (16px) não é escolha estética: abaixo de 16px o Safari do iPhone dá zoom sozinho
 * ao focar o campo, o formulário sai do enquadramento e a pessoa precisa fechar o zoom a cada
 * campo. A altura resultante (~44px) resolve o alvo de toque no mesmo movimento.
 *
 * A borda usa `--linha-strong`, não `--linha`. O diagnóstico antigo estava certo — a borda
 * sumia na tela do celular sob luz forte, e o cuidador preenche isto na porta da casa do
 * paciente — mas o remédio era o eixo errado: engrossar para 1,5px não muda contraste, que
 * estava em 1,27:1. Num campo vazio a borda é a única coisa que diz onde o campo começa, e a
 * WCAG 1.4.11 cobra 3:1 disso. Os 1,5px ficam; agora sobre uma linha que se enxerga.
 */
export const FIELD_CLASS =
  "w-full rounded-control border-[1.5px] border-linha-strong bg-surface-raised px-3 py-2 text-body text-ink outline-none transition-colors duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-accent disabled:cursor-not-allowed disabled:border-linha disabled:bg-surface-sunken disabled:text-ink-subtle/70";

/**
 * Campo que falhou na validação. A borda muda **e** a mensagem aparece embaixo — cor sozinha não
 * carrega informação (regra 3), e quem não distingue vermelho precisa da frase.
 */
export const FIELD_ERROR_CLASS = "border-status-cancelado focus:border-status-cancelado";

/** Mensagem sob o campo. Ligada ao controle por `aria-describedby`. */
export const FIELD_ERROR_TEXT_CLASS = "mt-1 block text-meta text-status-cancelado";
