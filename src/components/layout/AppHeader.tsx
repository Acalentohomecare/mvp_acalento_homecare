import type { ReactNode } from "react";
import { HeartHandshake } from "lucide-react";

export function AppHeader({ subtitle, right }: { subtitle: string; right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between border-b border-linha px-6 py-4">
      <div className="flex items-center gap-2.5">
        <HeartHandshake className="text-accent-ink" size={20} strokeWidth={1.75} />
        <div>
          <div className="text-title leading-none font-semibold">Acalento Gestão</div>
          <div className="mt-0.5 text-meta text-ink/50">{subtitle}</div>
        </div>
      </div>
      {right}
    </header>
  );
}
