/*
 * Fonte única do visual de campo (docs/DESIGN_SYSTEM.md, seção 7). Input, Select e Textarea
 * compartilham a mesma moldura: antes cada um repetia a string de classes e qualquer ajuste
 * precisava ser feito em três lugares — foi assim que o `focus` acabou diferente entre eles.
 */
export const FIELD_LABEL_CLASS = "mb-1.5 block text-label text-ink-muted";

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
  "w-full min-h-11 rounded-control border-[1.5px] border-linha-strong bg-surface-raised px-3 py-2 text-body text-ink outline-none transition-colors duration-150 placeholder:text-ink-subtle hover:border-ink-subtle focus:border-accent disabled:cursor-not-allowed disabled:border-linha disabled:bg-surface-sunken disabled:text-ink-subtle/70";

/**
 * Select usado como **filtro**, não como campo de formulário — o recorte de uma lista que já está
 * na tela, ao lado de um controle mais importante que ele.
 *
 * Três coisas mudam, e cada uma tem um motivo próprio:
 *
 * **Borda de 1px em `--linha`, não 1,5px em `--linha-strong`.** É a única decisão daqui que cobra
 * um preço, e ele está registrado: `--linha` sobre `--surface-sunken` fica perto de 1,1:1, abaixo
 * dos 3:1 que a WCAG 1.4.11 pede para o limite de um controle.
 *
 * O que sustenta a troca é que o argumento que fixou `--linha-strong` no campo não se aplica aqui.
 * Ele é textual: *"num campo vazio a borda é a única coisa que diz onde o campo começa"*. Este
 * select **nunca está vazio** — mostra "Todos do quadro" ou um nome, e carrega a seta ao lado, que
 * é o desenho que anuncia "isto abre uma lista". A borda deixou de ser o único sinal, e por isso
 * pode recuar a divisor.
 *
 * Se a leitura for a estrita — o limite precisa dos 3:1 independentemente do que houver dentro —,
 * a volta é uma palavra: `border-linha-strong` aqui, e o resto da variante fica de pé.
 *
 * **Fundo `--surface-sunken`.** O campo de formulário é branco porque precisa se anunciar como
 * "escreva aqui". O filtro não pede nada: ele recua para uma faixa de apoio, um degrau abaixo do
 * papel da página, e deixa a atenção para o controle que importa na faixa.
 *
 * **Altura e corpo encolhem no ponteiro.** `text-body` (16px) fica no toque, e não é estética:
 * abaixo de 16px o Safari do iPhone dá zoom sozinho ao focar o controle. Onde não há esse risco,
 * 13px (`text-meta`) numa caixa de 32px é o que separa um filtro discreto de um campo de cadastro.
 *
 * 13px e não 14px porque 14px não existe na escala: os degraus são 12, 13, 15 e 16. Inventar um
 * tamanho fora dela para economizar um pixel é como a escala começa a virar sugestão. E `text-meta`
 * e não `text-label` — os dois são 13px, mas o `label` traz peso 500, o mesmo do "Hoje" ao lado.
 * Filtro com o peso do botão desfaz a hierarquia que a faixa inteira foi arrumada para ter.
 *
 * O respiro horizontal **aumenta** enquanto a caixa encolhe (`px-3.5`): é o que faz o controle
 * parecer mais leve sem ficar menor — aperto vertical com folga lateral lê como refinamento,
 * aperto nos dois eixos lê como controle espremido.
 */
export const FIELD_FILTRO_CLASS =
  "w-full min-h-11 rounded-control border border-linha bg-surface-sunken px-3.5 py-1.5 text-body text-ink outline-none transition-colors duration-150 hover:border-ink-subtle focus:border-accent pointer-fine:min-h-8 pointer-fine:text-meta disabled:cursor-not-allowed disabled:border-linha disabled:text-ink-subtle/70";

/**
 * Campo que falhou na validação. A borda muda **e** a mensagem aparece embaixo — cor sozinha não
 * carrega informação (regra 3), e quem não distingue vermelho precisa da frase.
 */
export const FIELD_ERROR_CLASS = "border-status-cancelado focus:border-status-cancelado";

/** Mensagem sob o campo. Ligada ao controle por `aria-describedby`. */
export const FIELD_ERROR_TEXT_CLASS = "mt-1 block text-meta text-status-cancelado";
