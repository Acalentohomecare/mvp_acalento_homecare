import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import {
  FIELD_CLASS,
  FIELD_ERROR_CLASS,
  FIELD_ERROR_TEXT_CLASS,
  FIELD_LABEL_CLASS,
} from "./field";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  const erroId = useId();

  return (
    <label className="block">
      {label && <span className={FIELD_LABEL_CLASS}>{label}</span>}
      <textarea
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? erroId : undefined}
        className={`${FIELD_CLASS} resize-y ${error ? FIELD_ERROR_CLASS : ""} ${className}`}
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
