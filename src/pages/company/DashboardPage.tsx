import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ButtonLink,
  LinhaDoTempo,
  PRODUTO_NOME,
  Painel,
  SkeletonLista,
  Vazio,
  type EventoLinhaDoTempo,
} from "../../components/ui";
import { AttendanceRow } from "../../components/shared/AttendanceRow";
import { AttendanceOpenActions } from "../../components/shared/AttendanceOpenActions";
import { rosterQueue } from "../../services/roster";
import { compatibleCaregivers } from "../../services/matching";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  activeCaregiverIds,
  applicationsToReview,
  awaitingCaregiverAttendances,
  companyAttendances,
  completedHours,
  draftAttendances,
  pendingCheckins,
  recentActivity,
  todayAttendances,
  upcomingAttendances,
} from "../../services/attendances";
import { companyPatients } from "../../services/patients";
import { carimbo } from "../../utils/date";
import { PAGE_WORK } from "../../components/layout/page";

/**
 * Pendência — o que espera uma decisão da coordenadora.
 *
 * `urgencia` decide a tinta do marcador, e só existem duas: **âmbar** para o que espera decisão e
 * **vermelho** para o que já está atrasado. Três níveis de urgência num painel de dez itens não
 * são lidos como três níveis; são lidos como enfeite.
 */
interface Pendencia {
  id: string;
  texto: string;
  para: string;
  urgente?: boolean;
}

export function CompanyDashboardPage() {
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

  const company = state.companies.find((c) => c.id === session?.companyId);
  const all = companyAttendances(state, session?.companyId);
  const patients = companyPatients(state, session?.companyId);

  const today = todayAttendances(all);
  const awaiting = awaitingCaregiverAttendances(all);
  const upcoming = upcomingAttendances(all);
  const drafts = draftAttendances(all);
  const toReview = applicationsToReview(all);
  const lateCheckins = pendingCheckins(all);
  const alerts = state.dashboardAlerts.filter((a) => a.companyId === session?.companyId);
  const activity = recentActivity(all, patients);
  const awaitingApproval = rosterQueue(state, session?.companyId);
  const activeCount = activeCaregiverIds(all).length;

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Paciente";
  const caregiverName = (id?: string) =>
    id ? state.caregivers.find((c) => c.id === id)?.name : undefined;

  // O quadro é responsabilidade da empresa: cadastro parado na fila trava os plantões.
  const pendencias: Pendencia[] = [
    ...(awaitingApproval.length > 0
      ? [
          {
            id: "roster",
            texto: `${awaitingApproval.length} cuidador(es) aguardando aprovação para o quadro`,
            para: "/empresa/cuidadores",
          },
        ]
      : []),
    ...lateCheckins.map((a) => ({
      id: `chk-${a.id}`,
      texto: `Check-in pendente — ${patientName(a.patientId)}, ${a.startTime}`,
      para: `/empresa/atendimentos/${a.id}`,
      urgente: true,
    })),
    ...toReview.map((a) => ({
      id: `app-${a.id}`,
      texto: `Candidaturas aguardando decisão — ${patientName(a.patientId)}`,
      para: `/empresa/atendimentos/${a.id}/candidaturas`,
    })),
    ...drafts.map((a) => ({
      id: `dft-${a.id}`,
      texto: `Rascunho não publicado — ${patientName(a.patientId)}`,
      para: `/empresa/atendimentos/${a.id}`,
    })),
    ...alerts.map((a) => ({ id: a.id, texto: a.text, para: "/empresa/atendimentos" })),
  ];

  const eventos: EventoLinhaDoTempo[] = activity.map((entry) => ({
    id: entry.id,
    evento: entry.text,
    quando: carimbo(entry.at),
  }));

  const dateLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={PAGE_WORK}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display">Início</h1>
          <p className="mt-1 text-note text-ink-subtle">
            {company?.name !== PRODUTO_NOME && `${company?.name} · `}
            {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
          </p>
        </div>
        <ButtonLink to="/empresa/atendimentos/novo" className="shrink-0">
          <Plus size={15} /> Novo atendimento
        </ButtonLink>
      </div>

      {/*
        A primeira coisa que a coordenadora precisa saber não é uma parede de números — é uma
        frase: quantos atendimentos hoje, quantos plantões ainda sem cuidador. "Em aberto" é
        também o link mais curto até "ver quem está disponível", por isso mora na frase, não numa
        caixa. Pacientes, cuidadores ativos e horas descem para uma linha quieta abaixo: são
        contexto, não a manchete do dia.
      */}
      <p className="mt-5 max-w-2xl text-body text-ink-muted">
        {today.length > 0 ? (
          <>
            <span className="text-heading font-semibold text-accent">{today.length}</span>{" "}
            {today.length === 1 ? "atendimento hoje" : "atendimentos hoje"}
          </>
        ) : (
          "Nenhum atendimento hoje"
        )}
        {awaiting.length > 0 ? (
          <>
            {" "}
            ·{" "}
            <Link
              to="/empresa/atendimentos?filtro=awaiting"
              className="font-semibold text-status-aberto underline decoration-status-aberto/30 underline-offset-2 transition-colors duration-150 ease-out hover:decoration-status-aberto"
            >
              {awaiting.length} {awaiting.length === 1 ? "plantão em aberto" : "plantões em aberto"}
            </Link>{" "}
            aguardando cuidador
          </>
        ) : (
          " — nenhum plantão em aberto no momento"
        )}
        .
      </p>
      <p className="mt-1.5 text-meta text-ink-subtle">
        {patients.length} {patients.length === 1 ? "paciente" : "pacientes"} · {activeCount}{" "}
        {activeCount === 1 ? "cuidador ativo" : "cuidadores ativos"} ·{" "}
        <span className="numero">{Math.round(completedHours(all))}h</span> realizadas
      </p>

      {/*
        A grade de trabalho do desktop, e ela tem só duas peças: a **fila** na coluna larga e as
        **pendências** numa coluna de apoio que acompanha a rolagem. Pendência é o que espera uma
        decisão da coordenadora; deixá-la fixa enquanto a fila rola é a diferença entre lembrar e
        não lembrar dela.

        A colocação é explícita (`col-start` / `row-start`) e não por ordem de escrita, porque no
        celular a ordem certa é outra — pendência primeiro, fila depois. Sem grade, o documento já
        sai nessa ordem, e é por isso que Pendências vem escrita antes da fila mesmo aparecendo à
        direita no desktop.
      */}
      <div className="mt-6 flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-8">
        <Painel
          title="Pendências"
          count={pendencias.length}
          flush
          className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1"
        >
          {pendencias.length === 0 ? (
            <Vazio porte="linha">Nada pendente no momento.</Vazio>
          ) : (
            /* Cada pendência é uma linha clicável que leva ao lugar onde a decisão é tomada. Eram
               itens de lista com borda e sombra que não levavam a lugar nenhum: a coordenadora
               lia "Candidaturas aguardando decisão" e precisava procurar o atendimento na mão. */
            <ul className="divide-y divide-linha">
              {pendencias.map((p) => (
                <li key={p.id}>
                  <Link
                    to={p.para}
                    className="flex items-start gap-2.5 px-3.5 py-2.5 text-note text-ink-muted transition-colors duration-150 ease-out hover:bg-surface-sunken/60 hover:text-ink"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-[7px] size-1.5 shrink-0 rounded-full ${
                        p.urgente ? "bg-status-cancelado" : "bg-status-aberto"
                      }`}
                    />
                    <span className="min-w-0">{p.texto}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Painel>

        <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-1">
          {/* Sem atendimento hoje, este painel não aparece — a frase acima já disse "Nenhum
              atendimento hoje", e repetir a mesma informação num painel vazio custa ~110px do
              topo da tela mais usada do produto. Painel vazio só se justifica quando o vazio é
              notícia; aqui a notícia já foi dada. */}
          {today.length > 0 && (
            <Painel title="Atendimentos de hoje" count={today.length} flush>
              <ul className="divide-y divide-linha">
                {today.map((a) => (
                  <AttendanceRow
                    key={a.id}
                    attendance={a}
                    to={`/empresa/atendimentos/${a.id}`}
                    patientName={patientName(a.patientId)}
                    caregiverName={caregiverName(a.confirmedCaregiverId)}
                    caregiverId={a.confirmedCaregiverId}
                    showDate={false}
                  />
                ))}
              </ul>
            </Painel>
          )}

          <Painel
            title="Em aberto"
            count={awaiting.length}
            flush
            actions={
              awaiting.length > 0 && (
                <Link
                  to="/empresa/atendimentos?filtro=awaiting"
                  className="text-meta font-semibold text-accent underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-accent/50"
                >
                  Ver todos
                </Link>
              )
            }
          >
            {awaiting.length === 0 ? (
              <Vazio porte="linha">Nenhum plantão aguardando cuidador.</Vazio>
            ) : (
              <ul className="divide-y divide-linha">
                {awaiting.map((a) => {
                  const compatible = compatibleCaregivers(state, a).length;
                  const applications = state.applications.filter(
                    (ap) => ap.attendanceId === a.id,
                  ).length;
                  return (
                    <AttendanceRow
                      key={a.id}
                      attendance={a}
                      to={`/empresa/atendimentos/${a.id}`}
                      patientName={patientName(a.patientId)}
                      caregiverName={caregiverName(a.confirmedCaregiverId)}
                      caregiverId={a.confirmedCaregiverId}
                      note={
                        compatible === 0 ? (
                          <span className="text-status-cancelado">
                            Nenhum cuidador compatível no quadro
                          </span>
                        ) : (
                          <span className="text-ink-subtle">
                            <span className="numero">{compatible}</span>{" "}
                            {compatible === 1 ? "compatível" : "compatíveis"} no quadro
                          </span>
                        )
                      }
                      actions={
                        <AttendanceOpenActions attendance={a} applicationsCount={applications} />
                      }
                    />
                  );
                })}
              </ul>
            )}
          </Painel>

          <Painel
            title="Próximos"
            count={upcoming.length}
            flush
            actions={
              upcoming.length > 4 && (
                <Link
                  to="/empresa/agenda"
                  className="text-meta font-semibold text-accent underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-accent/50"
                >
                  Ver escala
                </Link>
              )
            }
          >
            {upcoming.length === 0 ? (
              <Vazio porte="linha">Nenhum atendimento confirmado à frente.</Vazio>
            ) : (
              <ul className="divide-y divide-linha">
                {upcoming.slice(0, 4).map((a) => (
                  <AttendanceRow
                    key={a.id}
                    attendance={a}
                    to={`/empresa/atendimentos/${a.id}`}
                    patientName={patientName(a.patientId)}
                    caregiverName={caregiverName(a.confirmedCaregiverId)}
                    caregiverId={a.confirmedCaregiverId}
                  />
                ))}
              </ul>
            )}
          </Painel>

          {/* Fim da leitura da operação: hoje → em aberto → à frente → o que acabou de acontecer. */}
          <Painel title="Atividade recente">
            {eventos.length === 0 ? (
              <Vazio porte="linha">Sem movimentação registrada.</Vazio>
            ) : (
              <LinhaDoTempo eventos={eventos} />
            )}
          </Painel>
        </div>
      </div>
    </div>
  );
}
