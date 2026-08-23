import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import {
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
  FIELD_ERROR_TEXT_CLASS,
  FIELD_LABEL_CLASS,
} from "./field";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Mensagem de validação. Diz o que fazer, não o que a máquina achou (seção 8.3). */
  error?: string;
}

export function Input({ label, id, error, className = "", ...props }: InputProps) {
  const erroId = useId();

  return (
    <label className="block">
      {label && <span className={FIELD_LABEL_CLASS}>{label}</span>}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? erroId : undefined}
        className={`${FIELD_CLASS} ${error ? FIELD_ERROR_CLASS : ""} ${className}`}
        {...props}
      />
      {error && (
        <span id={erroId} className={FIELD_ERROR_TEXT_CLASS}>
          {error}
        </span>
      )}
    </label>
  );
}
