import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, MapPin } from "lucide-react";
import { Button, Card, Cracha } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL, ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { CATEGORY_LABEL } from "../../constants/caregiver";
import { attendanceRequiredCategory } from "../../services/attendances";
import {
  acceptInvitation,
  applyToOpenAttendance,
  attendanceById,
  canSeeFullAddress,
  caregiverConfirmedAttendances,
  caregiverInvitations,
  openOpportunities,
  rejectInvitation,
} from "../../services/invitations";
import { compatibleCaregivers } from "../../services/matching";
import { formatCurrency } from "../../utils/format";
import type { Attendance } from "../../types";

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 text-body font-semibold text-ink">
        {title} ({count})
      </h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-[14px] border border-dashed border-linha py-6 text-center text-body text-ink/45">
      {text}
    </p>
  );
}

export function CaregiverInvitationsPage() {
  const { session } = useSession();
  const { state, setState } = useAppState();
  const [error, setError] = useState("");

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body text-ink/50">
        Carregando…
      </div>
    );
  }

  const caregiverId = session?.caregiverId;
  const invitations = caregiverInvitations(state, caregiverId);
  const confirmed = caregiverConfirmedAttendances(state, caregiverId);

  // Publicação aberta só vale para quem o próprio matching consideraria compatível (R2/R3).
  const opportunities = openOpportunities(state, caregiverId).filter((a) =>
    compatibleCaregivers(state, a).some((c) => c.id === caregiverId),
  );

  const patientName = (id: string) => state.patients.find((p) => p.id === id)?.name ?? "Paciente";
  const day = (a: Attendance) => a.startDate.split("-").reverse().join("/");

  const summary = (a: Attendance) => (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-title font-semibold">{patientName(a.patientId)}</div>
          <div className="mt-0.5 text-note text-ink/50">
            {ATTENDANCE_TYPE_LABEL[a.type]} · {a.durationHours}h
          </div>
        </div>
        <Cracha
          label={ATTENDANCE_STATUS_LABEL[a.status]}
          className={ATTENDANCE_STATUS_CLASS[a.status]}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-note text-ink/60">
        <span className="font-mono">
          {day(a)} · {a.startTime}
        </span>
        <span className="font-mono text-ink/70">{formatCurrency(a.value)}</span>
      </div>
      <div className="mt-1.5 inline-flex items-start gap-1.5 text-note">
        {canSeeFullAddress(a, caregiverId) ? (
          <>
            <MapPin size={12} className="mt-0.5 shrink-0 text-ink/40" />
            <span className="text-ink/70">
              {a.street}, {a.number} — {a.neighborhood}
            </span>
          </>
        ) : (
          <>
            <Lock size={12} className="mt-0.5 shrink-0 text-ink/40" />
            <span className="text-ink/50">
              {a.neighborhood} — endereço completo liberado após a confirmação.
            </span>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <Link
        to="/cuidador"
        className="inline-flex items-center gap-1.5 text-note text-ink/50 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> Início
      </Link>

      <h1 className="mt-3 text-display font-semibold">Convites</h1>

      {error && (
        <p className="mt-3 rounded-[10px] border border-status-cancelado/40 px-3 py-2 text-note text-status-cancelado">
          {error}
        </p>
      )}

      <Section title="Convites recebidos" count={invitations.length}>
        {invitations.length === 0 ? (
          <Empty text="Nenhum convite no momento." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {invitations.map((invitation) => {
              const attendance = attendanceById(state, invitation.attendanceId);
              if (!attendance) return null;
              return (
                <Card key={invitation.id}>
                  {summary(attendance)}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        const result = acceptInvitation(state, invitation.id);
                        if (result.error) return setError(result.error);
                        setError("");
                        setState(result.nextState);
                      }}
                    >
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setError("");
                        setState((s) => rejectInvitation(s, invitation.id));
                      }}
                    >
                      Recusar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Publicações abertas" count={opportunities.length}>
        {opportunities.length === 0 ? (
          <Empty text="Nenhuma publicação aberta compatível." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {opportunities.map((a) => (
              <Card key={a.id}>
                {summary(a)}
                <Button
                  size="sm"
                  variant="primary"
                  className="mt-3"
                  onClick={() => {
                    const result = applyToOpenAttendance(state, a.id, caregiverId as string);
                    if (result.error) return setError(result.error);
                    setError("");
                    setState(result.nextState);
                  }}
                >
                  Candidatar-se
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Confirmados para você" count={confirmed.length}>
        {confirmed.length === 0 ? (
          <Empty text="Nenhum atendimento confirmado." />
        ) : (
          <div className="flex flex-col gap-2.5">
            {confirmed.map((a) => (
              <Card key={a.id}>
                {summary(a)}
                <p className="mt-2 text-meta text-ink/40">
                  Perfil exigido: {CATEGORY_LABEL[attendanceRequiredCategory(a.activityIds)]}
                </p>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
