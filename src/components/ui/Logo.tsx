/*
 * Marca do produto (docs/DESIGN_SYSTEM.md, seção 1).
 *
 * O símbolo é `public/logo-mark.png`, o arquivo oficial da marca, exibido direto e sem fundo.
 * O lockup completo (símbolo + palavra) existe em `public/logo-lockup.png` e serve de
 * referência; aqui o nome é texto de verdade, não imagem, para escalar com a tipografia da
 * interface e continuar legível para leitor de tela.
 *
 * Os dois verdes do produto saem daqui: o petróleo dos elos escuros e a sálvia dos claros,
 * amostrados pixel a pixel deste arquivo (ver `src/index.css`). O nome acompanha —
 * "Acalento" na tinta principal, "Gestão" na sálvia, que é como a marca sempre distinguiu as
 * duas palavras. A sálvia do texto é a versão rebaixada (`--brand-sage-ink`): a sálvia da arte
 * fica em 3,0:1 sobre branco e não sustenta uma palavra.
 */

/**
 * O nome do produto, em um lugar só. Os cabeçalhos comparam contra ele: quando a empresa da
 * sessão se chama igual ao produto, mostrar os dois é repetir a mesma palavra em dois níveis de
 * hierarquia — o segundo deixa de informar e só ocupa linha.
 */
export const PRODUTO_NOME = "Acalento Gestão";

interface LogoMarkProps {
  /** Lado do símbolo em px. */
  size?: number;
  className?: string;
}

export function LogoMark({ size = 40, className = "" }: LogoMarkProps) {
  return (
    <img
      src="/logo-mark.png"
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
      <span className="text-ink">Acalento</span>{" "}
        <span className="text-brand-sage-ink">Gestão</span>
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
