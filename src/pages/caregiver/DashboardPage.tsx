import { Link } from "react-router-dom";
import { Star, Clock, Award } from "lucide-react";
import { ButtonLink, Card, Cracha, TelaCarregando } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL, ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { completedHours, todayISO } from "../../services/attendances";
import { caregiverRating } from "../../services/caregivers";
import { caregiverInvitations } from "../../services/invitations";
import { formatCurrency, formatRating } from "../../utils/format";
import { PAGE_LIST } from "../../components/layout/page";

/**
 * Cartão de métrica para dashboard do cuidador
 */
function MetricCard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ size: number; className: string }>;
  variant?: "default" | "highlight";
}) {
  return (
    <div className={`rounded-card border border-linha px-4 py-3 shadow-card ${
      variant === "highlight"
        ? "bg-accent/5 border-accent/20"
        : "bg-white"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-dado text-ink-subtle uppercase">
            {label}
          </div>
          <div className="mt-1.5 text-title font-medium text-ink">
            {value}
          </div>
        </div>
        {Icon && (
          <Icon size={18} className={variant === "highlight" ? "text-accent" : "text-ink-subtle"} />
        )}
      </div>
    </div>
  );
}

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
    <div className={PAGE_LIST}>
      {/* === HEADER === */}
      <h1 className="text-display">Início</h1>
      <p className="prosa mt-1.5 text-body text-ink-muted">{caregiver?.name}</p>

      {/* === MÉTRICAS === */}
      <div className="mt-8 space-y-2">
        {/* Convites - métrica com destaque */}
        <MetricCard
          label="Convites pendentes"
          value={invitations.length}
          icon={Clock}
          variant={invitations.length > 0 ? "highlight" : "default"}
        />

        {/* Horas e avaliação em grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Horas realizadas"
            value={`${Math.round(completedHours(mine))}h`}
          />
          <MetricCard
            label="Avaliação"
            value={
              rating.average === null ? (
                `${rating.count}/3`
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Star size={13} className="fill-rating text-rating" />
                  {formatRating(rating.average)}
                </span>
              )
            }
            icon={Award}
          />
        </div>
      </div>

      {/* === CONTEÚDO PRINCIPAL === */}
      <div className="mt-10 space-y-10 lg:mt-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        {/* Próximo atendimento - item principal */}
        <div className="min-w-0">
          <h2 className="mb-3 text-heading font-medium text-ink">Próximo</h2>
          {!next ? (
            <p className="rounded-card border border-dashed border-linha bg-surface-raised px-4 py-6 text-center text-note text-ink-subtle">
              Nenhum atendimento à frente.
            </p>
          ) : (
            <Link to={`/cuidador/atendimentos/${next.id}`} className="block group">
              <Card className="transition-all duration-150 ease-out group-hover:border-accent/45 group-hover:shadow-raised">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-title">{patientName(next.patientId)}</div>
                    <div className="mt-0.5 text-note text-ink-subtle">
                      {ATTENDANCE_TYPE_LABEL[next.type]} · {next.durationHours}h
                    </div>
                  </div>
                  <Cracha
                    label={ATTENDANCE_STATUS_LABEL[next.status]}
                    className={ATTENDANCE_STATUS_CLASS[next.status]}
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-note text-ink-muted">
                    <span className="numero">
                      {next.startDate.split("-").reverse().join("/")} · {next.startTime}
                    </span>
                    <span className="numero text-ink-muted">{formatCurrency(next.value)}</span>
                  </div>
                  <div className="text-note text-ink-subtle">{next.neighborhood}</div>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Próximos compromissos - lista compacta */}
        <div className="min-w-0">
          <h2 className="mb-3 text-heading font-medium text-ink">
            Agenda{upcoming.length > 1 && ` (${upcoming.length - 1})`}
          </h2>
          {upcoming.length <= 1 ? (
            <p className="rounded-card border border-dashed border-linha bg-surface-raised px-4 py-6 text-center text-note text-ink-subtle">
              Nada além do próximo.
            </p>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(1, 6).map((a) => (
                <Link
                  key={a.id}
                  to={`/cuidador/atendimentos/${a.id}`}
                  className="flex items-center gap-3 rounded-control border border-linha bg-white px-3 py-2.5 shadow-card transition-colors duration-150 ease-out hover:border-accent/45 hover:bg-accent/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-note font-medium text-ink truncate">{patientName(a.patientId)}</div>
                    <div className="mt-0.5 text-dado text-ink-subtle">
                      {a.startDate.split("-").reverse().join("/")} · {a.startTime}
                    </div>
                  </div>
                  <div className="shrink-0 text-note text-ink-muted">{a.durationHours}h</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === CTA SECUNDÁRIO === */}
      {invitations.length > 0 && (
        <div className="mt-10 lg:mt-12">
          <ButtonLink to="/cuidador/convites" className="w-full lg:w-auto">
            Ver {invitations.length} {invitations.length === 1 ? "convite" : "convites"} pendente
            {invitations.length !== 1 ? "s" : ""}
          </ButtonLink>
        </div>
      )}

      {/* Espaço negativo intencional */}
      <div className="mt-16 lg:mt-20" />
    </div>
  );
}
