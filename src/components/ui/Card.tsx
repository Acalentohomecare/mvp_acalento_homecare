import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[14px] border border-linha bg-surface-raised p-3.5 ${className}`}
      {...props}
    />
  );
}
