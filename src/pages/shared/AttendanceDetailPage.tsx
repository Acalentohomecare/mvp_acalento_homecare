import { useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Camera, Lock, LogIn, LogOut, MapPin, Send, Star } from "lucide-react";
import { Button, Card, Check, Cracha, Input, TelaCarregando, Textarea, VoltarLink } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL, ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { ACTIVITIES } from "../../constants/activities";
import { activityNames } from "../../services/caregivers";
import { canSeeFullAddress } from "../../services/invitations";
import { attendanceMessages, sendMessage } from "../../services/messages";
import {
  addObservation,
  attendanceRecord,
  canCheckOut,
  checkIn,
  checkOut,
  isRecordLocked,
  updateRecord,
} from "../../services/records";
import { canEvaluate, createEvaluation, evaluationFor } from "../../services/evaluations";
import { MOBILE_ACTION_BAR, MOBILE_ACTION_SPACER, PAGE_WORK } from "../../components/layout/page";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 text-heading text-ink">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Nota de 1 a 5 (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * Em leitura, as cinco estrelas são decoração para quem enxerga e nada para quem não enxerga —
 * por isso a nota também sai em texto, escondido visualmente.
 *
 * Em edição, cada estrela é um alvo de 44px **por ponteiro, não por largura de tela**: quem
 * avalia num tablet de 1024px continua tocando com o dedo. Onde existe ponteiro fino, a fila
 * volta a encolher, senão cinco quadrados de 44px viram uma barra dentro de um card.
 */
function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div
      className="flex items-center gap-0 pointer-fine:gap-1"
      role={onChange ? "radiogroup" : undefined}
      aria-label={onChange ? "Nota de 1 a 5" : undefined}
    >
      {!onChange && <span className="sr-only">{value} de 5</span>}
      {([1, 2, 3, 4, 5] as const).map((n) => {
        const filled = n <= value;
        const icon = (
          <Star
            size={16}
            aria-hidden="true"
            className={filled ? "fill-rating text-rating" : "text-linha-strong"}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            onClick={() => onChange(n)}
            className="inline-flex size-11 items-center justify-center rounded-control transition-colors duration-150 ease-out hover:bg-surface-sunken pointer-fine:size-7"
          >
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </div>
  );
}

export function AttendanceDetailPage() {
  const { attendanceId } = useParams();
  const { session } = useSession();
  const { state, setState } = useAppState();

  const [observation, setObservation] = useState("");
  const [messageText, setMessageText] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");

  if (!state) {
    return <TelaCarregando />;
  }

  const role = session?.role === "caregiver" ? "caregiver" : "company";
  const attendance = state.attendances.find((a) => a.id === attendanceId);

  const belongs =
    attendance &&
    (role === "company"
      ? attendance.companyId === session?.companyId
      : attendance.confirmedCaregiverId === session?.caregiverId);

  if (!attendance || !belongs) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10 text-center">
        <p className="text-note text-ink-muted">Atendimento não encontrado.</p>
      </div>
    );
  }

  const backTo = role === "company" ? "/empresa/agenda" : "/cuidador/agenda";
  const patient = state.patients.find((p) => p.id === attendance.patientId);
  const caregiver = state.caregivers.find((c) => c.id === attendance.confirmedCaregiverId);
  const record = attendanceRecord(state, attendance.id);
  const locked = isRecordLocked(record);
  const showAddress = role === "company" || canSeeFullAddress(attendance, session?.caregiverId);
  const showVitals = caregiver ? caregiver.category !== "informal" : false;
  const messages = attendanceMessages(state, attendance.id);
  const myEvaluation = evaluationFor(state, attendance.id, role);
  const time = (iso?: string) => (iso ? new Date(iso).toLocaleString("pt-BR") : "—");

  return (
    <div className={PAGE_WORK}>
      <VoltarLink to={backTo}>Agenda</VoltarLink>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-display">{patient?.name}</h1>
          <p className="prosa mt-1 text-body text-ink-subtle">
            {ATTENDANCE_TYPE_LABEL[attendance.type]} ·&nbsp;{attendance.durationHours}h ·{" "}
            <span className="numero">
              {attendance.startDate.split("-").reverse().join("/")} {attendance.startTime}
            </span>
          </p>
        </div>
        <Cracha
          label={ATTENDANCE_STATUS_LABEL[attendance.status]}
          className={ATTENDANCE_STATUS_CLASS[attendance.status]}
        />
      </div>

      {/*
        No desktop a tela se divide em duas leituras: à esquerda **o registro** — onde é, quem é,
        quando entrou, o que foi feito —, à direita **a troca** — a avaliação e a conversa. As duas
        colunas são longas, e lado a lado cabem juntas na altura de uma tela.

        A ordem escrita já é a ordem do celular, então abaixo de `lg` as duas divisões apenas
        empilham e nada muda para o cuidador, que é quem abre isto na rua.
      */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
      <div className="min-w-0">
      <Section title="Endereço">
        <p className="inline-flex items-start gap-1.5 text-body text-ink-muted">
          {showAddress ? (
            <>
              <MapPin size={13} className="mt-0.5 shrink-0 text-ink-subtle" />
              {attendance.street}, {attendance.number} — {attendance.neighborhood}
            </>
          ) : (
            <>
              <Lock size={13} className="mt-0.5 shrink-0 text-ink-subtle" />
              {attendance.neighborhood} — endereço completo liberado após a confirmação.
            </>
          )}
        </p>
      </Section>

      {patient && (
        <Section title="Informações do paciente">
          <p className="text-body text-ink-muted">
            {patient.age} anos · {patient.walksAlone ? "anda sozinho(a)" : "mobilidade reduzida"}
            {patient.usesOxygen && " · usa oxigênio"}
            {patient.usesFeedingTube && " · usa sonda"} · animais: {patient.petsAtHome}
          </p>
          {patient.notes && <p className="prosa mt-1 text-note text-ink-muted">{patient.notes}</p>}
        </Section>
      )}

      {caregiver && (
        <Section title="Cuidador">
          <p className="text-body text-ink-muted">{caregiver.name}</p>
        </Section>
      )}

      {/* ---------- Etapa 12: check-in / check-out ---------- */}
      <Section title="Check-in e check-out">
        <Card>
          <div className="grid grid-cols-2 gap-3 text-note">
            <div>
              <div className="text-dado text-ink-muted uppercase">Check-in</div>
              <div className="mt-1 numero">{time(attendance.checkinAt)}</div>
              {attendance.checkinLocation && (
                <div className="mt-0.5 text-meta text-ink-subtle">{attendance.checkinLocation}</div>
              )}
            </div>
            <div>
              <div className="text-dado text-ink-muted uppercase">Check-out</div>
              <div className="mt-1 numero">{time(attendance.checkoutAt)}</div>
            </div>
          </div>

          {/*
            No celular esta linha sai do card e vira a barra fixa acima da barra de abas: quem
            está na porta do paciente não deve rolar a tela para achar o check-in. A partir de
            `md` ela volta para dentro do card, onde os carimbos de hora estão.
          */}
          {role === "caregiver" && attendance.status !== "cancelled" && (
            <div className={`${MOBILE_ACTION_BAR} md:mt-3 md:flex-wrap`}>
              <Button
                size="sm"
                variant="primary"
                className="flex-1 md:flex-none"
                disabled={Boolean(attendance.checkinAt)}
                onClick={() => setState((s) => checkIn(s, attendance))}
              >
                <LogIn size={13} /> Fazer check-in
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 md:flex-none"
                disabled={!canCheckOut(attendance)}
                onClick={() => setState((s) => checkOut(s, attendance))}
              >
                <LogOut size={13} /> Fazer check-out
              </Button>
            </div>
          )}
          {role === "caregiver" && !attendance.checkinAt && (
            <p className="mt-2 text-meta text-ink-subtle">
              O check-out só é liberado depois do check-in.
            </p>
          )}
        </Card>
      </Section>

      {/* ---------- Etapa 13: registro ---------- */}
      <Section title="Registro do atendimento">
        {locked && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-note text-ink-subtle">
            <Lock size={12} /> Encerrado no check-out — só é possível acrescentar observações.
          </p>
        )}

        <Card>
          <p className="mb-2 text-note font-semibold text-ink-muted">Tarefas</p>
          <div className="flex flex-col gap-1.5">
            {attendance.activityIds.map((id) => {
              const activity = ACTIVITIES.find((a) => a.id === id);
              if (!activity) return null;
              const done = record.completedActivityIds.includes(id);
              return (
                <Check
                  key={id}
                  label={activity.name}
                  checked={done}
                  disabled={role !== "caregiver" || locked}
                  onChange={() =>
                    setState((s) =>
                      updateRecord(s, attendance.id, {
                        completedActivityIds: done
                          ? record.completedActivityIds.filter((x) => x !== id)
                          : [...record.completedActivityIds, id],
                      }),
                    )
                  }
                />
              );
            })}
          </div>

          {showVitals && (
            <div className="mt-4">
              <p className="mb-2 text-note font-semibold text-ink-muted">Sinais vitais</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(
                  [
                    ["bloodPressure", "Pressão"],
                    ["heartRate", "Frequência"],
                    ["temperature", "Temperatura"],
                  ] as const
                ).map(([key, label]) => (
                  <Input
                    key={key}
                    label={label}
                    value={record.vitals?.[key] ?? ""}
                    disabled={role !== "caregiver" || locked}
                    onChange={(e) =>
                      setState((s) =>
                        updateRecord(s, attendance.id, {
                          vitals: { ...record.vitals, [key]: e.target.value },
                        }),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="mb-2 text-note font-semibold text-ink-muted">
              Fotos ({record.photos.length}/3)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {record.photos.map((photo) => (
                <span
                  key={photo}
                  className="inline-flex items-center gap-1 rounded-full border border-linha px-2.5 py-1 text-note text-ink-muted"
                >
                  <Camera size={12} /> {photo}
                </span>
              ))}
              {role === "caregiver" && !locked && record.photos.length < 3 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setState((s) =>
                      updateRecord(s, attendance.id, {
                        photos: [...record.photos, `foto-${record.photos.length + 1}.jpg`],
                      }),
                    )
                  }
                >
                  <Camera size={13} /> Anexar foto (simulada)
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-note font-semibold text-ink-muted">Observações</p>
            {record.observations.length === 0 ? (
              <p className="text-note text-ink-subtle">Nenhuma observação registrada.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {record.observations.map((o) => (
                  <li key={o.id} className="border-b border-linha pb-2 last:border-0">
                    <p className="text-body text-ink-muted">{o.text}</p>
                    <p className="mt-0.5 numero text-meta text-ink-subtle">
                      {new Date(o.createdAt).toLocaleString("pt-BR")}
                      {o.afterCheckout && " · acrescentada após o check-out"}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {role === "caregiver" && (
              <div className="mt-2.5 flex flex-col gap-2">
                <Textarea
                  rows={2}
                  placeholder={locked ? "Acrescentar correção como nova observação" : "Nova observação"}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!observation.trim()}
                  onClick={() => {
                    setState((s) => addObservation(s, attendance.id, observation.trim()));
                    setObservation("");
                  }}
                >
                  Adicionar observação
                </Button>
              </div>
            )}
          </div>
        </Card>
      </Section>

      </div>

      <div className="min-w-0">
      {/* ---------- Etapa 14: avaliação ---------- */}
      <Section title="Avaliação">
        {!canEvaluate(attendance) ? (
          <p className="text-note text-ink-subtle">
            A avaliação é liberada depois que o atendimento for concluído.
          </p>
        ) : myEvaluation ? (
          <Card>
            <Stars value={myEvaluation.rating} />
            <p className="prosa mt-1.5 text-body text-ink-muted">{myEvaluation.comment}</p>
          </Card>
        ) : (
          <Card className="flex flex-col gap-2.5">
            <p className="text-note text-ink-muted">
              {role === "company" ? "Avalie o cuidador" : "Avalie a empresa"}
            </p>
            <Stars value={rating} onChange={setRating} />
            <Textarea
              rows={2}
              placeholder="Comentário"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button
              size="sm"
              variant="primary"
              className="self-start"
              onClick={() => {
                setState((s) => createEvaluation(s, attendance, role, rating, comment.trim()));
                setComment("");
              }}
            >
              Enviar avaliação
            </Button>
          </Card>
        )}
      </Section>

      {/* ---------- Etapa 15: conversa ---------- */}
      <Section title="Conversa">
        {messages.length === 0 ? (
          <p className="text-note text-ink-subtle">Nenhuma mensagem ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-control px-3 py-2 text-note ${
                  m.from === role
                    ? "self-end bg-accent text-accent-ink"
                    : "border border-linha bg-surface-raised"
                }`}
              >
                {m.text}
                <div
                  className={`mt-1 numero text-meta ${m.from === role ? "text-accent-ink-muted" : "text-ink-subtle"}`}
                >
                  {new Date(m.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Escreva uma mensagem"
          />
          <Button
            size="sm"
            variant="primary"
            disabled={!messageText.trim()}
            onClick={() => {
              setState((s) => sendMessage(s, attendance.id, role, messageText));
              setMessageText("");
            }}
          >
            <Send size={13} />
          </Button>
        </div>
      </Section>

      </div>
      </div>

      <p className="mt-6 text-meta text-ink-subtle">
        Atividades exigidas: {activityNames(attendance.activityIds).join(", ")}
      </p>

      {role === "caregiver" && attendance.status !== "cancelled" && (
        <div aria-hidden="true" className={MOBILE_ACTION_SPACER} />
      )}
    </div>
  );
}
