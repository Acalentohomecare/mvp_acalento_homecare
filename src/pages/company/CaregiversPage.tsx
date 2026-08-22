import { useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { CaregiverCard } from "../../components/shared/CaregiverCard";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "../../constants/caregiver";
import { caregiverRating, filterCaregivers, searchableCaregivers } from "../../services/caregivers";
import type { CaregiverCategory } from "../../types";

type CategoryFilter = CaregiverCategory | "all";

export function CompanyCaregiversPage() {
  const { state } = useAppState();
  const { session } = useSession();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const favoriteIds = useMemo(
    () => state?.companies.find((c) => c.id === session?.companyId)?.favoriteCaregiverIds ?? [],
    [state, session?.companyId],
  );

  const visible = useMemo(() => {
    if (!state) return [];
    return filterCaregivers(searchableCaregivers(state), {
      query,
      category,
      favoritesOnly,
      favoriteIds,
    });
  }, [state, query, category, favoritesOnly, favoriteIds]);

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">
        Carregando…
      </div>
    );
  }

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "Todas" },
    ...CATEGORY_ORDER.map((c) => ({ key: c as CategoryFilter, label: CATEGORY_LABEL[c] })),
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <h1 className="font-display text-[22px] font-semibold">Cuidadores</h1>
        <p className="mt-1 text-[12.5px] text-ink/50">
          Somente cadastros aprovados aparecem na busca.
        </p>

        <label className="mt-5 flex items-center gap-2 rounded-[10px] border-[1.5px] border-linha bg-surface-raised px-3 py-2 transition-colors focus-within:border-accent">
          <Search size={15} className="shrink-0 text-ink/40" />
          <span className="sr-only">Buscar cuidador</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, bairro ou especialidade"
            className="w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink/35"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={category === f.key}
              onClick={() => setCategory(f.key)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 ease-out ${
                category === f.key
                  ? "bg-ink text-surface"
                  : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 ease-out ${
              favoritesOnly
                ? "bg-ink text-surface"
                : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
            }`}
          >
            <Heart size={12} className={favoritesOnly ? "fill-surface" : ""} /> Favoritos
          </button>
        </div>

        <p className="mt-5 mb-2.5 text-[11.5px] text-ink/45">
          {visible.length} {visible.length === 1 ? "cuidador disponível" : "cuidadores disponíveis"}
        </p>

        {visible.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-linha py-10 text-center text-[12.5px] text-ink/45">
            Nenhum cuidador encontrado com esses critérios.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {visible.map((c) => (
              <CaregiverCard
                key={c.id}
                caregiver={c}
                rating={caregiverRating(state.evaluations, c.id)}
                to={`/empresa/cuidadores/${c.id}`}
                favorite={favoriteIds.includes(c.id)}
              />
            ))}
          </div>
        )}
    </div>
  );
}
