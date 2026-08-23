import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Heart, Star } from "lucide-react";
import { Avatar, Button, Card, Cracha, Modal, Textarea } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import {
  APPROVAL_STATUS_CLASS,
  APPROVAL_STATUS_LABEL,
  CATEGORY_CLASS,
  CATEGORY_LABEL,
  SHIFT_LABEL,
  SHIFT_ORDER,
  WEEKDAY_LABEL,
  WEEKDAY_ORDER,
} from "../../constants/caregiver";
import {
  MIN_EVALUATIONS_FOR_PUBLIC_AVERAGE,
  activityNames,
  caregiverEvaluations,
  caregiverRating,
  isFavorite,
  isVerified,
  requiresCouncil,
  toggleFavorite,
} from "../../services/caregivers";
import {
  approveCaregiver,
  blockCaregiver,
  reactivateCaregiver,
  rejectCaregiver,
  rosterStatus,
} from "../../services/roster";
import { caregiverHistory } from "../../services/evaluations";
import { ATTENDANCE_STATUS_CLASS, ATTENDANCE_STATUS_LABEL } from "../../constants/attendance";
import { useSession } from "../../hooks/useSession";
import { formatCurrency, formatRating } from "../../utils/format";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-[11px] font-semibold tracking-wide text-ink/40 uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-linha bg-surface-raised px-2.5 py-1 text-[12px] text-ink/70"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function CompanyCaregiverProfilePage() {
  const { caregiverId } = useParams();
  const { state, setState } = useAppState();
  const { session } = useSession();
  const [prompt, setPrompt] = useState<"reject" | "block" | null>(null);
  const [reason, setReason] = useState("");

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">
        Carregando…
      </div>
    );
  }

  const caregiver = state.caregivers.find((c) => c.id === caregiverId);

  if (!caregiver) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center">
        <p className="text-[13px] text-ink/60">Cuidador não encontrado.</p>
        <Link to="/empresa/cuidadores" className="mt-4 inline-block text-[12.5px] underline">
          Voltar à lista
        </Link>
      </div>
    );
  }

  const companyId = session?.companyId;
  const status = rosterStatus(state, companyId, caregiver.id);
  const inRoster = status === "approved";
  const rating = caregiverRating(state.evaluations, caregiver.id);
  const evaluations = caregiverEvaluations(state.evaluations, caregiver.id);
  const history = caregiverHistory(state, caregiver.id, session?.companyId ?? "");
  const favorite = isFavorite(state, session?.companyId, caregiver.id);
  const needsCouncil = requiresCouncil(caregiver.category);
  const days = WEEKDAY_ORDER.filter((d) => caregiver.availability.days.includes(d));
  const shifts = SHIFT_ORDER.filter((s) => caregiver.availability.shifts.includes(s));

  const openPrompt = (kind: "reject" | "block") => {
    setPrompt(kind);
    setReason("");
  };

  const confirmPrompt = () => {
    if (!prompt || !companyId) return;
    const motive =
      reason.trim() || (prompt === "reject" ? "Documentos não conferem." : "Bloqueado pela empresa.");
    setState((s) =>
      prompt === "reject"
        ? rejectCaregiver(s, companyId, caregiver.id, motive)
        : blockCaregiver(s, companyId, caregiver.id, motive),
    );
    setPrompt(null);
    setReason("");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <div>
        <Link
          to="/empresa/cuidadores"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-ink/50 transition-colors hover:text-ink"
        >
          <ArrowLeft size={14} /> Cuidadores
        </Link>

        <div className="mt-4 flex items-start gap-3.5">
          <Avatar name={caregiver.name} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[21px] leading-tight font-semibold">{caregiver.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Cracha
                label={CATEGORY_LABEL[caregiver.category]}
                className={CATEGORY_CLASS[caregiver.category]}
              />
              <Cracha
                label={APPROVAL_STATUS_LABEL[status]}
                className={APPROVAL_STATUS_CLASS[status]}
              />
              {isVerified(caregiver) && (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-cat-informal">
                  <BadgeCheck size={14} /> Verificado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controle do quadro: é a empresa que decide quem pode assumir os plantões dela. */}
        <div className="mt-3 flex flex-wrap gap-2">
          {inRoster && (
            <Button
              variant={favorite ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={favorite}
              onClick={() => companyId && setState((s) => toggleFavorite(s, companyId, caregiver.id))}
            >
              <Heart size={13} className={favorite ? "fill-surface" : ""} />
              {favorite ? "Nos favoritos" : "Favoritar"}
            </Button>
          )}

          {status === "pending" && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => companyId && setState((s) => approveCaregiver(s, companyId, caregiver.id))}
              >
                Aprovar para o quadro
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openPrompt("reject")}>
                Recusar
              </Button>
            </>
          )}

          {inRoster && (
            <Button variant="ghost" size="sm" onClick={() => openPrompt("block")}>
              Bloquear
            </Button>
          )}

          {(status === "rejected" || status === "blocked") && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => companyId && setState((s) => reactivateCaregiver(s, companyId, caregiver.id))}
            >
              Reconsiderar e aprovar
            </Button>
          )}
        </div>

        {status !== "approved" && (
          <p className="mt-3 text-[12px] text-ink/50">
            {status === "pending"
              ? "Este cadastro ainda não faz parte do seu quadro — aprove para poder convidá-lo."
              : "Fora do seu quadro: não aparece na busca nem recebe convites desta empresa."}
          </p>
        )}

        <p className="mt-4 text-[13.5px] leading-relaxed text-ink/75">{caregiver.bio}</p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Card>
            <div className="text-[10.5px] tracking-wide text-ink/40 uppercase">Experiência</div>
            <div className="mt-1 font-mono text-[15px]">{caregiver.experienceYears} anos</div>
          </Card>
          <Card>
            <div className="text-[10.5px] tracking-wide text-ink/40 uppercase">Por plantão</div>
            <div className="mt-1 font-mono text-[15px]">{formatCurrency(caregiver.shiftRate)}</div>
          </Card>
          <Card>
            <div className="text-[10.5px] tracking-wide text-ink/40 uppercase">Avaliação</div>
            {rating.average === null ? (
              <div className="mt-1 text-[12px] leading-tight text-ink/45">
                {rating.count} de {MIN_EVALUATIONS_FOR_PUBLIC_AVERAGE}
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-1 font-mono text-[15px]">
                <Star size={13} className="fill-accent text-accent" />
                {formatRating(rating.average)}
              </div>
            )}
          </Card>
        </div>

        {needsCouncil && (
          <Section title="Registro no conselho de classe">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[13px]">
                {caregiver.councilRegistration ?? "Não informado"}
              </span>
              {caregiver.councilRegistrationStatus && (
                <Cracha
                  label={APPROVAL_STATUS_LABEL[caregiver.councilRegistrationStatus]}
                  className={APPROVAL_STATUS_CLASS[caregiver.councilRegistrationStatus]}
                />
              )}
            </div>
          </Section>
        )}

        {needsCouncil && caregiver.specialties && caregiver.specialties.length > 0 && (
          <Section title="Especialidades">
            <Chips items={caregiver.specialties} />
          </Section>
        )}

        <Section title="Região de atendimento">
          <p className="text-[13px] text-ink/75">{caregiver.city}</p>
          <div className="mt-1.5">
            <Chips items={caregiver.neighborhoods} />
          </div>
        </Section>

        <Section title="Disponibilidade">
          <Chips items={days.map((d) => WEEKDAY_LABEL[d])} />
          <div className="mt-1.5">
            <Chips items={shifts.map((s) => SHIFT_LABEL[s])} />
          </div>
        </Section>

        <Section title="Atividades que realiza">
          <ul className="flex flex-col gap-1">
            {activityNames(caregiver.activityIds).map((name) => (
              <li key={name} className="text-[13px] text-ink/75">
                · {name}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={`Histórico com a empresa (${history.length})`}>
          {history.length === 0 ? (
            <p className="text-[12.5px] text-ink/45">Nenhum atendimento com esta empresa ainda.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {history.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-[10px] border border-linha bg-surface-raised px-3 py-2"
                >
                  <span className="font-mono text-[12px] text-ink/70">
                    {a.startDate.split("-").reverse().join("/")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px]">
                    {state.patients.find((p) => p.id === a.patientId)?.name}
                  </span>
                  <Cracha
                    label={ATTENDANCE_STATUS_LABEL[a.status]}
                    className={ATTENDANCE_STATUS_CLASS[a.status]}
                  />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={`Avaliações recebidas (${evaluations.length})`}>
          {evaluations.length === 0 ? (
            <p className="text-[12.5px] text-ink/45">Ainda sem avaliações.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {evaluations.map((e) => (
                <Card key={e.id}>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < e.rating ? "fill-accent text-accent" : "text-linha"}
                      />
                    ))}
                    <span className="ml-1 font-mono text-[10.5px] text-ink/40">
                      {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-ink/75">{e.comment}</p>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </div>

      {prompt && (
        <Modal
          title={`${prompt === "reject" ? "Recusar" : "Bloquear"} ${caregiver.name}`}
          onClose={() => setPrompt(null)}
        >
          <Textarea
            className="mb-4 h-20"
            placeholder={
              prompt === "reject"
                ? "Ex.: documento de identidade ilegível."
                : "Ex.: denúncia em análise."
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPrompt(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmPrompt}>
              {prompt === "reject" ? "Recusar cadastro" : "Bloquear"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
