import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-label font-medium text-ink/70">{label}</span>
      )}
      <input
        id={id}
        className={`w-full rounded-[10px] border-[1.5px] border-linha bg-surface-raised px-[11px] py-[9px] text-body text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:bg-linha/25 disabled:text-ink/45 ${className}`}
        {...props}
      />
    </label>
  );
}
