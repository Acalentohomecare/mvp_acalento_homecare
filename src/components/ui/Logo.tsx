/*
 * Marca do produto (docs/DESIGN_SYSTEM.md, seção 1).
 *
 * O símbolo é `public/logo_new.jpeg`, o arquivo corrente da marca, exibido direto. O lockup
 * completo é montado aqui: símbolo do arquivo + nome em texto de verdade, nunca imagem, para
 * escalar com a tipografia da interface e continuar legível para leitor de tela.
 *
 * Os três degraus de teal do produto saem deste arquivo, amostrados pixel a pixel (ver
 * `src/index.css`): o teal profundo dos elos escuros, o teal médio do núcleo e o aqua dos elos
 * claros. O nome acompanha a mesma escala — "Acalento" no teal profundo, "Gestão" no aqua. A
 * segunda palavra sempre teve cor própria no lockup original, e é o aqua que distingue a marca
 * de tudo o que a interface usa. O aqua da arte (#88C3C9) fica em 1,96:1 sobre branco e não
 * sustenta uma palavra: quem entra no texto é `--brand-aqua-ink`, a mesma cor rebaixada.
 *
 * `mix-blend-darken` existe porque o arquivo é JPEG, e JPEG não tem transparência: ele carrega
 * um fundo #F7F7F7 opaco que, sobre a barra lateral ou sobre o fundo do app, apareceria como um
 * quadrado claro em volta do símbolo.
 *
 * `darken` mantém, canal a canal, o menor valor entre o arquivo e a superfície de baixo. Como
 * toda superfície onde a marca aparece é mais escura que #F7F7F7 nos três canais — a barra
 * lateral (#EDF2F3), o fundo do app (#F4F6F7) e o véu da entrada (#DFF1F3) —, o fundo do JPEG
 * é substituído pela superfície **exatamente**, sem resíduo: 1,000:1 de diferença, conferido por
 * cálculo. As três tintas do símbolo são todas mais escuras que qualquer uma dessas superfícies,
 * então passam intactas.
 *
 * `multiply` foi o primeiro candidato e perde aqui: ele escurece o fundo em cerca de 3% em vez
 * de casá-lo, e deixa um quadrado de 1,07:1 visível em todas as superfícies.
 *
 * A única superfície onde sobraria resíduo é o branco puro, e a marca não é usada sobre ele em
 * lugar nenhum do produto.
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
      src="/logo_new.jpeg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`block shrink-0 object-contain mix-blend-darken ${className}`}
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
      <span className="text-brand">Acalento</span>{" "}
      <span className="text-brand-aqua-ink">Gestão</span>
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
