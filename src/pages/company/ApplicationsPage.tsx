import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Avatar, Button, Card, Cracha, Modal, Textarea } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { CATEGORY_CLASS, CATEGORY_LABEL } from "../../constants/caregiver";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL } from "../../constants/attendance";
import { caregiverRating } from "../../services/caregivers";
import {
  attendanceApplications,
  attendanceById,
  attendanceInvitations,
  cancelAttendance,
  confirmApplication,
} from "../../services/invitations";
import { formatRating } from "../../utils/format";

const APPLICATION_LABEL = {
  pending: "Aguardando decisão",
  confirmed: "Confirmado",
  not_selected: "Não selecionado",
} as const;

export function ApplicationsPage() {
  const { attendanceId } = useParams();
  const { session } = useSession();
  const { state, setState } = useAppState();
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body text-ink/50">
        Carregando…
      </div>
    );
  }

  const attendance = attendanceById(state, attendanceId);
  if (!attendance || attendance.companyId !== session?.companyId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center">
        <p className="text-note text-ink/60">Atendimento não encontrado.</p>
        <Link to="/empresa/atendimentos" className="mt-4 inline-block text-note underline">
          Voltar aos atendimentos
        </Link>
      </div>
    );
  }

  const patient = state.patients.find((p) => p.id === attendance.patientId);
  const applications = attendanceApplications(state, attendance.id);
  const pendingInvites = attendanceInvitations(state, attendance.id).filter((i) => i.status === "sent");
  const isClosed = attendance.status === "cancelled" || Boolean(attendance.confirmedCaregiverId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <Link
        to="/empresa/atendimentos"
        className="inline-flex items-center gap-1.5 text-note text-ink/50 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> Atendimentos
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-display font-semibold">Candidaturas</h1>
          <p className="prosa mt-1 text-body text-ink/50">
            {patient?.name} · {attendance.startDate.split("-").reverse().join("/")} às{" "}
            {attendance.startTime}
          </p>
        </div>
        <Cracha
          label={ATTENDANCE_STATUS_LABEL[attendance.status]}
          className={ATTENDANCE_STATUS_CLASS[attendance.status]}
        />
      </div>

      {attendance.cancellation && (
        <Card className="mt-4 border-status-cancelado/40">
          <p className="text-body text-ink/75">
            Cancelado por {attendance.cancellation.by === "company" ? "empresa" : "cuidador"} com{" "}
            {attendance.cancellation.noticeHours}h de antecedência
            {attendance.cancellation.noticeHours < 12 && " (menos de 12h)"}: {attendance.cancellation.reason}
          </p>
        </Card>
      )}

      {pendingInvites.length > 0 && (
        <p className="mt-4 text-note text-ink/50">
          {pendingInvites.length}{" "}
          {pendingInvites.length === 1 ? "convite aguardando resposta" : "convites aguardando resposta"}.
        </p>
      )}

      <h2 className="mt-5 mb-2.5 text-body font-semibold text-ink">
        Interessados ({applications.length})
      </h2>

      {applications.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-linha py-10 text-center text-body text-ink/45">
          Nenhuma candidatura ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {applications.map((application) => {
            const caregiver = state.caregivers.find((c) => c.id === application.caregiverId);
            if (!caregiver) return null;
            const rating = caregiverRating(state.evaluations, caregiver.id);
            return (
              <Card key={application.id} className="flex items-start gap-3">
                <Avatar name={caregiver.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-title font-semibold">{caregiver.name}</span>
                    <span className="text-meta text-ink/45">
                      {APPLICATION_LABEL[application.status]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Cracha
                      label={CATEGORY_LABEL[caregiver.category]}
                      className={CATEGORY_CLASS[caregiver.category]}
                    />
                    {rating.average !== null && (
                      <span className="inline-flex items-center gap-1 text-note font-semibold text-ink/70">
                        <Star size={12} className="fill-accent text-accent" />
                        {formatRating(rating.average)}
                      </span>
                    )}
                    <span className="text-note text-ink/50">
                      {caregiver.experienceYears} anos · {caregiver.neighborhoods.join(", ")}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/empresa/cuidadores/${caregiver.id}`}
                      className="rounded-[10px] border border-linha px-2.5 py-1.5 text-label font-semibold transition-colors hover:border-accent"
                    >
                      Ver perfil
                    </Link>
                    {application.status === "pending" && !isClosed && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setState((s) => confirmApplication(s, application.id))}
                      >
                        Confirmar cuidador
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {attendance.status !== "cancelled" && (
        <Button variant="destructive" size="sm" className="mt-6" onClick={() => setCancelling(true)}>
          Cancelar atendimento
        </Button>
      )}

      {cancelling && (
        <Modal title="Cancelar atendimento" onClose={() => setCancelling(false)}>
          <Textarea
            className="mb-4 h-20"
            placeholder="Motivo do cancelamento"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelling(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setState((s) =>
                  cancelAttendance(s, attendance.id, "company", reason.trim() || "Sem motivo informado."),
                );
                setCancelling(false);
                setReason("");
              }}
            >
              Cancelar atendimento
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
