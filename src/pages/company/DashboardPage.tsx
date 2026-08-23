import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import { AttendanceCard } from "../../components/shared/AttendanceCard";
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

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="mb-2.5 text-body font-semibold text-ink">
        {title}
        {count !== undefined && count > 0 && <span className="ml-1.5 text-ink/30">({count})</span>}
      </h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-[14px] border border-dashed border-linha py-6 text-center text-body text-ink/45">
      {text}
    </p>
  );
}

export function CompanyDashboardPage() {
  const { session } = useSession();
  const { state } = useAppState();

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body text-ink/50">
        Carregando…
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
    <div className="mx-auto max-w-2xl px-6 py-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display font-semibold">Início</h1>
          <p className="prosa mt-1 text-body text-ink/50">{company?.name}</p>
        </div>
        <Link
          to="/empresa/atendimentos/novo"
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-note font-semibold text-accent-ink transition-transform duration-[80ms] active:scale-[0.96]"
        >
          <Plus size={15} /> Novo atendimento
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-linha bg-linha sm:grid-cols-5">
        {numbers.map((n) => (
          <div
            key={n.label}
            className="flex h-full flex-col justify-between gap-2 bg-surface-raised px-3.5 py-3 last:col-span-2 sm:last:col-span-1"
          >
            <div className="text-meta font-medium tracking-wide text-ink/70 uppercase">{n.label}</div>
            <div className="mt-1 font-mono text-title leading-none">{n.value}</div>
          </div>
        ))}
      </div>

      <Section title="Pendências" count={pendencies.length}>
        {pendencies.length === 0 ? (
          <Empty text="Nada pendente no momento." />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {pendencies.map((p) => (
              <li
                key={p.id}
                className="flex items-start gap-2 rounded-[10px] border border-linha bg-surface-raised px-3 py-2.5 text-body text-ink/75"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {p.text}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Atendimentos de hoje" count={today.length}>
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

      <Link
        to="/empresa/relatorios"
        className="mt-7 inline-flex items-center gap-2 rounded-[10px] border border-linha bg-surface-raised px-4 py-2.5 text-note font-semibold transition-colors duration-200 ease-out hover:border-accent md:hidden"
      >
        <FileText size={15} /> Relatório de horas
      </Link>

      <Section title="Atividade recente">
        {activity.length === 0 ? (
          <Empty text="Sem movimentação registrada." />
        ) : (
          <ul>
            {activity.map((entry) => (
              <li key={entry.id} className="border-b border-linha py-2.5 last:border-0">
                <p className="text-body text-ink/75">{entry.text}</p>
                <p className="mt-0.5 font-mono text-meta text-ink/40">
                  {new Date(entry.at).toLocaleString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
