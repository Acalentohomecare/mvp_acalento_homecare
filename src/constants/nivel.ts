/**
 * Níveis de sinalização (docs/DESIGN_SYSTEM.md, seção 3.2).
 *
 * O produto tem três vocabulários de cor, e eles respondem a perguntas diferentes:
 *
 * - **estado do atendimento** (`ATTENDANCE_STATUS_*`) — em que situação está este registro;
 * - **tom da linha do tempo** (`<LinhaDoTempo>`) — onde no tempo isto aconteceu;
 * - **nível de sinalização** (este arquivo) — quanta urgência esta linha carrega para quem lê.
 *
 * O nível nasceu do painel de Pendências, onde a cor do ponto era decidida por um booleano
 * `urgente` e não significava nada além de "este é diferente daquele". Quatro níveis, e nenhuma
 * matiz nova: cada um se apoia num token que já existe, porque a regra 4 do design system reserva
 * uma única cor de destaque e uma quinta matiz saturada afastaria a interface do teal da marca.
 *
 * O azul da regra é o `--accent`: teal profundo, que num ponto de 5px lê como azul-petróleo.
 *
 * Duas regras de uso, e as duas valem em toda tela:
 * 1. **Um nível por linha.** Dois pontos na mesma linha é enfeite, não informação.
 * 2. **O nível vem do dado** — `severity`, tipo da notificação, estado do atendimento —, nunca
 *    escrito à mão no JSX.
 */
export type Nivel = "critico" | "atencao" | "informacao" | "sucesso";

/** Tinta do `<PontoNivel>`. */
export const NIVEL_PONTO: Record<Nivel, string> = {
  critico: "bg-status-cancelado",
  atencao: "bg-status-aberto",
  informacao: "bg-accent",
  sucesso: "bg-status-confirmado",
};

/** A mesma cor, para texto e ícone que acompanham o nível. */
export const NIVEL_TINTA: Record<Nivel, string> = {
  critico: "text-status-cancelado",
  atencao: "text-status-aberto",
  informacao: "text-accent",
  sucesso: "text-status-confirmado",
};

/**
 * O nível em palavra, para quem ouve a tela. Cor nunca é a única portadora (regra 3): na tela,
 * quem carrega o nível junto com a tinta é a **ordem** da lista; no leitor de tela, é este rótulo.
 */
export const NIVEL_ROTULO: Record<Nivel, string> = {
  critico: "Atrasado",
  atencao: "Aguardando decisão",
  informacao: "Informativo",
  sucesso: "Resolvido",
};

/** Ordem de leitura: o que já atrasou vem antes do que ainda espera decisão. */
export const NIVEL_ORDEM: Record<Nivel, number> = {
  critico: 0,
  atencao: 1,
  informacao: 2,
  sucesso: 3,
};
