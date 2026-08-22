import { useState } from "react";
import { Link } from "react-router-dom";
import { Cracha } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL } from "../../constants/attendance";
import { companyAttendances, scheduleDays } from "../../services/attendances";
import { formatCurrency } from "../../utils/format";

const WEEKDAY = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function SchedulePage() {
  const { session } = useSession();
  const { state } = useAppState();
  const [range, setRange] = useState<1 | 7>(7);

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink/50">Carregando…</div>
    );
  }

  const isCompany = session?.role === "company";
  const list = isCompany
    ? companyAttendances(state, session?.companyId)
    : state.attendances.filter((a) => a.confirmedCaregiverId === session?.caregiverId);

  const days = scheduleDays(list, new Date(), range);
  const total = days.reduce((sum, d) => sum + d.items.length, 0);
  const base = isCompany ? "/empresa/atendimentos" : "/cuidador/atendimentos";

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <h1 className="font-display text-[22px] font-semibold">
        {isCompany ? "Escala" : "Minha agenda"}
      </h1>
      <p className="mt-1 text-[12.5px] text-ink/50">
        {total} {total === 1 ? "atendimento" : "atendimentos"} no período.
      </p>

      <div className="mt-4 flex gap-1.5">
        {([1, 7] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-200 ease-out ${
              range === r
                ? "bg-ink text-surface"
                : "border border-linha bg-surface-raised text-ink/60 hover:border-accent"
            }`}
          >
            {r === 1 ? "Hoje" : "Semana"}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {days.map((day) => {
          const [, month, dayNumber] = day.date.split("-");
          const weekday = WEEKDAY[new Date(`${day.date}T12:00`).getDay()];
          return (
            <div key={day.date}>
              <div className="mb-2 flex items-baseline gap-2 border-b border-linha pb-1.5">
                <span className="font-mono text-[13px] font-semibold">
                  {dayNumber}/{month}
                </span>
                <span className="text-[11.5px] text-ink/45">{weekday}</span>
              </div>

              {day.items.length === 0 ? (
                <p className="py-1 text-[12px] text-ink/35">Sem atendimentos.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {day.items.map((a) => {
                    const patient = state.patients.find((p) => p.id === a.patientId);
                    const caregiver = state.caregivers.find((c) => c.id === a.confirmedCaregiverId);
                    return (
                      <Link
                        key={a.id}
                        to={`${base}/${a.id}`}
                        className="flex items-center gap-3 rounded-[10px] border border-linha bg-surface-raised px-3 py-2.5 transition-colors duration-200 ease-out hover:border-accent"
                      >
                        <span className="font-mono text-[12.5px] text-ink/70">{a.startTime}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold">
                            {patient?.name}
                          </span>
                          <span className="block truncate text-[11px] text-ink/50">
                            {isCompany
                              ? (caregiver?.name ?? "Sem cuidador definido")
                              : `${a.neighborhood} · ${formatCurrency(a.value)}`}
                          </span>
                        </span>
                        <Cracha
                          label={ATTENDANCE_STATUS_LABEL[a.status]}
                          className={ATTENDANCE_STATUS_CLASS[a.status]}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
