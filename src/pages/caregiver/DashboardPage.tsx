import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, Cracha } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL, ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { completedHours, todayISO } from "../../services/attendances";
import { caregiverRating } from "../../services/caregivers";
import { caregiverInvitations } from "../../services/invitations";
import { formatCurrency, formatRating } from "../../utils/format";

export function CaregiverDashboardPage() {
  const { session } = useSession();
  const { state } = useAppState();

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body text-ink/50">Carregando…</div>
    );
  }

  const caregiver = state.caregivers.find((c) => c.id === session?.caregiverId);
  const mine = state.attendances.filter(
    (a) => a.confirmedCaregiverId === session?.caregiverId && a.status !== "cancelled",
  );
  const today = todayISO();
  const upcoming = mine
    .filter((a) => a.startDate >= today && a.status !== "completed" && a.status !== "evaluated")
    .sort((a, b) => `${a.startDate}T${a.startTime}`.localeCompare(`${b.startDate}T${b.startTime}`));
  const next = upcoming[0];
  const invitations = caregiverInvitations(state, session?.caregiverId);
  const rating = caregiverRating(state.evaluations, session?.caregiverId ?? "");

  const patientName = (id: string) => state.patients.find((p) => p.id === id)?.name ?? "Paciente";

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <h1 className="text-display font-semibold">Início</h1>
      <p className="prosa mt-1 text-body text-ink/50">{caregiver?.name}</p>

      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-linha bg-linha sm:grid-cols-3">
        {[
          { label: "Convites", value: String(invitations.length) },
          { label: "Horas realizadas", value: `${Math.round(completedHours(mine))}h` },
          {
            label: "Avaliação",
            value: rating.average === null ? `${rating.count}/3` : formatRating(rating.average),
          },
        ].map((item) => (
          <div key={item.label} className="flex h-full flex-col justify-between gap-2 bg-surface-raised px-3.5 py-3 last:col-span-2 sm:last:col-span-1">
            <div className="text-meta font-medium tracking-wide text-ink/70 uppercase">{item.label}</div>
            <div className="mt-1 flex items-center gap-1 font-mono text-title leading-none">
              {item.label === "Avaliação" && rating.average !== null && (
                <Star size={13} className="fill-accent text-accent" />
              )}
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-7 mb-2.5 text-body font-semibold text-ink">
        Próximo atendimento
      </h2>
      {!next ? (
        <p className="rounded-[14px] border border-dashed border-linha py-6 text-center text-body text-ink/45">
          Nenhum atendimento à frente.
        </p>
      ) : (
        <Link to={`/cuidador/atendimentos/${next.id}`} className="block">
          <Card className="transition-colors duration-200 ease-out hover:border-accent">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-title font-semibold">{patientName(next.patientId)}</div>
                <div className="mt-0.5 text-note text-ink/50">
                  {ATTENDANCE_TYPE_LABEL[next.type]} · {next.durationHours}h
                </div>
              </div>
              <Cracha
                label={ATTENDANCE_STATUS_LABEL[next.status]}
                className={ATTENDANCE_STATUS_CLASS[next.status]}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 text-note text-ink/60">
              <span className="font-mono">
                {next.startDate.split("-").reverse().join("/")} · {next.startTime}
              </span>
              <span>{next.neighborhood}</span>
              <span className="font-mono text-ink/70">{formatCurrency(next.value)}</span>
            </div>
          </Card>
        </Link>
      )}

      <h2 className="mt-7 mb-2.5 text-body font-semibold text-ink">
        Próximos compromissos ({Math.max(upcoming.length - 1, 0)})
      </h2>
      {upcoming.length <= 1 ? (
        <p className="rounded-[14px] border border-dashed border-linha py-6 text-center text-body text-ink/45">
          Nada além do próximo atendimento.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {upcoming.slice(1, 5).map((a) => (
            <Link
              key={a.id}
              to={`/cuidador/atendimentos/${a.id}`}
              className="flex items-center gap-3 rounded-[10px] border border-linha bg-surface-raised px-3 py-2.5 transition-colors duration-200 ease-out hover:border-accent"
            >
              <span className="font-mono text-note text-ink/70">
                {a.startDate.split("-").reverse().slice(0, 2).join("/")}
              </span>
              <span className="min-w-0 flex-1 truncate text-note">{patientName(a.patientId)}</span>
              <span className="font-mono text-note text-ink/50">{a.startTime}</span>
            </Link>
          ))}
        </div>
      )}

      {invitations.length > 0 && (
        <Link
          to="/cuidador/convites"
          className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-note font-semibold text-accent-ink transition-transform duration-[80ms] active:scale-[0.96]"
        >
          Ver {invitations.length} {invitations.length === 1 ? "convite" : "convites"}
        </Link>
      )}
    </div>
  );
}
