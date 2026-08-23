import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";

type Tom = "erro" | "sucesso" | "info";

interface AvisoProps {
  tom?: Tom;
  children: ReactNode;
  /** Ação de recuperação — em erro de sistema, o "Tentar de novo" (seção 8.3). */
  acao?: ReactNode;
  className?: string;
}

/**
 * Bloco de mensagem no fluxo da tela (docs/DESIGN_SYSTEM.md, seção 8.3).
 *
 * Fica **imediatamente acima da ação que falhou**, não no topo da página: em formulário longo no
 * celular, uma mensagem no topo já saiu da tela quando o dedo aperta o botão lá embaixo.
 *
 * O `role` é a parte que faltava. Sem ele, quem usa leitor de tela aperta "Publicar", nada
 * acontece e nada é anunciado — a ação falha em silêncio. Erro usa `alert` (interrompe);
 * sucesso e informação usam `status` (espera a brecha).
 */
const TOM_CLASSES: Record<Tom, string> = {
  erro: "border-status-cancelado/40 bg-status-cancelado-soft text-status-cancelado",
  sucesso: "border-status-confirmado/40 bg-status-confirmado-soft text-status-confirmado",
  info: "border-linha bg-surface-sunken text-ink/70",
};

const TOM_ICONE: Record<Tom, typeof Info> = {
  erro: CircleAlert,
  sucesso: CircleCheck,
  info: Info,
};

export function Aviso({ tom = "erro", children, acao, className = "" }: AvisoProps) {
  const Icone = TOM_ICONE[tom];

  return (
    <div
      role={tom === "erro" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-control border px-3 py-2 text-note ${TOM_CLASSES[tom]} ${className}`}
    >
      {/* O ícone é reforço; a cor nunca é a única portadora (regra 3). O texto já diz tudo. */}
      <Icone size={15} aria-hidden="true" className="mt-[3px] shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
