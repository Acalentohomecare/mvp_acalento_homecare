import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, Check, Heart, Star } from "lucide-react";
import { Avatar, Button, Card, Cracha, Input, Select, TelaCarregando, VoltarLink } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { CATEGORY_CLASS, CATEGORY_LABEL, SHIFT_LABEL, SHIFT_ORDER } from "../../constants/caregiver";
import { attendanceRequiredCategory } from "../../services/attendances";
import { caregiverRating, isFavorite, isVerified } from "../../services/caregivers";
import { compatibleCaregivers, filterMatches } from "../../services/matching";
import {
  attendanceById,
  attendanceInvitations,
  sendInvitation,
  setOpenApplications,
} from "../../services/invitations";
import { formatCurrency, formatRating } from "../../utils/format";
import type { Shift } from "../../types";
import { LIST_GRID, PAGE_LIST } from "../../components/layout/page";

export function MatchingPage() {
  const { attendanceId } = useParams();
  const { session } = useSession();
  const { state, setState } = useAppState();

  const [query, setQuery] = useState("");
  const [shift, setShift] = useState<Shift | "all">("all");
  const [maxRate, setMaxRate] = useState("");

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
  const required = attendanceRequiredCategory(attendance.activityIds);
  const invitations = attendanceInvitations(state, attendance.id);
  const invitedIds = invitations.filter((i) => i.status !== "rejected").map((i) => i.caregiverId);
  const matches = filterMatches(compatibleCaregivers(state, attendance), { query, shift, maxRate });

  return (
    <div className={PAGE_LIST}>
      <VoltarLink to="/empresa/atendimentos">Atendimentos</VoltarLink>

      <h1 className="mt-3 text-display">Cuidadores compatíveis</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">
        {patient?.name} · {attendance.startDate.split("-").reverse().join("/")} às{" "}
        {attendance.startTime} · {attendance.neighborhood}
      </p>

      <Card className="mt-4 flex flex-wrap items-center gap-2.5">
        <span className="text-note text-ink-muted">Perfil exigido pelas atividades:</span>
        <Cracha label={CATEGORY_LABEL[required]} className={CATEGORY_CLASS[required]} />
        <span className="text-note text-ink-subtle">
          {required === "informal"
            ? "Nenhuma atividade exige formação."
            : "Cuidadores de categoria inferior não aparecem nesta lista."}
        </span>
      </Card>

      <Card className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-note font-semibold">Publicação aberta</p>
          <p className="mt-0.5 text-note text-ink-subtle">
            Qualquer cuidador compatível pode se candidatar.
          </p>
        </div>
        <Button
          variant={attendance.openApplications ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={attendance.openApplications}
          onClick={() => setState((s) => setOpenApplications(s, attendance.id, !attendance.openApplications))}
        >
          {attendance.openApplications ? "Ativada" : "Ativar"}
        </Button>
      </Card>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        <Input
          label="Buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome, bairro, especialidade"
        />
        <Select label="Turno" value={shift} onChange={(e) => setShift(e.target.value as Shift | "all")}>
          <option value="all">Qualquer turno</option>
          {SHIFT_ORDER.map((s) => (
            <option key={s} value={s}>
              {SHIFT_LABEL[s]}
            </option>
          ))}
        </Select>
        <Input
          label="Valor até (R$)"
          type="number"
          min={0}
          value={maxRate}
          onChange={(e) => setMaxRate(e.target.value)}
          placeholder="sem limite"
        />
      </div>

      <p className="mt-5 mb-2.5 text-note text-ink-subtle">
        {matches.length} {matches.length === 1 ? "cuidador compatível" : "cuidadores compatíveis"}
      </p>

      {matches.length === 0 ? (
        <p className="rounded-card border border-dashed border-linha py-10 text-center text-body text-ink-subtle">
          Nenhum cuidador compatível com esses critérios.
        </p>
      ) : (
        <div className={LIST_GRID}>
          {matches.map((c) => {
            const rating = caregiverRating(state.evaluations, c.id);
            const invited = invitedIds.includes(c.id);
            return (
              <Card key={c.id} className="flex items-start gap-3">
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-title">{c.name}</span>
                    {isFavorite(state, session?.companyId, c.id) && (
                      <Heart size={13} className="fill-accent text-accent" aria-label="Favorito" />
                    )}
                    {isVerified(c) && (
                      <span className="inline-flex items-center gap-1 text-meta font-semibold text-cat-informal">
                        <BadgeCheck size={13} /> Verificado
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-note text-ink-subtle">
                    {c.neighborhoods.join(", ")} · {c.experienceYears} anos
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Cracha label={CATEGORY_LABEL[c.category]} className={CATEGORY_CLASS[c.category]} />
                    {rating.average === null ? (
                      <span className="text-meta text-ink-subtle">Sem média pública</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-note font-semibold text-ink-muted">
                        <Star size={12} className="fill-rating text-rating" />
                        {formatRating(rating.average)}
                      </span>
                    )}
                    <span className="numero text-note text-ink-muted">
                      {formatCurrency(c.shiftRate)}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/empresa/cuidadores/${c.id}`}
                      className="rounded-control border border-linha px-2.5 py-1.5 text-label font-semibold transition-colors hover:border-accent"
                    >
                      Ver perfil
                    </Link>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={invited}
                      onClick={() => setState((s) => sendInvitation(s, attendance.id, c.id))}
                    >
                      {invited ? (
                        <>
                          <Check size={13} /> Convidado
                        </>
                      ) : (
                        "Convidar"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
