import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import {
  ACTION_LINK_CLASS,
  Avatar,
  Aviso,
  Button,
  Cracha,
  Modal,
  Painel,
  StatusAtendimento,
  TelaCarregando,
  Textarea,
  Vazio,
  VoltarLink,
} from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { CATEGORY_CLASS, CATEGORY_LABEL } from "../../constants/caregiver";
import { caregiverRating } from "../../services/caregivers";
import {
  attendanceApplications,
  attendanceById,
  attendanceInvitations,
  cancelAttendance,
  confirmApplication,
  seriesMembers,
} from "../../services/invitations";
import { resumoDaSerie, rotuloDaSerie } from "../../services/attendances";
import { formatRating } from "../../utils/format";
import { rotuloDoDia } from "../../utils/date";
import { PAGE_LIST } from "../../components/layout/page";

/**
 * Situação da candidatura. Fica em texto na tinta do estado, não numa pastilha: numa lista de
 * candidatos, o crachá que importa é o da **credencial** (a categoria do cuidador) — o estado da
 * candidatura é informação de coluna, e duas pastilhas por linha disputam entre si.
 */
const APPLICATION_LABEL = {
  pending: "Aguardando decisão",
  confirmed: "Confirmado",
  not_selected: "Não selecionado",
} as const;

const APPLICATION_TINT = {
  pending: "text-status-aberto",
  confirmed: "text-status-confirmado",
  not_selected: "text-ink-subtle",
} as const;

export function ApplicationsPage() {
  const { attendanceId } = useParams();
  const { session } = useSession();
  const { state, setState } = useAppState();
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  if (!state) {
    return <TelaCarregando />;
  }

  const attendance = attendanceById(state, attendanceId);
  if (!attendance || attendance.companyId !== session?.companyId) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10 text-center">
        <p className="text-note text-ink-muted">Atendimento não encontrado.</p>
        <Link to="/empresa/atendimentos" className="mt-4 inline-block text-note underline">
          Voltar aos atendimentos
        </Link>
      </div>
    );
  }

  const patient = state.patients.find((p) => p.id === attendance.patientId);
  const applications = attendanceApplications(state, attendance.id);
  /* Confirmar aqui fecha a contratação inteira quando o atendimento faz parte de uma escala. */
  const membrosDaSerie = seriesMembers(state, attendance);
  const serie = membrosDaSerie.length > 1 ? resumoDaSerie(membrosDaSerie) : null;
  const pendingInvites = attendanceInvitations(state, attendance.id).filter((i) => i.status === "sent");
  const isClosed = attendance.status === "cancelled" || Boolean(attendance.confirmedCaregiverId);

  return (
    <div className={PAGE_LIST}>
      <VoltarLink to="/empresa/atendimentos">Atendimentos</VoltarLink>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-display">Candidaturas</h1>
          <p className="prosa mt-1 text-body text-ink-subtle">
            {patient?.name} ·{" "}
            <span className="numero">
              {rotuloDoDia(attendance.startDate)}, {attendance.startTime}
            </span>
          </p>
        </div>
        <StatusAtendimento status={attendance.status} variant="bloco" className="mt-1" />
      </div>

      {serie && (
        <p className="prosa mt-2 text-note text-ink-muted">
          {rotuloDaSerie(serie)} — confirmar um cuidador vale para a escala inteira.
        </p>
      )}

      {attendance.cancellation && (
        <Aviso className="mt-4">
          Cancelado pel{attendance.cancellation.by === "company" ? "a empresa" : "o cuidador"} com{" "}
          <span className="numero">{attendance.cancellation.noticeHours}h</span> de antecedência
          {attendance.cancellation.noticeHours < 12 && " — menos de 12h"}:{" "}
          {attendance.cancellation.reason}
        </Aviso>
      )}

      {pendingInvites.length > 0 && (
        <p className="mt-4 text-note text-ink-subtle">
          <span className="numero">{pendingInvites.length}</span>{" "}
          {pendingInvites.length === 1
            ? "convite enviado ainda sem resposta"
            : "convites enviados ainda sem resposta"}
          .
        </p>
      )}

      <Painel title="Interessados" count={applications.length} flush className="mt-5">
        {applications.length === 0 ? (
          <Vazio
            acao={
              <Link to={`/empresa/atendimentos/${attendance.id}/cuidadores`} className={ACTION_LINK_CLASS}>
                Buscar cuidadores
              </Link>
            }
          >
            Nenhuma candidatura ainda. Você também pode convidar diretamente quem está no quadro.
          </Vazio>
        ) : (
          <ul className="divide-y divide-linha">
            {applications.map((application) => {
              const caregiver = state.caregivers.find((c) => c.id === application.caregiverId);
              if (!caregiver) return null;
              const rating = caregiverRating(state.evaluations, caregiver.id);
              return (
                <li key={application.id} className="flex items-start gap-3 p-3.5">
                  <Avatar name={caregiver.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-title text-ink">{caregiver.name}</span>
                      <span
                        className={`text-meta font-semibold ${APPLICATION_TINT[application.status]}`}
                      >
                        {APPLICATION_LABEL[application.status]}
                      </span>
                    </div>
                    {/* Mesma compactação da tela de compatíveis: credencial, região, experiência
                        e nota numa linha só. As duas telas mostram a mesma pessoa e precisam
                        mostrá-la do mesmo jeito. */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Cracha
                        label={CATEGORY_LABEL[caregiver.category]}
                        className={CATEGORY_CLASS[caregiver.category]}
                      />
                      <span className="min-w-0 truncate text-note text-ink-subtle">
                        {caregiver.neighborhoods.join(", ")} ·{" "}
                        <span className="numero">{caregiver.experienceYears}</span> anos
                      </span>
                      {rating.average !== null ? (
                        <span className="inline-flex items-center gap-1 text-note font-semibold text-ink-muted">
                          <Star size={12} aria-hidden="true" className="fill-rating text-rating" />
                          <span className="numero">{formatRating(rating.average)}</span>
                        </span>
                      ) : (
                        <span className="text-meta text-ink-subtle">Sem média pública</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link to={`/empresa/cuidadores/${caregiver.id}`} className={ACTION_LINK_CLASS}>
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
                </li>
              );
            })}
          </ul>
        )}
      </Painel>

      {attendance.status !== "cancelled" && (
        <div className="mt-5 border-t border-linha pt-4">
          <Button variant="destructive" size="sm" onClick={() => setCancelling(true)}>
            Cancelar atendimento
          </Button>
          <p className="mt-1.5 text-meta text-ink-subtle">
            Cancelamento com menos de 12h de antecedência entra no histórico das duas partes.
          </p>
        </div>
      )}

      {cancelling && (
        <Modal title="Cancelar atendimento" onClose={() => setCancelling(false)}>
          <p className="text-note text-ink-muted">
            O cuidador é avisado e o atendimento sai da escala. A decisão fica registrada com data,
            hora e responsável.
          </p>
          <Textarea
            label="Motivo"
            className="mt-3 h-20"
            placeholder="Ex.: paciente internado"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelling(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setState((s) =>
                  cancelAttendance(s, attendance.id, "company", reason.trim() || "Sem motivo informado"),
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
