import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { ButtonLink, Card, Cracha, TelaCarregando } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL, ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { completedHours, todayISO } from "../../services/attendances";
import { caregiverRating } from "../../services/caregivers";
import { caregiverInvitations } from "../../services/invitations";
import { formatCurrency, formatRating } from "../../utils/format";
import { PAGE_WORK } from "../../components/layout/page";

export function CaregiverDashboardPage() {
  const { session } = useSession();
  const { state } = useAppState();

  if (!state) {
    return <TelaCarregando />;
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
    <div className={PAGE_WORK}>
      <h1 className="text-display font-semibold">Início</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">{caregiver?.name}</p>

      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-linha bg-linha shadow-card sm:grid-cols-3">
        {[
          { label: "Convites", value: String(invitations.length) },
          { label: "Horas realizadas", value: `${Math.round(completedHours(mine))}h` },
          {
            label: "Avaliação",
            value: rating.average === null ? `${rating.count}/3` : formatRating(rating.average),
          },
        ].map((item) => (
          <div key={item.label} className="flex h-full flex-col justify-between gap-2 bg-surface-raised px-3.5 py-3 last:col-span-2 sm:last:col-span-1">
            <div className="text-meta font-medium tracking-wide text-ink-subtle uppercase">{item.label}</div>
            <div className="mt-1 flex items-center gap-1 font-mono text-title leading-none font-medium text-accent">
              {item.label === "Avaliação" && rating.average !== null && (
                <Star size={13} className="fill-rating text-rating" />
              )}
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-7 mb-2.5 text-label font-semibold tracking-wide text-ink-subtle uppercase">
        Próximo atendimento
      </h2>
      {!next ? (
        <p className="rounded-card border border-dashed border-linha bg-surface-raised/50 py-7 text-center text-note text-ink-subtle">
          Nenhum atendimento à frente.
        </p>
      ) : (
        <Link to={`/cuidador/atendimentos/${next.id}`} className="block">
          <Card className="transition-[border-color,box-shadow] duration-150 ease-out hover:border-accent/45 hover:shadow-raised">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-title font-semibold">{patientName(next.patientId)}</div>
                <div className="mt-0.5 text-note text-ink-subtle">
                  {ATTENDANCE_TYPE_LABEL[next.type]} · {next.durationHours}h
                </div>
              </div>
              <Cracha
                label={ATTENDANCE_STATUS_LABEL[next.status]}
                className={ATTENDANCE_STATUS_CLASS[next.status]}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 text-note text-ink-muted">
              <span className="font-mono">
                {next.startDate.split("-").reverse().join("/")} · {next.startTime}
              </span>
              <span>{next.neighborhood}</span>
              <span className="font-mono text-ink-muted">{formatCurrency(next.value)}</span>
            </div>
          </Card>
        </Link>
      )}

      <h2 className="mt-7 mb-2.5 text-label font-semibold tracking-wide text-ink-subtle uppercase">
        Próximos compromissos ({Math.max(upcoming.length - 1, 0)})
      </h2>
      {upcoming.length <= 1 ? (
        <p className="rounded-card border border-dashed border-linha bg-surface-raised/50 py-7 text-center text-note text-ink-subtle">
          Nada além do próximo atendimento.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {upcoming.slice(1, 5).map((a) => (
            <Link
              key={a.id}
              to={`/cuidador/atendimentos/${a.id}`}
              className="flex items-center gap-3 rounded-control border border-linha bg-surface-raised px-3 py-2.5 shadow-card transition-colors duration-150 ease-out hover:border-accent/45"
            >
              <span className="font-mono text-note text-ink-muted">
                {a.startDate.split("-").reverse().slice(0, 2).join("/")}
              </span>
              <span className="min-w-0 flex-1 truncate text-note">{patientName(a.patientId)}</span>
              <span className="font-mono text-note text-ink-subtle">{a.startTime}</span>
            </Link>
          ))}
        </div>
      )}

      {invitations.length > 0 && (
        <ButtonLink to="/cuidador/convites" className="mt-6">
          Ver {invitations.length} {invitations.length === 1 ? "convite" : "convites"}
        </ButtonLink>
      )}
    </div>
  );
}
