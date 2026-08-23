/*
 * Fonte única do visual de campo (docs/DESIGN_SYSTEM.md, seção 7). Input, Select e Textarea
 * compartilham a mesma moldura: antes cada um repetia a string de classes e qualquer ajuste
 * precisava ser feito em três lugares — foi assim que o `focus` acabou diferente entre eles.
 */
export const FIELD_LABEL_CLASS = "mb-1.5 block text-label font-medium text-ink/65";

/*
 * `text-body` (16px) não é escolha estética: abaixo de 16px o Safari do iPhone dá zoom sozinho
 * ao focar o campo, o formulário sai do enquadramento e a pessoa precisa fechar o zoom a cada
 * campo. A altura resultante (~44px) resolve o alvo de toque no mesmo movimento.
 *
 * A borda é de 1,5px porque 1px de `--linha` sobre branco desaparece na tela do celular sob luz
 * forte — e o cuidador preenche isto na porta da casa do paciente.
 */
export const FIELD_CLASS =
  "w-full rounded-control border-[1.5px] border-linha bg-surface-raised px-3 py-2 text-body text-ink outline-none transition-colors duration-150 placeholder:text-ink/35 hover:border-linha focus:border-accent disabled:cursor-not-allowed disabled:border-linha disabled:bg-surface-sunken disabled:text-ink/40";

/**
 * Campo que falhou na validação. A borda muda **e** a mensagem aparece embaixo — cor sozinha não
 * carrega informação (regra 3), e quem não distingue vermelho precisa da frase.
 */
export const FIELD_ERROR_CLASS = "border-status-cancelado focus:border-status-cancelado";

/** Mensagem sob o campo. Ligada ao controle por `aria-describedby`. */
export const FIELD_ERROR_TEXT_CLASS = "mt-1 block text-meta text-status-cancelado";
