import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { AttendanceCard } from "../../components/shared/AttendanceCard";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  canPublishAttendance,
  companyAttendances,
  isAwaitingCaregiver,
} from "../../services/attendances";
import { companyPatients } from "../../services/patients";
import type { Attendance } from "../../types";

const ACTION_CLASS =
  "rounded-[10px] border border-linha px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-accent";

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
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink/50">
        Carregando…
      </div>
    );
  }

  const company = state.companies.find((c) => c.id === session?.companyId);
  const patients = companyPatients(state, session?.companyId);
  const visible = all.filter((a) => matches(a, filter));

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Paciente";
  const caregiverName = (id?: string) =>
    id ? state.caregivers.find((c) => c.id === id)?.name : undefined;

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold">Atendimentos</h1>
          <p className="mt-1 text-[12.5px] text-ink/50">
            Todo o histórico da {company?.name ?? "empresa"}.
          </p>
        </div>
        {canPublishAttendance(company) && (
          <Link
            to="/empresa/atendimentos/novo"
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-accent-ink transition-transform duration-[80ms] active:scale-[0.96]"
          >
            <Plus size={15} /> Novo atendimento
          </Link>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 ease-out ${
              filter === f.key
                ? "bg-ink text-surface"
                : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2.5 text-[11.5px] text-ink/45">
        {visible.length} {visible.length === 1 ? "atendimento" : "atendimentos"}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-linha py-10 text-center text-[12.5px] text-ink/45">
          Nenhum atendimento {filter === "all" ? "cadastrado" : "nesse filtro"}.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
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
                        <Link to={`/empresa/atendimentos/${a.id}/cuidadores`} className={ACTION_CLASS}>
                          Buscar cuidadores
                        </Link>
                      )}
                      <Link to={`/empresa/atendimentos/${a.id}/candidaturas`} className={ACTION_CLASS}>
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
