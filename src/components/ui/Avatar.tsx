interface AvatarProps {
  name: string;
  size?: number;
}

/**
 * Foto do cuidador é simulada na demo (CLAUDE.md §35) — mostramos as iniciais em um círculo
 * na cor da marca dessaturada, sem cor aleatória, para não competir com o crachá de categoria.
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
      className="text-accent ring-accent/10 inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold ring-1"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}
