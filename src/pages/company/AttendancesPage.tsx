import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ACTION_LINK_CLASS, ButtonLink, Chip, FilterRow, TelaCarregando } from "../../components/ui";
import { AttendanceCard } from "../../components/shared/AttendanceCard";
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
  const [filter, setFilter] = useState<Filter>("all");

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
  const visible = all.filter((a) => matches(a, filter));

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Paciente";
  const caregiverName = (id?: string) =>
    id ? state.caregivers.find((c) => c.id === id)?.name : undefined;

  return (
    <div className={PAGE_LIST}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display">Atendimentos</h1>
          <p className="prosa mt-1 text-body text-ink-subtle">
            Todo o histórico da {company?.name ?? "empresa"}.
          </p>
        </div>
        <ButtonLink to="/empresa/atendimentos/novo">
          <Plus size={15} /> Novo atendimento
        </ButtonLink>
      </div>

      <FilterRow className="mt-5">
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
          Nenhum atendimento {filter === "all" ? "cadastrado" : "nesse filtro"}.
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
                actions={
                  a.status === "draft" || a.status === "cancelled" ? null : (
                    <>
                      {isAwaitingCaregiver(a) && (
                        <Link to={`/empresa/atendimentos/${a.id}/cuidadores`} className={ACTION_LINK_CLASS}>
                          Buscar cuidadores
                        </Link>
                      )}
                      <Link to={`/empresa/atendimentos/${a.id}/candidaturas`} className={ACTION_LINK_CLASS}>
                        Candidaturas{applications > 0 && ` (${applications})`}
                      </Link>
                    </>
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
