import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import { CaregiverCard } from "../../components/shared/CaregiverCard";
import { Button, Card, Chip, Cracha, FilterRow, Modal, TelaCarregando, Textarea } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { useToast } from "../../hooks/useToast";
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
import { LIST_GRID, PAGE_LIST } from "../../components/layout/page";

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

  const { avisar } = useToast();
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
    return <TelaCarregando alturaTotal />;
  }

  /*
   * Aprovar e recusar tiram o card da fila — e um card que some não diz qual das duas coisas
   * aconteceu. A confirmação precisa ser dita (DESIGN_SYSTEM.md, seção 8.4).
   */
  const confirmApprove = (id: string, name: string) => {
    if (!companyId) return;
    setState((s) => approveCaregiver(s, companyId, id));
    avisar(`${name} entrou no seu quadro e já pode receber convites.`);
  };

  const confirmReject = () => {
    if (!rejecting || !companyId) return;
    const motive = reason.trim() || "Documentos não conferem.";
    const { name } = rejecting;
    setState((s) => rejectCaregiver(s, companyId, rejecting.id, motive));
    setRejecting(null);
    setReason("");
    avisar(`Cadastro de ${name} recusado. Está em "Inativos".`);
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
    <div className={PAGE_LIST}>
      <h1 className="text-display">Cuidadores</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">
        Só quem está no seu quadro aparece na busca e pode ser convidado para um atendimento.
      </p>

      <FilterRow className="mt-5">
        {tabs.map((t) => (
          <Chip key={t.key} selecionado={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
            {t.count > 0 && (
              <span
                className={`numero text-meta ${tab === t.key ? "text-accent-ink-muted" : "text-ink-subtle"}`}
              >
                {t.count}
              </span>
            )}
          </Chip>
        ))}
      </FilterRow>

      {tab === "quadro" && (
        <>
          {/* O campo não acompanha a largura da lista: uma caixa de busca de 1150px não ajuda
              ninguém a digitar "Centro" e ainda desalinha a página. */}
          <label className="mt-5 flex min-h-11 items-center gap-2 rounded-control border-[1.5px] border-linha-strong bg-surface-raised px-3 py-2 transition-colors focus-within:border-accent lg:max-w-md">
            <Search size={15} className="shrink-0 text-ink-subtle" />
            <span className="sr-only">Buscar cuidador</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, bairro ou especialidade"
              className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-subtle"
            />
          </label>

          <FilterRow className="mt-3">
            {filters.map((f) => (
              <Chip
                key={f.key}
                selecionado={category === f.key}
                onClick={() => setCategory(f.key)}
              >
                {f.label}
              </Chip>
            ))}
            <Chip selecionado={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}>
              <Heart size={12} className={favoritesOnly ? "fill-surface" : ""} /> Favoritos
            </Chip>
          </FilterRow>

          <p className="mt-5 mb-2.5 text-note text-ink-subtle">
            {visible.length} {visible.length === 1 ? "cuidador no quadro" : "cuidadores no quadro"}
          </p>

          {visible.length === 0 ? (
            <p className="rounded-card border border-dashed border-linha py-10 text-center text-body text-ink-subtle">
              Nenhum cuidador encontrado com esses critérios.
            </p>
          ) : (
            <div className={LIST_GRID}>
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
          <p className="mt-5 mb-2.5 text-note text-ink-subtle">
            {queue.length === 0
              ? "Nenhum cadastro aguardando conferência."
              : `${queue.length} cadastro(s) aguardando sua conferência.`}
          </p>

          {queue.length === 0 ? (
            <p className="rounded-card border border-dashed border-linha py-10 text-center text-body text-ink-subtle">
              Quando um cuidador criar cadastro, ele aparece aqui para conferência.
            </p>
          ) : (
            <div className={LIST_GRID}>
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
                      <div className="mt-0.5 text-note text-ink-subtle">
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
                      onClick={() => confirmApprove(c.id, c.name)}
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
          <p className="mt-5 mb-2.5 text-note text-ink-subtle">
            Recusados e bloqueados ficam fora da busca e não recebem convites desta empresa.
          </p>

          {inactive.length === 0 ? (
            <p className="rounded-card border border-dashed border-linha py-10 text-center text-body text-ink-subtle">
              Ninguém recusado ou bloqueado.
            </p>
          ) : (
            <div className={LIST_GRID}>
              {inactive.map((c) => (
                <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-title">{c.name}</div>
                    <div className="mt-0.5 text-note text-ink-subtle">{c.city}</div>
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
