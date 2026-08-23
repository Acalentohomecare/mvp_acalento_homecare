import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { CaregiverCard } from "../../components/shared/CaregiverCard";
import { Button, Card, Cracha, Modal, Textarea } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  APPROVAL_STATUS_CLASS,
  APPROVAL_STATUS_LABEL,
  CATEGORY_CLASS,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
} from "../../constants/caregiver";
import { caregiverRating, filterCaregivers } from "../../services/caregivers";
import {
  approveCaregiver,
  reactivateCaregiver,
  rejectCaregiver,
  rosterCaregivers,
  rosterInactive,
  rosterQueue,
  rosterStatus,
} from "../../services/roster";
import type { CaregiverCategory } from "../../types";

type CategoryFilter = CaregiverCategory | "all";
type Tab = "quadro" | "analise" | "inativos";

/**
 * Cuidadores da empresa. Aqui mora o controle do quadro: é a empresa que confere os documentos e
 * decide quem pode assumir os plantões dela (`services/roster.ts`) — a demo não tem administrador
 * de plataforma.
 */
export function CompanyCaregiversPage() {
  const { state, setState } = useAppState();
  const { session } = useSession();
  const companyId = session?.companyId;

  const [tab, setTab] = useState<Tab>("quadro");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [rejecting, setRejecting] = useState<{ id: string; name: string } | null>(null);
  const [reason, setReason] = useState("");

  const favoriteIds = useMemo(
    () => state?.companies.find((c) => c.id === companyId)?.favoriteCaregiverIds ?? [],
    [state, companyId],
  );

  const roster = useMemo(() => (state ? rosterCaregivers(state, companyId) : []), [state, companyId]);
  const queue = useMemo(() => (state ? rosterQueue(state, companyId) : []), [state, companyId]);
  const inactive = useMemo(() => (state ? rosterInactive(state, companyId) : []), [state, companyId]);

  const visible = useMemo(
    () => filterCaregivers(roster, { query, category, favoritesOnly, favoriteIds }),
    [roster, query, category, favoritesOnly, favoriteIds],
  );

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body text-ink/50">
        Carregando…
      </div>
    );
  }

  const confirmReject = () => {
    if (!rejecting || !companyId) return;
    const motive = reason.trim() || "Documentos não conferem.";
    setState((s) => rejectCaregiver(s, companyId, rejecting.id, motive));
    setRejecting(null);
    setReason("");
  };

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "Todas" },
    ...CATEGORY_ORDER.map((c) => ({ key: c as CategoryFilter, label: CATEGORY_LABEL[c] })),
  ];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "quadro", label: "Meu quadro", count: roster.length },
    { key: "analise", label: "Em análise", count: queue.length },
    { key: "inativos", label: "Inativos", count: inactive.length },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <h1 className="text-display font-semibold">Cuidadores</h1>
      <p className="prosa mt-1 text-body text-ink/50">
        Só quem está no seu quadro aparece na busca e pode ser convidado para um plantão.
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-note font-semibold transition-colors duration-200 ease-out ${
              tab === t.key
                ? "bg-ink text-surface"
                : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`font-mono text-meta ${tab === t.key ? "text-surface/70" : "text-ink/40"}`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "quadro" && (
        <>
          <label className="mt-5 flex items-center gap-2 rounded-[10px] border-[1.5px] border-linha bg-surface-raised px-3 py-2 transition-colors focus-within:border-accent">
            <Search size={15} className="shrink-0 text-ink/40" />
            <span className="sr-only">Buscar cuidador</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, bairro ou especialidade"
              className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink/35"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={category === f.key}
                onClick={() => setCategory(f.key)}
                className={`rounded-full px-3 py-1.5 text-note font-semibold transition-colors duration-200 ease-out ${
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
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-note font-semibold transition-colors duration-200 ease-out ${
                favoritesOnly
                  ? "bg-ink text-surface"
                  : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
              }`}
            >
              <Heart size={12} className={favoritesOnly ? "fill-surface" : ""} /> Favoritos
            </button>
          </div>

          <p className="mt-5 mb-2.5 text-note text-ink/45">
            {visible.length} {visible.length === 1 ? "cuidador no quadro" : "cuidadores no quadro"}
          </p>

          {visible.length === 0 ? (
            <p className="rounded-[14px] border border-dashed border-linha py-10 text-center text-body text-ink/45">
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
        </>
      )}

      {tab === "analise" && (
        <>
          <p className="mt-5 mb-2.5 text-note text-ink/45">
            {queue.length === 0
              ? "Nenhum cadastro aguardando conferência."
              : `${queue.length} cadastro(s) aguardando sua conferência.`}
          </p>

          {queue.length === 0 ? (
            <p className="rounded-[14px] border border-dashed border-linha py-10 text-center text-body text-ink/45">
              Quando um cuidador criar cadastro, ele aparece aqui para conferência.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {queue.map((c) => (
                <Card key={c.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/empresa/cuidadores/${c.id}`}
                        className="text-note font-semibold underline-offset-2 hover:underline"
                      >
                        {c.name}
                      </Link>
                      <div className="mt-0.5 text-note text-ink/50">
                        {c.councilRegistration ?? "Sem registro de conselho (informal)"} · {c.city}
                      </div>
                    </div>
                    <Cracha
                      label={CATEGORY_LABEL[c.category]}
                      className={CATEGORY_CLASS[c.category]}
                    />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRejecting({ id: c.id, name: c.name });
                        setReason("");
                      }}
                    >
                      Recusar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        companyId && setState((s) => approveCaregiver(s, companyId, c.id))
                      }
                    >
                      Aprovar para o quadro
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "inativos" && (
        <>
          <p className="mt-5 mb-2.5 text-note text-ink/45">
            Recusados e bloqueados ficam fora da busca e não recebem convites desta empresa.
          </p>

          {inactive.length === 0 ? (
            <p className="rounded-[14px] border border-dashed border-linha py-10 text-center text-body text-ink/45">
              Ninguém recusado ou bloqueado.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {inactive.map((c) => (
                <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-title font-semibold">{c.name}</div>
                    <div className="mt-0.5 text-note text-ink/50">{c.city}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cracha
                      label={APPROVAL_STATUS_LABEL[rosterStatus(state, companyId, c.id)]}
                      className={APPROVAL_STATUS_CLASS[rosterStatus(state, companyId, c.id)]}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        companyId && setState((s) => reactivateCaregiver(s, companyId, c.id))
                      }
                    >
                      Reconsiderar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {rejecting && (
        <Modal title={`Recusar ${rejecting.name}`} onClose={() => setRejecting(null)}>
          <Textarea
            className="mb-4 h-20"
            placeholder="Ex.: documento de identidade ilegível."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRejecting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmReject}>
              Recusar cadastro
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
