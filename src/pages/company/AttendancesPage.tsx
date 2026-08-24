import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import {
  ButtonLink,
  Input,
  SkeletonLista,
  Tabs,
  Vazio,
  type Aba,
} from "../../components/ui";
import { AttendanceList, AttendanceRow } from "../../components/shared/AttendanceRow";
import { AttendanceOpenActions } from "../../components/shared/AttendanceOpenActions";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { companyAttendances, isAwaitingCaregiver } from "../../services/attendances";
import { companyPatients } from "../../services/patients";
import type { Attendance } from "../../types";
import { PAGE_LIST } from "../../components/layout/page";

type Filter = "all" | "awaiting" | "scheduled" | "done" | "draft";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "awaiting", label: "Em aberto" },
  { key: "scheduled", label: "Agendados" },
  { key: "done", label: "Encerrados" },
  { key: "draft", label: "Rascunhos" },
];

function matches(attendance: Attendance, filter: Filter): boolean {
  switch (filter) {
    case "awaiting":
      return isAwaitingCaregiver(attendance);
    case "scheduled":
      return attendance.status === "confirmed" || attendance.status === "in_progress";
    case "done":
      return (
        attendance.status === "completed" ||
        attendance.status === "evaluated" ||
        attendance.status === "cancelled"
      );
    case "draft":
      return attendance.status === "draft";
    default:
      return true;
  }
}

export function CompanyAttendancesPage() {
  const { session } = useSession();
  const { state } = useAppState();
  const [searchParams] = useSearchParams();
  // Permite chegar aqui já filtrado a partir de um link do Início (ex.: "Em aberto").
  const fromQuery = searchParams.get("filtro") as Filter | null;
  const [filter, setFilter] = useState<Filter>(
    fromQuery && FILTERS.some((f) => f.key === fromQuery) ? fromQuery : "all",
  );
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  /* Só governa o celular: a partir de `md` a busca e o período ficam sempre visíveis. */
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const all = useMemo(
    () =>
      state
        ? [...companyAttendances(state, session?.companyId)].sort((a, b) =>
            `${b.startDate}T${b.startTime}`.localeCompare(`${a.startDate}T${a.startTime}`),
          )
        : [],
    [state, session?.companyId],
  );

  if (!state) {
    /* A moldura da lista e o cabeçalho já existem; só as linhas estão chegando. Antes a tela
       inteira sumia atrás de "Carregando…" e voltava com outro layout. */
    return (
      <div className={PAGE_LIST}>
        <h1 className="text-display">Atendimentos</h1>
        <div className="mt-6">
          <SkeletonLista />
        </div>
      </div>
    );
  }

  const company = state.companies.find((c) => c.id === session?.companyId);
  const patients = companyPatients(state, session?.companyId);

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Paciente";
  const caregiverName = (id?: string) =>
    id ? state.caregivers.find((c) => c.id === id)?.name : undefined;

  const term = query.trim().toLowerCase();
  /* O recorte de data e busca vale para a contagem de todas as abas: a contagem precisa dizer
     quanto existe **dentro do filtro corrente**, senão a aba promete dez e entrega dois. */
  const noRecorte = all.filter((a) => {
    if (term && !patientName(a.patientId).toLowerCase().includes(term)) return false;
    if (dateFrom && a.startDate < dateFrom) return false;
    if (dateTo && a.startDate > dateTo) return false;
    return true;
  });
  const visible = noRecorte.filter((a) => matches(a, filter));
  const filtrosAtivos = [query, dateFrom, dateTo].filter(Boolean).length;

  const abas: Aba<Filter>[] = FILTERS.map((f) => ({
    key: f.key,
    label: f.label,
    count: noRecorte.filter((a) => matches(a, f.key)).length,
  }));

  const limparFiltros = () => {
    setQuery("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className={PAGE_LIST}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display">Atendimentos</h1>
          <p className="prosa mt-1 text-body text-ink-subtle">
            Todo o histórico da {company?.name ?? "empresa"}.
          </p>
        </div>
        {/* No celular "Filtros" divide a linha com "Novo atendimento"; no desktop o botão some
            porque a busca e o período já ficam sempre à vista. */}
        <div className="flex w-full gap-2 md:w-auto">
          <button
            type="button"
            onClick={() => setFiltrosAbertos((v) => !v)}
            aria-expanded={filtrosAbertos}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border border-linha bg-surface-raised px-3.5 text-note font-semibold text-ink-muted transition-colors duration-150 ease-out hover:border-accent/45 hover:text-ink md:hidden"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="numero rounded-marker bg-accent px-1.5 py-px text-meta leading-[1.4] text-accent-ink">
                {filtrosAtivos}
              </span>
            )}
          </button>
          <ButtonLink to="/empresa/atendimentos/novo" className="flex-1 md:flex-none">
            <Plus size={15} /> Novo atendimento
          </ButtonLink>
        </div>
      </div>

      {/* Busca por paciente e período: recolhidos atrás do botão "Filtros" no celular pelo mesmo
          motivo do Relatório — quem abre a lista quer ver os atendimentos primeiro, não filtrá-los. */}
      <div
        className={`${filtrosAbertos ? "mt-4 grid" : "hidden"} gap-2.5 md:mt-5 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]`}
      >
        <Input
          label="Paciente"
          placeholder="Buscar por nome"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Input label="De" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input label="Até" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <Tabs
        abas={abas}
        atual={filter}
        onChange={setFilter}
        label="Recorte dos atendimentos"
        className="mt-5"
      />

      {/* A linha de contexto do recorte: quanto está visível e, quando há filtro de texto ou
          período, a saída para desfazê-lo. Sem essa saída, lista vazia por filtro vira beco. */}
      <div className="mt-3 mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="text-meta text-ink-subtle">
          {visible.length === all.length
            ? `${all.length} ${all.length === 1 ? "atendimento" : "atendimentos"}`
            : `${visible.length} de ${all.length} ${all.length === 1 ? "atendimento" : "atendimentos"}`}
        </p>
        {filtrosAtivos > 0 && (
          <button
            type="button"
            onClick={limparFiltros}
            className="inline-flex min-h-11 items-center gap-1 text-meta font-semibold text-accent transition-colors duration-150 ease-out hover:text-accent-strong pointer-fine:min-h-6"
          >
            <X size={12} /> Limpar filtros
          </button>
        )}
      </div>

      <AttendanceList>
        {visible.length === 0 ? (
          <li>
            <Vazio
              acao={
                filtrosAtivos > 0 ? (
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="text-note font-semibold text-accent underline decoration-accent/40 underline-offset-2"
                  >
                    Limpar filtros
                  </button>
                ) : filter === "all" ? (
                  <ButtonLink to="/empresa/atendimentos/novo" size="sm">
                    <Plus size={14} /> Novo atendimento
                  </ButtonLink>
                ) : undefined
              }
            >
              {filter === "all" && filtrosAtivos === 0
                ? "Nenhum atendimento cadastrado ainda."
                : filtrosAtivos > 0
                  ? "Nenhum atendimento neste recorte. Os outros continuam na lista — é o filtro que está estreito."
                  : "Nenhum atendimento neste recorte."}
            </Vazio>
          </li>
        ) : (
          visible.map((a) => {
            const applications = state.applications.filter((ap) => ap.attendanceId === a.id).length;
            return (
              <AttendanceRow
                key={a.id}
                attendance={a}
                to={`/empresa/atendimentos/${a.id}`}
                patientName={patientName(a.patientId)}
                caregiverName={caregiverName(a.confirmedCaregiverId)}
                caregiverId={a.confirmedCaregiverId}
                /* Ação rápida só onde existe ação: o plantão que ainda espera cuidador.
                   Antes ela aparecia em quase toda linha — inclusive nas concluídas, onde
                   "Candidaturas" é arquivo e não próximo passo — e cada linha ganhava 30px de
                   altura por um link que ninguém ia clicar. Com o recorte, a lista volta a ter
                   56px por registro e a linha mais alta passa a significar alguma coisa. */
                actions={
                  isAwaitingCaregiver(a) ? (
                    <AttendanceOpenActions attendance={a} applicationsCount={applications} />
                  ) : null
                }
              />
            );
          })
        )}
      </AttendanceList>
    </div>
  );
}
