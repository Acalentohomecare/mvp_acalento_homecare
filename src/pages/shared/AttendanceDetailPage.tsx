import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Camera, Lock, LogIn, LogOut, MapPin, Send, Star } from "lucide-react";
import { Button, Card, Cracha, Input, Textarea } from "../../components/ui";
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2.5 text-body font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (v: 1 | 2 | 3 | 4 | 5) => void }) {
  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4, 5] as const).map((n) => {
        const filled = n <= value;
        const icon = <Star size={16} className={filled ? "fill-accent text-accent" : "text-linha"} />;
        return onChange ? (
          <button key={n} type="button" aria-label={`${n} estrela${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}>
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body text-ink/50">Carregando…</div>
    );
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
      <div className="mx-auto max-w-2xl px-6 py-10 text-center">
        <p className="text-note text-ink/60">Atendimento não encontrado.</p>
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
    <div className="mx-auto max-w-2xl px-6 py-7">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-note text-ink/50 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> Agenda
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-display font-semibold">{patient?.name}</h1>
          <p className="prosa mt-1 text-body text-ink/50">
            {ATTENDANCE_TYPE_LABEL[attendance.type]} · {attendance.durationHours}h ·{" "}
            <span className="font-mono">
              {attendance.startDate.split("-").reverse().join("/")} {attendance.startTime}
            </span>
          </p>
        </div>
        <Cracha
          label={ATTENDANCE_STATUS_LABEL[attendance.status]}
          className={ATTENDANCE_STATUS_CLASS[attendance.status]}
        />
      </div>

      <Section title="Endereço">
        <p className="inline-flex items-start gap-1.5 text-body text-ink/75">
          {showAddress ? (
            <>
              <MapPin size={13} className="mt-0.5 shrink-0 text-ink/40" />
              {attendance.street}, {attendance.number} — {attendance.neighborhood}
            </>
          ) : (
            <>
              <Lock size={13} className="mt-0.5 shrink-0 text-ink/40" />
              {attendance.neighborhood} — endereço completo liberado após a confirmação.
            </>
          )}
        </p>
      </Section>

      {patient && (
        <Section title="Informações do paciente">
          <p className="text-body text-ink/75">
            {patient.age} anos · {patient.walksAlone ? "anda sozinho(a)" : "mobilidade reduzida"}
            {patient.usesOxygen && " · usa oxigênio"}
            {patient.usesFeedingTube && " · usa sonda"} · animais: {patient.petsAtHome}
          </p>
          {patient.notes && <p className="prosa mt-1 text-note text-ink/55">{patient.notes}</p>}
        </Section>
      )}

      {caregiver && (
        <Section title="Cuidador">
          <p className="text-body text-ink/75">{caregiver.name}</p>
        </Section>
      )}

      {/* ---------- Etapa 12: check-in / check-out ---------- */}
      <Section title="Check-in e check-out">
        <Card>
          <div className="grid grid-cols-2 gap-3 text-note">
            <div>
              <div className="text-meta font-medium tracking-wide text-ink/70 uppercase">Check-in</div>
              <div className="mt-1 font-mono">{time(attendance.checkinAt)}</div>
              {attendance.checkinLocation && (
                <div className="mt-0.5 text-meta text-ink/45">{attendance.checkinLocation}</div>
              )}
            </div>
            <div>
              <div className="text-meta font-medium tracking-wide text-ink/70 uppercase">Check-out</div>
              <div className="mt-1 font-mono">{time(attendance.checkoutAt)}</div>
            </div>
          </div>

          {role === "caregiver" && attendance.status !== "cancelled" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="primary"
                disabled={Boolean(attendance.checkinAt)}
                onClick={() => setState((s) => checkIn(s, attendance))}
              >
                <LogIn size={13} /> Fazer check-in
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!canCheckOut(attendance)}
                onClick={() => setState((s) => checkOut(s, attendance))}
              >
                <LogOut size={13} /> Fazer check-out
              </Button>
            </div>
          )}
          {role === "caregiver" && !attendance.checkinAt && (
            <p className="mt-2 text-meta text-ink/45">
              O check-out só é liberado depois do check-in.
            </p>
          )}
        </Card>
      </Section>

      {/* ---------- Etapa 13: registro ---------- */}
      <Section title="Registro do atendimento">
        {locked && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-note text-ink/50">
            <Lock size={12} /> Encerrado no check-out — só é possível acrescentar observações.
          </p>
        )}

        <Card>
          <p className="mb-2 text-note font-semibold text-ink/60">Tarefas</p>
          <div className="flex flex-col gap-1.5">
            {attendance.activityIds.map((id) => {
              const activity = ACTIVITIES.find((a) => a.id === id);
              if (!activity) return null;
              const done = record.completedActivityIds.includes(id);
              return (
                <label key={id} className="flex items-center gap-2 text-body text-ink/75">
                  <input
                    type="checkbox"
                    className="size-4 accent-accent"
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
                  {activity.name}
                </label>
              );
            })}
          </div>

          {showVitals && (
            <div className="mt-4">
              <p className="mb-2 text-note font-semibold text-ink/60">Sinais vitais</p>
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
            <p className="mb-2 text-note font-semibold text-ink/60">
              Fotos ({record.photos.length}/3)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {record.photos.map((photo) => (
                <span
                  key={photo}
                  className="inline-flex items-center gap-1 rounded-full border border-linha px-2.5 py-1 text-note text-ink/60"
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
            <p className="mb-2 text-note font-semibold text-ink/60">Observações</p>
            {record.observations.length === 0 ? (
              <p className="text-note text-ink/45">Nenhuma observação registrada.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {record.observations.map((o) => (
                  <li key={o.id} className="border-b border-linha pb-2 last:border-0">
                    <p className="text-body text-ink/75">{o.text}</p>
                    <p className="mt-0.5 font-mono text-meta text-ink/40">
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

      {/* ---------- Etapa 14: avaliação ---------- */}
      <Section title="Avaliação">
        {!canEvaluate(attendance) ? (
          <p className="text-note text-ink/45">
            A avaliação é liberada depois que o atendimento for concluído.
          </p>
        ) : myEvaluation ? (
          <Card>
            <Stars value={myEvaluation.rating} />
            <p className="prosa mt-1.5 text-body text-ink/75">{myEvaluation.comment}</p>
          </Card>
        ) : (
          <Card className="flex flex-col gap-2.5">
            <p className="text-note text-ink/60">
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
          <p className="text-note text-ink/45">Nenhuma mensagem ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-[12px] px-3 py-2 text-note ${
                  m.from === role ? "self-end bg-ink text-surface" : "bg-surface-raised border border-linha"
                }`}
              >
                {m.text}
                <div
                  className={`mt-1 font-mono text-meta ${m.from === role ? "text-surface/60" : "text-ink/40"}`}
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

      <p className="mt-6 text-meta text-ink/35">
        Atividades exigidas: {activityNames(attendance.activityIds).join(", ")}
      </p>
    </div>
  );
}
