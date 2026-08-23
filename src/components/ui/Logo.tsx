/*
 * Marca do produto (docs/DESIGN_SYSTEM.md, seção 1).
 *
 * O símbolo é o arquivo oficial `public/logo.png` (origem: `docs/Logo/Logo 4.png`), exibido
 * direto, sem nenhum fundo por trás.
 *
 * A Logo 4 resolveu sozinha o problema que a versão anterior tinha: cada forma da arte agora
 * traz contorno escuro, então os três elos azul-gelo — que na Logo 3 ficavam em ~1,1:1 de
 * contraste e sumiam sobre fundo claro — passam a ter borda própria. Conferido sobre branco,
 * sobre a barra lateral (#F0F2F5), sobre o fundo do conteúdo, sobre o véu da entrada e sobre
 * aba escura de navegador, de 170px até 16px. É por isso que não existe mais fundo por trás da
 * marca em lugar nenhum do produto.
 *
 * O nome vem abaixo do símbolo e em caixa normal — "Acalento Gestão", não "ACALENTO GESTÃO".
 * "Gestão" sai na cor da marca, que é o eco do lockup original, onde a segunda palavra sempre
 * teve cor própria.
 */

interface LogoMarkProps {
  /** Lado do símbolo em px. */
  size?: number;
  className?: string;
}

export function LogoMark({ size = 40, className = "" }: LogoMarkProps) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`block shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

interface LogoProps {
  /**
   * `stacked` — símbolo com o nome abaixo (barra lateral, tela de entrada).
   * `inline` — símbolo com o nome ao lado, em uma linha só. Reservado ao cabeçalho do celular,
   *   onde empilhar o lockup somaria uma terceira linha a uma barra que já é apertada.
   */
  variant?: "stacked" | "inline";
  /** Alinhamento do lockup empilhado. */
  align?: "start" | "center";
  size?: number;
  className?: string;
}

/** Lockup completo: símbolo + nome. Usado em toda entrada de tela e de navegação. */
export function Logo({
  variant = "stacked",
  align = "start",
  size = 40,
  className = "",
}: LogoProps) {
  const nome = (fontSize: number) => (
    <span className="leading-none font-semibold" style={{ fontSize, letterSpacing: "-0.015em" }}>
      <span className="text-ink">Acalento</span> <span className="text-accent">Gestão</span>
    </span>
  );

  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <LogoMark size={size} />
        {nome(size * 0.46)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex flex-col gap-2 ${align === "center" ? "items-center" : "items-start"} ${className}`}
    >
      <LogoMark size={size} />
      {nome(size * 0.38)}
    </span>
  );
}
