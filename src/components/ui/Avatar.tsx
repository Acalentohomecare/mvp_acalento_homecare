interface AvatarProps {
  name: string;
  size?: number;
}

/**
 * Foto do cuidador é simulada na demo (CLAUDE.md §35) — mostramos as iniciais em um círculo
 * neutro, sem cor aleatória, para não competir com o crachá de categoria.
 */
export function Avatar({ name, size = 40 }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink/10 font-semibold text-ink/70"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}
