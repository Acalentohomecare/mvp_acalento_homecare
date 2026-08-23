import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, SlidersHorizontal } from "lucide-react";
import { ButtonLink, Chip, FilterRow, Input, TelaCarregando } from "../../components/ui";
import { AttendanceCard } from "../../components/shared/AttendanceCard";
import { AttendanceOpenActions } from "../../components/shared/AttendanceOpenActions";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  companyAttendances,
  isAwaitingCaregiver,
} from "../../services/attendances";
import { companyPatients } from "../../services/patients";
import type { Attendance } from "../../types";
import { LIST_GRID, PAGE_LIST } from "../../components/layout/page";

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
    return <TelaCarregando />;
  }

  const company = state.companies.find((c) => c.id === session?.companyId);
  const patients = companyPatients(state, session?.companyId);

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Paciente";
  const caregiverName = (id?: string) =>
    id ? state.caregivers.find((c) => c.id === id)?.name : undefined;

  const term = query.trim().toLowerCase();
  const visible = all.filter((a) => {
    if (!matches(a, filter)) return false;
    if (term && !patientName(a.patientId).toLowerCase().includes(term)) return false;
    if (dateFrom && a.startDate < dateFrom) return false;
    if (dateTo && a.startDate > dateTo) return false;
    return true;
  });
  const filtrosAtivos = [query, dateFrom, dateTo].filter(Boolean).length;

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
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border border-linha bg-surface-raised px-3.5 text-note font-semibold text-ink-muted shadow-card transition-colors duration-150 ease-out hover:border-accent/45 hover:text-ink md:hidden"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 numero text-meta leading-none text-accent-ink">
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
        className={`${filtrosAbertos ? "mt-4 grid" : "hidden"} gap-2.5 md:mt-5 md:grid md:grid-cols-3`}
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

      <FilterRow className="mt-4 md:mt-5">
        {FILTERS.map((f) => (
          <Chip key={f.key} selecionado={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </FilterRow>

      <p className="mt-5 mb-2.5 text-note text-ink-subtle">
        {visible.length} {visible.length === 1 ? "atendimento" : "atendimentos"}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-linha py-10 text-center text-body text-ink-subtle">
          Nenhum atendimento{" "}
          {filter === "all" && filtrosAtivos === 0 ? "cadastrado" : "encontrado com esses filtros"}.
        </p>
      ) : (
        <div className={LIST_GRID}>
          {visible.map((a) => {
            const applications = state.applications.filter((ap) => ap.attendanceId === a.id).length;
            return (
              <AttendanceCard
                key={a.id}
                attendance={a}
                patientName={patientName(a.patientId)}
                caregiverName={caregiverName(a.confirmedCaregiverId)}
                caregiverId={a.confirmedCaregiverId}
                actions={
                  a.status === "draft" || a.status === "cancelled" ? null : (
                    <AttendanceOpenActions attendance={a} applicationsCount={applications} />
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
