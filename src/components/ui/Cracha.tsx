import type { ReactNode } from "react";

interface CrachaProps {
  label: string;
  /**
   * Trio de utilidades Tailwind vindo de `constants/` — fundo `-soft`, texto na cor base e
   * borda na mesma cor com opacidade (ex.: `CATEGORY_CLASS`, `ATTENDANCE_STATUS_CLASS`).
   */
  className?: string;
  icon?: ReactNode;
}

/**
 * O "crachá" — elemento de assinatura do design system (docs/DESIGN_SYSTEM.md, seção 7):
 * um chip com um furo de lanyard na borda esquerda, usado para categoria de cuidador, selo de
 * verificado, registro no conselho de classe e status de atendimento.
 *
 * O chip é de tinta sobre fundo claro, não de cor cheia com texto branco. Duas razões: num
 * ambiente azul e branco, seis pastilhas saturadas na mesma lista viram ruído e escondem o que
 * a coordenadora precisa ver (o nome do paciente, o horário); e texto branco sobre âmbar ou
 * sobre sálvia ficava em ~2,2:1 de contraste, abaixo do mínimo legível. Cada par base/`-soft`
 * dos tokens fecha em 4,5:1 ou mais.
 */
export function Cracha({
  label,
  className = "border-linha bg-surface-sunken text-ink/70",
  icon,
}: CrachaProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full border py-[3px] pr-2.5 pl-3 text-meta font-semibold ${className}`}
    >
      <span className="absolute top-1/2 left-[7px] size-1.5 -translate-y-1/2 rounded-full bg-current opacity-65" />
      <span className="flex items-center gap-1 pl-1.5">
        {icon}
        {label}
      </span>
    </span>
  );
}
