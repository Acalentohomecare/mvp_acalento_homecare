import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = "", children, ...props }: SelectProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-label font-medium text-ink/70">{label}</span>
      )}
      <select
        className={`w-full rounded-[10px] border-[1.5px] border-linha bg-surface-raised px-[11px] py-[9px] text-body text-ink outline-none transition-colors focus:border-accent ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
