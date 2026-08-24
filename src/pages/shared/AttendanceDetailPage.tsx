import { useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Lock, LogIn, LogOut, Send, Star } from "lucide-react";
import {
  Aviso,
  Button,
  ButtonLink,
  Check,
  Dado,
  Input,
  LinhaDoTempo,
  ListaDeDados,
  Painel,
  StatusAtendimento,
  Stepper,
  TelaCarregando,
  Textarea,
  Vazio,
  VoltarLink,
  type EventoLinhaDoTempo,
} from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  ATTENDANCE_STEPS,
  ATTENDANCE_TYPE_LABEL,
  attendanceStepIndex,
} from "../../constants/attendance";
import { CATEGORY_LABEL } from "../../constants/caregiver";
import { allActivities } from "../../services/activities";
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
import { formatCurrency } from "../../utils/format";
import { carimbo, dataCompleta, rotuloDoDia } from "../../utils/date";
import { MOBILE_ACTION_BAR, MOBILE_ACTION_SPACER, PAGE_WORK } from "../../components/layout/page";

/**
 * Nota de 1 a 5 (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * Em leitura, as cinco estrelas são decoração para quem enxerga e nada para quem não enxerga —
 * por isso a nota também sai em texto, escondido visualmente.
 *
 * Em edição, cada estrela é um alvo de 44px **por ponteiro, não por largura de tela**: quem
 * avalia num tablet de 1024px continua tocando com o dedo. Onde existe ponteiro fino, a fila
 * volta a encolher, senão cinco quadrados de 44px viram uma barra dentro de um painel.
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

/** Bloco de conteúdo dentro de um painel, separado do anterior por um fio — nunca por outra caixa. */
function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-linha pt-3.5 first:border-0 first:pt-0">
      <p className="mb-2 text-dado text-ink-subtle uppercase">{titulo}</p>
      {children}
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

  const backTo = role === "company" ? "/empresa/agenda" : "/cuidador/agenda";

  /* Estado de erro com saída. Era uma frase centralizada no vazio, sem link nenhum: quem caísse
     aqui por um link velho ficava preso e só saía pelo botão do navegador. */
  if (!attendance || !belongs) {
    return (
      <div className={PAGE_WORK}>
        <VoltarLink to={backTo}>Agenda</VoltarLink>
        <Painel title="Atendimento não encontrado" className="mt-4">
          <p className="prosa text-note text-ink-muted">
            Ele pode ter sido cancelado, ou não pertence a esta conta. Volte para a agenda para ver
            os que estão em andamento.
          </p>
          <ButtonLink to={backTo} size="sm" variant="ghost" className="mt-3">
            Ir para a agenda
          </ButtonLink>
        </Painel>
      </div>
    );
  }

  const patient = state.patients.find((p) => p.id === attendance.patientId);
  const caregiver = state.caregivers.find((c) => c.id === attendance.confirmedCaregiverId);
  const record = attendanceRecord(state, attendance.id);
  const locked = isRecordLocked(record);
  const showAddress = role === "company" || canSeeFullAddress(attendance, session?.caregiverId);
  const showVitals = caregiver ? caregiver.category !== "informal" : false;
  const messages = attendanceMessages(state, attendance.id);
  const myEvaluation = evaluationFor(state, attendance.id, role);
  const catalog = allActivities(state);
  const cancelado = attendance.status === "cancelled";

  /*
    A linha do tempo do atendimento — o que aconteceu, em ordem, com carimbo.

    Substituiu o bloco "Check-in e check-out": dois carimbos numa grade de duas colunas dizem
    *quando*, mas não dizem *o quê aconteceu antes e depois*. O ciclo é a coisa que este produto
    vende (publicação → convite → confirmação → check-in → registro → check-out), e é ele que
    precisa estar legível na ficha.

    Só entram eventos que **de fato aconteceram**: nada de linha cinza prometendo etapa futura,
    que é trabalho da régua de progresso acima.
  */
  /* A ordenação usa o ISO de origem, não o carimbo já formatado: "02/01" vem depois de "28/12"
     no calendário e antes dele em ordem alfabética. */
  const eventos: EventoLinhaDoTempo[] = (
    [
      { iso: attendance.createdAt, id: "criado", evento: "Atendimento publicado" },
      ...(attendance.confirmedCaregiverId
        ? [
            {
              iso: attendance.createdAt,
              id: "confirmado",
              evento: "Cuidador confirmado",
              contexto: caregiver?.name,
            },
          ]
        : []),
      ...(attendance.checkinAt
        ? [
            {
              iso: attendance.checkinAt,
              id: "checkin",
              evento: "Check-in registrado",
              contexto: attendance.checkinLocation,
              tom: attendance.checkoutAt ? ("feito" as const) : ("agora" as const),
            },
          ]
        : []),
      ...record.observations.map((o) => ({
        iso: o.createdAt,
        id: o.id,
        evento: o.afterCheckout ? "Observação após o check-out" : "Observação no registro",
        contexto: o.text,
      })),
      ...(attendance.checkoutAt
        ? [
            {
              iso: attendance.checkoutAt,
              id: "checkout",
              evento: "Check-out registrado",
              contexto: `${record.completedActivityIds.length} de ${attendance.activityIds.length} tarefas concluídas`,
            },
          ]
        : []),
      ...(attendance.cancellation
        ? [
            {
              iso: attendance.cancellation.at,
              id: "cancelado",
              evento: `Cancelado pel${attendance.cancellation.by === "company" ? "a empresa" : "o cuidador"}`,
              contexto: `${attendance.cancellation.reason} · ${attendance.cancellation.noticeHours}h de antecedência${
                attendance.cancellation.noticeHours < 12 ? " (menos de 12h)" : ""
              }`,
              tom: "caiu" as const,
            },
          ]
        : []),
    ] as { iso: string; id: string; evento: string; contexto?: string; tom?: EventoLinhaDoTempo["tom"] }[]
  )
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .map(({ iso, ...e }) => ({ ...e, quando: carimbo(iso) }));

  return (
    <div className={PAGE_WORK}>
      <VoltarLink to={backTo}>Agenda</VoltarLink>

      {/* ---------------------------------------------------------- cabeçalho */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-display">{patient?.name}</h1>
          <p className="mt-1 text-body text-ink-subtle">
            {ATTENDANCE_TYPE_LABEL[attendance.type]} ·{" "}
            <span className="numero">{attendance.durationHours}h</span> ·{" "}
            <span className="numero text-ink-muted">
              {rotuloDoDia(attendance.startDate)}, {attendance.startTime}
            </span>
          </p>
        </div>
        <StatusAtendimento status={attendance.status} variant="bloco" className="mt-1" />
      </div>

      {/*
        A régua do ciclo. Existia como `<Stepper>` documentado no design system e nunca chamado
        por tela nenhuma — a ficha mostrava o estado como uma etiqueta solta, sem dizer o que já
        passou nem o que falta. É a peça que faz a ficha parecer acompanhamento de processo e não
        um formulário de leitura.

        Some no atendimento cancelado: ali não há trilho a percorrer, e a linha do tempo abaixo já
        explica o que aconteceu.
      */}
      {!cancelado && (
        <div className="mt-5 rounded-card border border-linha bg-surface-raised px-4 py-3.5">
          <Stepper steps={[...ATTENDANCE_STEPS]} currentIndex={attendanceStepIndex(attendance.status)} />
        </div>
      )}

      {cancelado && attendance.cancellation && (
        <Aviso className="mt-5">
          Cancelado pel{attendance.cancellation.by === "company" ? "a empresa" : "o cuidador"} com{" "}
          <span className="numero">{attendance.cancellation.noticeHours}h</span> de antecedência
          {attendance.cancellation.noticeHours < 12 && " — menos de 12h"}: {attendance.cancellation.reason}
        </Aviso>
      )}

      {/*
        No desktop a tela se divide em duas leituras: à esquerda **o registro** — onde é, quem é,
        o que foi feito —, à direita **o acompanhamento** — a linha do tempo, a avaliação e a
        conversa. As duas colunas são longas, e lado a lado cabem juntas na altura de uma tela.

        A ordem escrita já é a ordem do celular, então abaixo de `lg` as duas divisões apenas
        empilham e nada muda para o cuidador, que é quem abre isto na rua.
      */}
      <div className="mt-5 flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          {/* ------------------------------------------------- dados operacionais */}
          <Painel title="Atendimento">
            <ListaDeDados>
              <Dado termo="Data">
                <span className="numero">{dataCompleta(attendance.startDate)}</span>
              </Dado>
              <Dado termo="Horário">
                <span className="numero">
                  {attendance.startTime} · {attendance.durationHours}h
                </span>
              </Dado>
              <Dado termo="Endereço">
                {showAddress ? (
                  <>
                    {attendance.street}, {attendance.number} — {attendance.neighborhood}
                  </>
                ) : (
                  /* O cadeado é ícone que carrega significado — "isto está fechado para você" —
                     e por isso fica, enquanto os ícones decorativos da lista saíram. */
                  <span className="inline-flex items-start gap-1.5 text-ink-subtle">
                    <Lock size={13} aria-hidden="true" className="mt-[3px] shrink-0" />
                    <span>{attendance.neighborhood} — completo após a confirmação</span>
                  </span>
                )}
              </Dado>
              <Dado termo="Perfil exigido">{CATEGORY_LABEL[attendance.requiredCategory]}</Dado>
              <Dado termo="Cuidador">
                {caregiver ? caregiver.name : <span className="text-status-aberto">Sem cuidador</span>}
              </Dado>
              <Dado termo="Valor">
                <span className="numero">{formatCurrency(attendance.value)}</span>
              </Dado>
              {attendance.recurring && (
                <Dado termo="Repetição">{attendance.recurrenceDescription ?? "Recorrente"}</Dado>
              )}
            </ListaDeDados>
          </Painel>

          {patient && (
            <Painel title="Paciente">
              <ListaDeDados>
                <Dado termo="Idade">
                  <span className="numero">{patient.age}</span> anos
                </Dado>
                <Dado termo="Mobilidade">
                  {patient.walksAlone ? "Anda sozinho(a)" : "Mobilidade reduzida"}
                </Dado>
                <Dado termo="Equipamentos">
                  {[patient.usesOxygen && "oxigênio", patient.usesFeedingTube && "sonda"]
                    .filter(Boolean)
                    .join(" · ") || "nenhum"}
                </Dado>
                <Dado termo="Animais">{patient.petsAtHome}</Dado>
              </ListaDeDados>
              {/* O fio separador precisa ficar num contêiner de largura cheia. Estava direto no
                  `<p class="prosa">`, e `prosa` trava a medida em 62ch — a borda saía cortada no
                  meio do painel, parecendo defeito de alinhamento. */}
              {patient.notes && (
                <div className="mt-3 border-t border-linha pt-3">
                  <p className="prosa text-note text-ink-muted">{patient.notes}</p>
                </div>
              )}
            </Painel>
          )}

          {/* ---------- Etapa 13: registro ---------- */}
          <Painel
            title="Registro do atendimento"
            actions={
              locked && (
                <span className="inline-flex items-center gap-1 text-meta font-semibold text-ink-subtle">
                  <Lock size={12} aria-hidden="true" /> Encerrado
                </span>
              )
            }
          >
            {locked && (
              <p className="mb-3.5 text-meta text-ink-subtle">
                Fechado no check-out — só é possível acrescentar observações.
              </p>
            )}

            <div className="flex flex-col gap-3.5">
              <Bloco titulo={`Tarefas · ${record.completedActivityIds.length}/${attendance.activityIds.length}`}>
                <div className="flex flex-col gap-1 lg:grid lg:grid-cols-2 lg:gap-x-6">
                  {attendance.activityIds.map((id) => {
                    const activity = catalog.find((a) => a.id === id);
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
              </Bloco>

              {showVitals && (
                <Bloco titulo="Sinais vitais">
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
                </Bloco>
              )}

              <Bloco titulo={`Fotos · ${record.photos.length}/3`}>
                <div className="flex flex-wrap items-center gap-2">
                  {record.photos.map((photo) => (
                    <span
                      key={photo}
                      className="inline-flex items-center gap-1.5 rounded-marker border border-linha bg-surface-sunken px-2 py-1 text-meta text-ink-muted"
                    >
                      <Camera size={12} aria-hidden="true" /> {photo}
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
                  {record.photos.length === 0 && role !== "caregiver" && (
                    <span className="text-note text-ink-subtle">Nenhuma foto anexada.</span>
                  )}
                </div>
              </Bloco>

              <Bloco titulo={`Observações · ${record.observations.length}`}>
                {record.observations.length === 0 ? (
                  <p className="text-note text-ink-subtle">Nenhuma observação registrada.</p>
                ) : (
                  <ul className="divide-y divide-linha">
                    {record.observations.map((o) => (
                      <li key={o.id} className="py-2 first:pt-0 last:pb-0">
                        <p className="text-note text-ink-muted">{o.text}</p>
                        <p className="mt-0.5 numero text-meta text-ink-subtle">
                          {carimbo(o.createdAt)}
                          {o.afterCheckout && " · após o check-out"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {role === "caregiver" && (
                  <div className="mt-2.5 flex flex-col gap-2">
                    <Textarea
                      rows={2}
                      placeholder={
                        locked ? "Acrescentar correção como nova observação" : "Nova observação"
                      }
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="self-start"
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
              </Bloco>
            </div>
          </Painel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {/* ---------- histórico ---------- */}
          <Painel title="Histórico">
            <LinhaDoTempo eventos={eventos} />
          </Painel>

          {/* ---------- Etapa 14: avaliação ---------- */}
          <Painel title="Avaliação">
            {!canEvaluate(attendance) ? (
              <p className="text-note text-ink-subtle">
                Liberada depois que o atendimento for concluído.
              </p>
            ) : myEvaluation ? (
              <>
                <Stars value={myEvaluation.rating} />
                <p className="prosa mt-2 text-note text-ink-muted">{myEvaluation.comment}</p>
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
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
              </div>
            )}
          </Painel>

          {/* ---------- Etapa 15: conversa ---------- */}
          <Painel title="Conversa" count={messages.length || undefined}>
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
                        : "border border-linha bg-surface-sunken text-ink"
                    }`}
                  >
                    {m.text}
                    <div
                      className={`mt-1 numero text-meta ${m.from === role ? "text-accent-ink-muted" : "text-ink-subtle"}`}
                    >
                      {carimbo(m.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Mensagem"
              />
              <Button
                size="sm"
                variant="primary"
                aria-label="Enviar mensagem"
                disabled={!messageText.trim()}
                onClick={() => {
                  setState((s) => sendMessage(s, attendance.id, role, messageText));
                  setMessageText("");
                }}
              >
                <Send size={13} />
              </Button>
            </div>
          </Painel>

          <p className="text-meta text-ink-subtle">
            Atividades exigidas: {activityNames(attendance.activityIds, catalog).join(", ")}.
          </p>
        </div>
      </div>

      {/*
        Check-in e check-out são a **ação** da ficha, não um bloco de leitura — os carimbos já
        estão no histórico. No celular a barra flutua acima da barra de abas: quem está na porta
        do paciente não deve rolar a tela para achar o botão. A partir de `md` ela volta para o
        fluxo, no pé da ficha.
      */}
      {role === "caregiver" && !cancelado && (
        <>
          <div className={`${MOBILE_ACTION_BAR} md:mt-6 md:flex-wrap md:items-center`}>
            <Button
              size="sm"
              variant="primary"
              className="flex-1 md:flex-none"
              disabled={Boolean(attendance.checkinAt)}
              onClick={() => setState((s) => checkIn(s, attendance))}
            >
              <LogIn size={13} /> {attendance.checkinAt ? "Check-in feito" : "Fazer check-in"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 md:flex-none"
              disabled={!canCheckOut(attendance)}
              onClick={() => setState((s) => checkOut(s, attendance))}
            >
              <LogOut size={13} /> {attendance.checkoutAt ? "Check-out feito" : "Fazer check-out"}
            </Button>
            {!attendance.checkinAt && (
              <p className="hidden text-meta text-ink-subtle md:block">
                O check-out só é liberado depois do check-in.
              </p>
            )}
          </div>
          <div aria-hidden="true" className={MOBILE_ACTION_SPACER} />
        </>
      )}

      {role === "company" && messages.length === 0 && !caregiver && (
        <Vazio className="mt-5">Sem cuidador confirmado, ainda não há conversa nem registro.</Vazio>
      )}
    </div>
  );
}
