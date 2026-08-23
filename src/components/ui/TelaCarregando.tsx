import { useAtrasoVisivel } from "../../hooks/useAtrasoVisivel";

/**
 * Tela inteira carregando (docs/DESIGN_SYSTEM.md, seção 8.1). Substitui a string "Carregando…"
 * que estava copiada em dezessete telas — cada cópia sem `role`, então a espera não era
 * anunciada para leitor de tela em nenhuma delas.
 *
 * Usa `dvh` e não `vh`: `100vh` no Safari do iPhone é a altura sem a barra de endereço, que só
 * existe depois de rolar, e a tela nasce alta demais com uma rolagem fantasma.
 */
interface TelaCarregandoProps {
  label?: string;
  /** Telas sem o cromo do app (entrada, cadastro, perfil): a espera ocupa a altura toda. */
  alturaTotal?: boolean;
}

export function TelaCarregando({ label = "Carregando…", alturaTotal = false }: TelaCarregandoProps) {
  const visivel = useAtrasoVisivel();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center px-6 text-body text-ink/50 ${
        alturaTotal ? "min-h-[100dvh]" : "min-h-[60dvh]"
      }`}
    >
      {/* O texto só entra depois de 300ms, mas o contêiner ocupa a altura desde o primeiro
          quadro: assim nada salta quando o dado chega dentro da janela. */}
      {visivel ? label : <span className="sr-only">{label}</span>}
    </div>
  );
}
