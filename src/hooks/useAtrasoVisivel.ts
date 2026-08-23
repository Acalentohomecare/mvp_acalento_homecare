import { useEffect, useState } from "react";

/**
 * Segura um indicador de carregamento pelos primeiros milissegundos (docs/DESIGN_SYSTEM.md,
 * seção 8.1).
 *
 * A regra: espera abaixo de 300ms não mostra nada. Um esqueleto que aparece e some em 200ms
 * pisca, e o pisca cansa mais do que a espera que ele queria disfarçar — o dado local desta demo
 * quase sempre chega dentro dessa janela.
 */
export function useAtrasoVisivel(ms = 300): boolean {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisivel(true), ms);
    return () => window.clearTimeout(id);
  }, [ms]);

  return visivel;
}
