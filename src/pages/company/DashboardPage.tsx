import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { ButtonLink, PRODUTO_NOME, TelaCarregando } from "../../components/ui";
import { AttendanceCard } from "../../components/shared/AttendanceCard";
import { StatStrip } from "../../components/shared/StatStrip";
import { rosterQueue } from "../../services/roster";
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
import { PAGE_WORK } from "../../components/layout/page";

function Section({
  title,
  count,
  children,
  className = "",
}: {
  title: string;
  count?: number;
  children: ReactNode;
  /** No desktop a grade é que separa as seções, então quem entra nela zera o `mt`. */
  className?: string;
}) {
  return (
    <section className={`mt-7 ${className}`}>
      <h2 className="mb-2.5 flex items-center gap-2 text-heading text-ink">
        {title}
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-surface-sunken px-1.5 py-0.5 numero text-meta leading-none text-ink-muted">
            {count}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-card border border-dashed border-linha bg-surface-raised/50 py-7 text-center text-note text-ink-subtle">
      {text}
    </p>
  );
}

export function CompanyDashboardPage() {
  const { session } = useSession();
  const { state } = useAppState();

  if (!state) {
    return <TelaCarregando />;
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

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Paciente";
  const caregiverName = (id?: string) =>
    id ? state.caregivers.find((c) => c.id === id)?.name : undefined;

  const numbers = [
    { label: "Hoje", value: String(today.length) },
    { label: "Em aberto", value: String(awaiting.length) },
    { label: "Pacientes", value: String(patients.length) },
    { label: "Cuidadores ativos", value: String(activeCaregiverIds(all).length) },
    { label: "Horas realizadas", value: `${Math.round(completedHours(all))}h` },
  ];

  const pendencies = [
    // O quadro é responsabilidade da empresa: cadastro parado na fila trava os plantões.
    ...(awaitingApproval.length > 0
      ? [
          {
            id: "roster",
            text: `${awaitingApproval.length} cuidador(es) aguardando sua aprovação para entrar no quadro.`,
          },
        ]
      : []),
    ...lateCheckins.map((a) => ({
      id: `chk-${a.id}`,
      text: `Check-in pendente — ${patientName(a.patientId)}, ${a.startTime}.`,
    })),
    ...toReview.map((a) => ({
      id: `app-${a.id}`,
      text: `Candidaturas aguardando sua decisão — ${patientName(a.patientId)}.`,
    })),
    ...drafts.map((a) => ({
      id: `dft-${a.id}`,
      text: `Rascunho não publicado — ${patientName(a.patientId)}.`,
    })),
    ...alerts.map((a) => ({ id: a.id, text: a.text })),
  ];

  return (
    <div className={PAGE_WORK}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display">Início</h1>
          {company?.name !== PRODUTO_NOME && (
          <p className="prosa mt-1 text-body text-ink-subtle">{company?.name}</p>
        )}
        </div>
        <ButtonLink to="/empresa/atendimentos/novo">
          <Plus size={15} /> Novo atendimento
        </ButtonLink>
      </div>

      <StatStrip items={numbers} />

      {/*
        A grade de trabalho do desktop, e ela tem só duas peças: a **fila** na coluna larga e as
        **pendências** numa coluna de apoio que acompanha a rolagem. Pendência é o que espera uma
        decisão da coordenadora; deixá-la fixa enquanto a fila rola é a diferença entre lembrar e
        não lembrar dela.

        A colocação é explícita (`col-start` / `row-start`) e não por ordem de escrita, porque no
        celular a ordem certa é outra — pendência primeiro, fila depois. Sem grade, o documento já
        sai nessa ordem, e é por isso que Pendências vem escrita antes da fila mesmo aparecendo à
        direita no desktop.

        "Atividade recente" não entra na coluna de apoio: ela é o fim da leitura da operação (hoje
        → em aberto → à frente → o que acabou de acontecer) e fica no pé da coluna larga. Na
        coluna de apoio ela abriria um vão que nenhuma regra de conteúdo determina — só a
        aritmética de linhas da grade.
      */}
      <div className="mt-7 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-8">
        <Section
          title="Pendências"
          count={pendencies.length}
          className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:mt-0"
        >
          {pendencies.length === 0 ? (
            <Empty text="Nada pendente no momento." />
          ) : (
            <ul className="flex flex-col gap-1.5">
              {pendencies.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start gap-2.5 rounded-control border border-linha bg-surface-raised px-3 py-2.5 text-body text-ink-muted shadow-card"
                >
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-status-aberto" />
                  {p.text}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <Section title="Atendimentos de hoje" count={today.length} className="lg:mt-0">
            {today.length === 0 ? (
              <Empty text="Nenhum atendimento agendado para hoje." />
            ) : (
              <div className="flex flex-col gap-2.5">
                {today.map((a) => (
                  <AttendanceCard
                    key={a.id}
                    attendance={a}
                    patientName={patientName(a.patientId)}
                    caregiverName={caregiverName(a.confirmedCaregiverId)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Em aberto — aguardando cuidador" count={awaiting.length}>
            {awaiting.length === 0 ? (
              <Empty text="Nenhum atendimento aguardando cuidador." />
            ) : (
              <div className="flex flex-col gap-2.5">
                {awaiting.map((a) => (
                  <AttendanceCard
                    key={a.id}
                    attendance={a}
                    patientName={patientName(a.patientId)}
                    caregiverName={caregiverName(a.confirmedCaregiverId)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Próximos atendimentos" count={upcoming.length}>
            {upcoming.length === 0 ? (
              <Empty text="Nenhum atendimento confirmado à frente." />
            ) : (
              <div className="flex flex-col gap-2.5">
                {upcoming.slice(0, 4).map((a) => (
                  <AttendanceCard
                    key={a.id}
                    attendance={a}
                    patientName={patientName(a.patientId)}
                    caregiverName={caregiverName(a.confirmedCaregiverId)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section title="Atividade recente">
            {activity.length === 0 ? (
              <Empty text="Sem movimentação registrada." />
            ) : (
              <ul>
                {activity.map((entry) => (
                  <li key={entry.id} className="border-b border-linha py-2.5 last:border-0">
                    <p className="text-body text-ink-muted">{entry.text}</p>
                    <p className="mt-0.5 numero text-meta text-ink-subtle">
                      {new Date(entry.at).toLocaleString("pt-BR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
