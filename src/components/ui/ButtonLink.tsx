import { Link } from "react-router-dom";
import type { ComponentProps } from "react";
import { buttonClass } from "./button-classes";
import type { ButtonSize, ButtonVariant } from "./button-classes";

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

/**
 * Ação que navega (docs/DESIGN_SYSTEM.md, seção 7). `<Button>` renderiza `<button>` e não serve
 * aqui: um destino precisa de `<a>` para abrir em nova aba, aparecer no menu de contexto e ser
 * anunciado como link.
 *
 * Existe porque a string de classes da variante `primary` estava copiada em três telas
 * (`AttendancesPage`, `company/DashboardPage`, `caregiver/DashboardPage`) e já era questão de
 * tempo até divergirem. As classes vêm de `buttonClass()`, a mesma fonte do `<Button>`.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      data-movimento="afunda"
      className={`${buttonClass(variant, size, block)} ${className}`}
      {...props}
    />
  );
}
