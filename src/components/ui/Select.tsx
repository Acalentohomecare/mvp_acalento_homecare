import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import {
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
  FIELD_ERROR_TEXT_CLASS,
  FIELD_FILTRO_CLASS,
  FIELD_LABEL_CLASS,
} from "./field";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  /**
   * `campo` — o select de formulário: branco, borda de 1,5px, 44px em qualquer ponteiro.
   * `filtro` — o recorte de uma lista que já está na tela. Recua para a faixa de apoio e encolhe
   *   onde o ponteiro é preciso. Sem rótulo visível, passe `aria-label`.
   */
  variant?: "campo" | "filtro";
}

export function Select({
  label,
  error,
  variant = "campo",
  className = "",
  children,
  ...props
}: SelectProps) {
  const erroId = useId();
  const filtro = variant === "filtro";

  return (
    <label className="block">
      {label && <span className={FIELD_LABEL_CLASS}>{label}</span>}
      {/* A seta nativa do select muda de desenho em cada navegador; trocada pela do produto. */}
      <span className="relative block">
        <select
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? erroId : undefined}
          className={`${filtro ? FIELD_FILTRO_CLASS : FIELD_CLASS} appearance-none ${filtro ? "pr-8" : "pr-9"} ${error ? FIELD_ERROR_CLASS : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        {/* A seta acompanha o porte do controle. Ela é a proporção que mais denuncia um select
            encolhido: 16px dentro de uma caixa de 32px ocupa metade da altura e devolve ao filtro
            o peso que a variante inteira existe para tirar. E encosta mais na borda (`right-2.5`),
            porque num controle baixo o mesmo recuo de 12px abre um vão que parece esquecimento. */}
        <ChevronDown
          size={filtro ? 14 : 16}
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-subtle ${
            filtro ? "right-2.5" : "right-3"
          }`}
        />
      </span>
      {error && (
        <span id={erroId} className={FIELD_ERROR_TEXT_CLASS}>
          {error}
        </span>
      )}
    </label>
  );
}
