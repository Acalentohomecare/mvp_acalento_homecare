import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import {
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
  FIELD_ERROR_TEXT_CLASS,
  FIELD_LABEL_CLASS,
} from "./field";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = "", children, ...props }: SelectProps) {
  const erroId = useId();

  return (
    <label className="block">
      {label && <span className={FIELD_LABEL_CLASS}>{label}</span>}
      {/* A seta nativa do select muda de desenho em cada navegador; trocada pela do produto. */}
      <span className="relative block">
        <select
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? erroId : undefined}
          className={`${FIELD_CLASS} appearance-none pr-9 ${error ? FIELD_ERROR_CLASS : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink/40"
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
