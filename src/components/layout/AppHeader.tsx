import type { ReactNode } from "react";
import { Logo } from "../ui";

export function AppHeader({ subtitle, right }: { subtitle: string; right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-linha bg-surface-nav px-6 py-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Logo variant="inline" size={30} />
        <span className="truncate text-meta text-ink-subtle">{subtitle}</span>
      </div>
      {right}
    </header>
  );
}
