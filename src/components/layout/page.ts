/*
 * Larguras de página (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * O produto era mobile-first e parava aí: as 19 telas usavam `max-w-2xl` e não existia uma única
 * utilidade `lg:` no código. Acima de 768px nada mudava — a coordenadora abria o produto num
 * monitor de 27" e recebia a mesma coluna de 672px do celular, com o resto da tela vazio. O
 * `PRODUCT.md` (princípio 5) trata desktop e celular como contextos simultâneos, e a apresentação
 * comercial acontece justamente numa tela grande.
 *
 * Não existe uma largura só. Existe uma por trabalho:
 *
 * - `PAGE_FORM`  — quem lê e preenche em coluna única. Não estica: linha longa demais atrapalha
 *                  formulário e leitura corrida.
 * - `PAGE_LIST`  — lista de registros. Ganha ar em `lg` e passa a duas colunas em `xl`, onde a
 *                  comparação entre plantões (ou entre candidatos) é o que a pessoa está fazendo.
 * - `PAGE_WORK`  — painel e detalhe longo. Abre espaço para a segunda coluna de cada tela, que é
 *                  onde o desktop deixa de ser celular esticado.
 *
 * O teto de `xl` existe para o monitor grande não virar linha infinita.
 */

/** Coluna única de leitura e preenchimento: entrada, cadastro, configurações, perfil. */
export const PAGE_FORM = "mx-auto w-full max-w-2xl px-6 py-7";

/** Lista de registros: uma coluna larga em `lg`, duas em `xl`. */
export const PAGE_LIST = "mx-auto w-full max-w-2xl px-6 py-7 lg:max-w-4xl lg:px-8 xl:max-w-6xl";

/** Painel e detalhe longo: a tela ganha a coluna de apoio a partir de `lg`. */
export const PAGE_WORK = "mx-auto w-full max-w-2xl px-6 py-7 lg:max-w-6xl lg:px-8";

/**
 * Grade de duas colunas do `PAGE_WORK`: conteúdo principal + coluna de apoio.
 * A de apoio é fixa em 340px porque é uma coluna de leitura, não de conteúdo elástico —
 * deixá-la em fração faria os carimbos de hora quebrarem em telas intermediárias.
 */
export const WORK_GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8";

/**
 * A coluna de apoio acompanha a rolagem. `top-6` a afasta do topo da janela; no cabeçalho do
 * celular ela nem existe, porque abaixo de `lg` a grade vira uma coluna só.
 */
export const WORK_ASIDE = "mt-7 lg:sticky lg:top-6 lg:mt-0";

/** Lista de cards que vira duas colunas no monitor grande. */
export const LIST_GRID = "flex flex-col gap-2.5 xl:grid xl:grid-cols-2 xl:items-start";

/**
 * Barra de ação principal do celular (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * A ação decisiva de uma tela longa não pode morar no fim dela. O cuidador abre o atendimento na
 * porta da casa do paciente para **fazer check-in**, e o botão ficava depois do endereço, das
 * informações do paciente e do cuidador. Publicar um atendimento ficava depois de onze
 * atividades. Em tela pequena, isso é uma rolagem inteira entre a intenção e o toque.
 *
 * É um único elemento, não uma cópia: no celular ele sai do fluxo e flutua acima da barra de
 * abas; a partir de `md` volta a ser uma linha de botões no lugar onde foi escrito. Por isso o
 * `md:static` desfaz cada propriedade do estado flutuante em vez de esconder e redesenhar.
 */
export const MOBILE_ACTION_BAR =
  "fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 flex gap-2 border-t border-linha bg-surface-raised/95 px-5 py-3 shadow-raised backdrop-blur-md md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none";

/** Folga no pé da página para a barra flutuante não cobrir o último conteúdo. */
export const MOBILE_ACTION_SPACER = "h-16 md:hidden";
