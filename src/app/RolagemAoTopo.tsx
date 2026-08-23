import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Volta a rolagem ao topo a cada tela nova (docs/DESIGN_SYSTEM.md, seção 6).
 *
 * O produto não tem transição entre telas — a navegação é a troca da árvore, sem animação, e
 * isso é decisão: trocar de aba e abrir o detalhe de um atendimento acontece dezenas de vezes
 * por turno, e um deslize de 250ms em cada uma vira atraso perceptível ao longo do dia.
 *
 * O que substitui a animação é esta garantia: quem entra numa tela nova começa a ler do começo.
 * Sem isto, sair de uma lista rolada até o fim e entrar no detalhe deixa a pessoa no meio da
 * tela nova, sem título à vista, sem saber para onde foi.
 */
export function RolagemAoTopo() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
