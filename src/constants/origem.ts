/**
 * De onde a ficha do atendimento foi aberta.
 *
 * O "voltar" da ficha apontava sempre para a Agenda. Quem chegava por Atendimentos voltava para
 * outra tela — e perdia a aba e os filtros em que estava; quem chegava por uma pendência do Início
 * voltava para um lugar onde nunca esteve. A origem viaja no `state` do link (React Router), então
 * sobrevive ao recarregar da página e simplesmente não existe quando a URL é aberta direto — caso
 * em que a Agenda continua sendo o destino padrão.
 */
export type OrigemFicha = "inicio" | "atendimentos" | "agenda";

/** O que o link carrega: `state={DE_ATENDIMENTOS}` na tela que abre a ficha. */
export interface EstadoDeOrigem {
  de: OrigemFicha;
}

export const DE_INICIO: EstadoDeOrigem = { de: "inicio" };
export const DE_ATENDIMENTOS: EstadoDeOrigem = { de: "atendimentos" };

const DESTINOS: Record<"company" | "caregiver", Record<OrigemFicha, { to: string; rotulo: string }>> = {
  company: {
    inicio: { to: "/empresa", rotulo: "Início" },
    atendimentos: { to: "/empresa/atendimentos", rotulo: "Atendimentos" },
    agenda: { to: "/empresa/agenda", rotulo: "Agenda" },
  },
  caregiver: {
    inicio: { to: "/cuidador", rotulo: "Início" },
    atendimentos: { to: "/cuidador/atendimentos", rotulo: "Atendimentos" },
    agenda: { to: "/cuidador/agenda", rotulo: "Agenda" },
  },
};

/** O destino do "voltar": a tela de origem quando ela veio no link, a Agenda quando não veio. */
export function voltarPara(role: "company" | "caregiver", state: unknown) {
  const destinos = DESTINOS[role];
  const de = (state as EstadoDeOrigem | null)?.de;
  return de && destinos[de] ? destinos[de] : destinos.agenda;
}
