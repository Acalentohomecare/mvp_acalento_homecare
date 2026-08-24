import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck, Check, Heart, Star } from "lucide-react";
import {
  ACTION_LINK_CLASS,
  Avatar,
  Button,
  Cracha,
  Input,
  Painel,
  Select,
  TelaCarregando,
  Vazio,
  VoltarLink,
} from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { CATEGORY_CLASS, CATEGORY_LABEL, SHIFT_LABEL, SHIFT_ORDER } from "../../constants/caregiver";
import { caregiverRating, isFavorite, isVerified } from "../../services/caregivers";
import { compatibleCaregivers, filterMatches } from "../../services/matching";
import {
  attendanceById,
  attendanceInvitations,
  sendInvitation,
  setOpenApplications,
} from "../../services/invitations";
import { formatCurrency, formatRating } from "../../utils/format";
import { rotuloDoDia } from "../../utils/date";
import type { Shift } from "../../types";
import { PAGE_LIST } from "../../components/layout/page";

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
  const required = attendance.requiredCategory;
  const invitations = attendanceInvitations(state, attendance.id);
  const invitedIds = invitations.filter((i) => i.status !== "rejected").map((i) => i.caregiverId);
  const todos = compatibleCaregivers(state, attendance);
  const matches = filterMatches(todos, { query, shift, maxRate });

  return (
    <div className={PAGE_LIST}>
      <VoltarLink to="/empresa/atendimentos">Atendimentos</VoltarLink>

      <h1 className="mt-3 text-display">Cuidadores compatíveis</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">
        {patient?.name} ·{" "}
        <span className="numero">
          {rotuloDoDia(attendance.startDate)}, {attendance.startTime}
        </span>{" "}
        · {attendance.neighborhood}
      </p>

      {/*
        Contexto do recorte, numa faixa só. Eram dois cards empilhados — um para o perfil exigido,
        outro para a publicação aberta —, e os dois somavam ~150px de caixa antes do primeiro
        cuidador aparecer. A informação é a mesma; o que sumiu foi a moldura em volta de cada
        frase.

        Esta faixa é a regra R2/R3 **agindo à vista**: ela diz por que a lista abaixo é essa e não
        outra. Numa apresentação comercial, é a frase que explica o produto.
      */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-card border border-linha bg-surface-sunken/60 px-3.5 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-note text-ink-muted">Perfil necessário:</span>
          <Cracha label={CATEGORY_LABEL[required]} className={CATEGORY_CLASS[required]} />
          <span className="text-meta text-ink-subtle">
            {required === "informal"
              ? "definido por quem publicou o atendimento"
              : "cuidadores de categoria inferior não aparecem aqui"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="text-right">
            <p className="text-note font-medium text-ink">Publicação aberta</p>
            <p className="text-meta text-ink-subtle">Qualquer compatível pode se candidatar</p>
          </div>
          <Button
            variant={attendance.openApplications ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={attendance.openApplications}
            onClick={() =>
              setState((s) => setOpenApplications(s, attendance.id, !attendance.openApplications))
            }
          >
            {attendance.openApplications ? "Ativada" : "Ativar"}
          </Button>
        </div>
      </div>

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

      {/*
        Os candidatos viraram registro, e não uma grade de cards. O trabalho aqui é **comparar**
        — categoria, avaliação, valor, região — e comparação depende de os mesmos dados caírem na
        mesma posição em todas as linhas. Em cards lado a lado, o valor de um ficava na terceira
        linha e o do outro na quarta, e a coordenadora relia cada caixa.
      */}
      <Painel
        title="Compatíveis"
        count={matches.length}
        flush
        className="mt-5"
        actions={
          matches.length !== todos.length && (
            <span className="text-meta text-ink-subtle">
              <span className="numero">{todos.length}</span> no total
            </span>
          )
        }
      >
        {matches.length === 0 ? (
          <Vazio>
            {todos.length === 0
              ? "Nenhum cuidador do seu quadro atende ao perfil exigido por este atendimento."
              : "Nenhum cuidador compatível com esses critérios — o filtro é que está estreito."}
          </Vazio>
        ) : (
          <ul className="divide-y divide-linha">
            {matches.map((c) => {
              const rating = caregiverRating(state.evaluations, c.id);
              const invited = invitedIds.includes(c.id);
              return (
                <li key={c.id} className="flex items-start gap-3 p-3.5">
                  <Avatar name={c.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-title text-ink">{c.name}</span>
                        {isFavorite(state, session?.companyId, c.id) && (
                          <Heart
                            size={13}
                            aria-label="Favorito"
                            className="shrink-0 fill-accent text-accent"
                          />
                        )}
                        {isVerified(c) && (
                          <BadgeCheck
                            size={14}
                            aria-label="Verificado"
                            className="shrink-0 text-cat-informal"
                          />
                        )}
                      </span>
                      <span className="numero shrink-0 text-note font-medium text-ink">
                        {formatCurrency(c.shiftRate)}
                      </span>
                    </div>

                    {/* Credencial, região, experiência e nota na **mesma linha**: eram duas, e num
                        painel de seis candidatos isso somava 180px de altura sem somar informação.
                        A credencial abre a linha porque é o dado que a regra R2/R3 usa. */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Cracha label={CATEGORY_LABEL[c.category]} className={CATEGORY_CLASS[c.category]} />
                      <span className="min-w-0 truncate text-note text-ink-subtle">
                        {c.neighborhoods.join(", ")} ·{" "}
                        <span className="numero">{c.experienceYears}</span> anos
                      </span>
                      {rating.average === null ? (
                        <span className="text-meta text-ink-subtle">Sem média pública</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-note font-semibold text-ink-muted">
                          <Star size={12} aria-hidden="true" className="fill-rating text-rating" />
                          <span className="numero">{formatRating(rating.average)}</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link to={`/empresa/cuidadores/${c.id}`} className={ACTION_LINK_CLASS}>
                        Ver perfil
                      </Link>
                      {/* Convite enviado não é "botão indisponível": é uma coisa que já aconteceu.
                          Como botão desabilitado, aparecia a 45% de opacidade e lia como falha.
                          Vira confirmação em texto — o mesmo vocabulário de estado do resto do
                          módulo, agora sem a pastilha (DESIGN_SYSTEM.md, seção 3.1). */}
                      {invited ? (
                        <span className="inline-flex min-h-11 items-center gap-1.5 text-label font-semibold text-status-confirmado pointer-fine:min-h-8">
                          <Check size={13} aria-hidden="true" /> Convidado
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setState((s) => sendInvitation(s, attendance.id, c.id))}
                        >
                          Convidar
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
    </div>
  );
}
