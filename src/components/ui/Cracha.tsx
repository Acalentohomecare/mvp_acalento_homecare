import type { ReactNode } from "react";

interface CrachaProps {
  label: string;
  /** Utilidade Tailwind de background, ex.: "bg-cat-informal", "bg-status-confirmado". */
  className?: string;
  icon?: ReactNode;
}

/**
 * O "crachá" — elemento de assinatura do design system (docs/DESIGN_SYSTEM.md, seção 4):
 * um chip com um entalhe na borda esquerda, usado para categoria de cuidador, selo de
 * verificado, registro no conselho de classe e status de atendimento.
 */
export function Cracha({ label, className = "bg-ink", icon }: CrachaProps) {
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-full py-1 pr-3 pl-3.5 text-meta font-semibold text-white ${className}`}
    >
      <span className="absolute top-1/2 left-1.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/55" />
      <span className="flex items-center gap-1 pl-1.5">
        {icon}
        {label}
      </span>
    </span>
  );
}
