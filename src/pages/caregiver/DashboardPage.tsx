import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import {
  ButtonLink,
  Dado,
  ListaDeDados,
  Painel,
  SkeletonLista,
  StatusAtendimento,
  Vazio,
} from "../../components/ui";
import { AttendanceRow } from "../../components/shared/AttendanceRow";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { completedHours, todayISO } from "../../services/attendances";
import { caregiverRating } from "../../services/caregivers";
import { caregiverInvitations } from "../../services/invitations";
import { formatCurrency, formatRating } from "../../utils/format";
import { rotuloDoDia } from "../../utils/date";
import { PAGE_WORK } from "../../components/layout/page";

export function CaregiverDashboardPage() {
  const { session } = useSession();
  const { state } = useAppState();

  if (!state) {
    return (
      <div className={PAGE_WORK}>
        <h1 className="text-display">Início</h1>
        <div className="mt-6">
          <SkeletonLista itens={3} />
        </div>
      </div>
    );
  }

  const caregiver = state.caregivers.find((c) => c.id === session?.caregiverId);
  const mine = state.attendances.filter(
    (a) => a.confirmedCaregiverId === session?.caregiverId && a.status !== "cancelled",
  );
  const today = todayISO();
  const upcoming = mine
    .filter((a) => a.startDate >= today && a.status !== "completed" && a.status !== "evaluated")
    .sort((a, b) => `${a.startDate}T${a.startTime}`.localeCompare(`${b.startDate}T${b.startTime}`));
  const next = upcoming[0];
  const restante = upcoming.slice(1, 6);
  const invitations = caregiverInvitations(state, session?.caregiverId);
  const rating = caregiverRating(state.evaluations, session?.caregiverId ?? "");
  const horas = Math.round(completedHours(mine));

  const patientName = (id: string) => state.patients.find((p) => p.id === id)?.name ?? "Paciente";

  return (
    <div className={PAGE_WORK}>
      <h1 className="text-display">Início</h1>
      <p className="mt-1 text-note text-ink-subtle">{caregiver?.name}</p>

      {/*
        Convite pendente é a única coisa nesta tela que **expira**: enquanto o cuidador não
        responde, a empresa está esperando e o plantão pode ir para outro. Por isso ele não é um
        cartão de métrica entre outros dois — é uma faixa de chamada acima de tudo, com a ação
        junto. Sem convite, a faixa não existe e a tela começa pelo próximo atendimento.
      */}
      {invitations.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 rounded-card border border-status-aberto/30 bg-status-aberto-soft px-3.5 py-3">
          <p className="min-w-0 text-note text-status-aberto">
            <span className="font-semibold">
              {invitations.length} {invitations.length === 1 ? "convite" : "convites"}
            </span>{" "}
            {invitations.length === 1 ? "aguardando sua resposta" : "aguardando sua resposta"}.
          </p>
          <ButtonLink to="/cuidador/convites" size="sm" className="shrink-0">
            Ver {invitations.length === 1 ? "convite" : "convites"}
          </ButtonLink>
        </div>
      )}

      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          {/*
            O próximo atendimento é a tela inteira para quem está a caminho dele. Não é um card
            entre cards: é um painel com os dados operacionais em lista de definição — endereço,
            horário, duração, valor —, que é como se lê uma ordem de serviço.
          */}
          <Painel
            title="Próximo atendimento"
            actions={
              next && (
                <Link
                  to={`/cuidador/atendimentos/${next.id}`}
                  className="text-meta font-semibold text-accent underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-accent/50"
                >
                  Abrir ficha
                </Link>
              )
            }
          >
            {!next ? (
              <Vazio porte="linha">Nenhum atendimento à frente.</Vazio>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <div className="min-w-0">
                    <Link
                      to={`/cuidador/atendimentos/${next.id}`}
                      className="text-title text-ink transition-colors duration-150 ease-out hover:text-accent"
                    >
                      {patientName(next.patientId)}
                    </Link>
                    <p className="mt-0.5 text-note text-ink-subtle">
                      {ATTENDANCE_TYPE_LABEL[next.type]} ·{" "}
                      <span className="numero">{next.durationHours}h</span>
                    </p>
                  </div>
                  <StatusAtendimento status={next.status} variant="bloco" />
                </div>

                <ListaDeDados className="mt-3">
                  <Dado termo="Quando">
                    <span className="numero">
                      {rotuloDoDia(next.startDate)} · {next.startTime}
                    </span>
                  </Dado>
                  <Dado termo="Onde">{next.neighborhood}</Dado>
                  <Dado termo="Valor">
                    <span className="numero">{formatCurrency(next.value)}</span>
                  </Dado>
                </ListaDeDados>
              </>
            )}
          </Painel>

          <Painel
            title="Agenda"
            count={restante.length || undefined}
            flush
            actions={
              <Link
                to="/cuidador/agenda"
                className="text-meta font-semibold text-accent underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-accent/50"
              >
                Ver tudo
              </Link>
            }
          >
            {restante.length === 0 ? (
              <Vazio porte="linha">Nada além do próximo atendimento.</Vazio>
            ) : (
              <ul className="divide-y divide-linha">
                {restante.map((a) => (
                  <AttendanceRow
                    key={a.id}
                    attendance={a}
                    to={`/cuidador/atendimentos/${a.id}`}
                    patientName={patientName(a.patientId)}
                  />
                ))}
              </ul>
            )}
          </Painel>
        </div>

        {/*
          Horas e avaliação são **contexto**, não manchete: dizem como o trabalho vem indo, não o
          que fazer agora. Por isso descem para a coluna de apoio no desktop e para o pé no
          celular, numa lista de dados — não em dois cartões com ícone, que é o que faziam dois
          números virarem a coisa mais pesada da tela.
        */}
        <Painel title="Seu resumo" className="mt-5 lg:mt-0">
          <ListaDeDados>
            <Dado termo="Horas realizadas">
              <span className="numero">{horas}h</span>
            </Dado>
            <Dado termo="Avaliação">
              {rating.average === null ? (
                <span className="text-ink-subtle">
                  <span className="numero">{rating.count}</span> de 3 avaliações
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Star size={13} aria-hidden="true" className="fill-rating text-rating" />
                  <span className="numero">{formatRating(rating.average)}</span>
                </span>
              )}
            </Dado>
            <Dado termo="Atendimentos">
              <span className="numero">{mine.length}</span>
            </Dado>
          </ListaDeDados>
          {rating.average === null && (
            /* R10 explicada onde ela age: sem isto, "1 de 3" parece nota baixa. */
            <p className="mt-2.5 text-meta text-ink-subtle">
              A média pública aparece a partir da terceira avaliação.
            </p>
          )}
        </Painel>
      </div>
    </div>
  );
}
