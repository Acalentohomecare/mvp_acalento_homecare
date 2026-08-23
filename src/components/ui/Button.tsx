import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { buttonClass } from "./button-classes";
import type { ButtonSize, ButtonVariant } from "./button-classes";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Ação em andamento: desabilita, mostra o giro e anuncia com `aria-busy` (seção 8.1). */
  loading?: boolean;
}

/**
 * Ação clicável do produto (docs/DESIGN_SYSTEM.md, seção 7). As classes vêm de
 * `button-classes.ts`, compartilhadas com o `<ButtonLink>`.
 *
 * `data-movimento="afunda"` é o gancho que a regra de `prefers-reduced-motion` usa para desligar
 * o `active:scale` sem desligar junto a transição de cor (seção 6).
 */
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-movimento="afunda"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={`${buttonClass(variant, size, block)} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={size === "sm" ? 13 : 15} aria-hidden="true" className="girando" />}
      {children}
    </button>
  );
}
