import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-[11.5px] font-semibold text-ink/60">{label}</span>
      )}
      <textarea
        className={`w-full rounded-[10px] border-[1.5px] border-linha bg-surface-raised px-[11px] py-[9px] text-[13.5px] text-ink outline-none transition-colors focus:border-accent ${className}`}
        {...props}
      />
    </label>
  );
}
