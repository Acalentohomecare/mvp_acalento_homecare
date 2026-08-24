import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import {
  Aviso,
  Button,
  Dado,
  ListaDeDados,
  Painel,
  StatusAtendimento,
  TelaCarregando,
  Vazio,
  VoltarLink,
} from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { CATEGORY_LABEL } from "../../constants/caregiver";
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
import { rotuloDoDia } from "../../utils/date";
import type { Attendance } from "../../types";
import { PAGE_LIST } from "../../components/layout/page";

export function CaregiverInvitationsPage() {
  const { session } = useSession();
  const { state, setState } = useAppState();
  const [error, setError] = useState("");

  if (!state) {
    return <TelaCarregando />;
  }

  const caregiverId = session?.caregiverId;
  const invitations = caregiverInvitations(state, caregiverId);
  const confirmed = caregiverConfirmedAttendances(state, caregiverId);

  // Publicação aberta só vale para quem o próprio matching consideraria compatível (R2/R3).
  const opportunities = openOpportunities(state, caregiverId).filter((a) =>
    compatibleCaregivers(state, a).some((c) => c.id === caregiverId),
  );

  const patientName = (id: string) => state.patients.find((p) => p.id === id)?.name ?? "Paciente";

  /*
    A proposta — o que o cuidador precisa saber antes de aceitar um plantão.

    Era um bloco de texto corrido com ícones no meio. Virou lista de definição: quando, onde,
    quanto, quanto tempo. É uma decisão de dinheiro e de deslocamento, e decisão se toma
    comparando valores alinhados, não lendo frases.

    O endereço trancado continua com cadeado — ali o ícone **carrega significado** ("isto abre
    quando você aceitar"), que é o único caso em que ícone entrou de volta nesta revisão.
  */
  const proposta = (a: Attendance): ReactNode => (
    <>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
        <div className="min-w-0">
          <p className="text-title text-ink">{patientName(a.patientId)}</p>
          <p className="mt-0.5 text-note text-ink-subtle">
            {ATTENDANCE_TYPE_LABEL[a.type]} · <span className="numero">{a.durationHours}h</span>
          </p>
        </div>
        <StatusAtendimento status={a.status} variant="bloco" />
      </div>

      <ListaDeDados className="mt-3">
        <Dado termo="Quando">
          <span className="numero">
            {rotuloDoDia(a.startDate)} · {a.startTime}
          </span>
        </Dado>
        <Dado termo="Onde">
          {canSeeFullAddress(a, caregiverId) ? (
            <>
              {a.street}, {a.number} — {a.neighborhood}
            </>
          ) : (
            <span className="inline-flex items-start gap-1.5 text-ink-subtle">
              <Lock size={12} aria-hidden="true" className="mt-[3px] shrink-0" />
              <span>{a.neighborhood} — completo após aceitar</span>
            </span>
          )}
        </Dado>
        <Dado termo="Valor">
          <span className="numero font-medium">{formatCurrency(a.value)}</span>
        </Dado>
      </ListaDeDados>
    </>
  );

  return (
    <div className={PAGE_LIST}>
      <VoltarLink to="/cuidador">Início</VoltarLink>

      <h1 className="mt-3 text-display">Convites</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">
        Propostas enviadas a você e publicações abertas compatíveis com o seu perfil.
      </p>

      {error && <Aviso className="mt-4">{error}</Aviso>}

      {/* Convite recebido é o único item desta tela que espera resposta — vem primeiro e é o
          único com ação de decisão embutida. */}
      <div className="mt-5 flex flex-col gap-5">
        <Painel title="Convites recebidos" count={invitations.length} flush>
          {invitations.length === 0 ? (
            <Vazio porte="linha">Nenhum convite no momento.</Vazio>
          ) : (
            <ul className="divide-y divide-linha">
              {invitations.map((invitation) => {
                const attendance = attendanceById(state, invitation.attendanceId);
                if (!attendance) return null;
                return (
                  <li key={invitation.id} className="p-3.5">
                    {proposta(attendance)}
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
                        Aceitar plantão
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
                  </li>
                );
              })}
            </ul>
          )}
        </Painel>

        <Painel title="Publicações abertas" count={opportunities.length} flush>
          {opportunities.length === 0 ? (
            <Vazio porte="linha">
              Nenhuma publicação aberta compatível com o seu perfil neste momento.
            </Vazio>
          ) : (
            <ul className="divide-y divide-linha">
              {opportunities.map((a) => (
                <li key={a.id} className="p-3.5">
                  {proposta(a)}
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
                </li>
              ))}
            </ul>
          )}
        </Painel>

        <Painel title="Confirmados para você" count={confirmed.length} flush>
          {confirmed.length === 0 ? (
            <Vazio porte="linha">Nenhum atendimento confirmado.</Vazio>
          ) : (
            <ul className="divide-y divide-linha">
              {confirmed.map((a) => (
                <li key={a.id} className="p-3.5">
                  {proposta(a)}
                  <p className="mt-2.5 text-meta text-ink-subtle">
                    Perfil exigido: {CATEGORY_LABEL[a.requiredCategory]}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Painel>
      </div>
    </div>
  );
}
