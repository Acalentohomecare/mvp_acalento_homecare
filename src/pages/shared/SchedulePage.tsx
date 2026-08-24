import { Fragment, useState } from "react";
import { SkeletonLista, Tabs, Vazio, type Aba } from "../../components/ui";
import {
  AttendanceGroupHeader,
  AttendanceList,
  AttendanceRow,
} from "../../components/shared/AttendanceRow";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { companyAttendances, scheduleDays } from "../../services/attendances";
import { rotuloDoDia } from "../../utils/date";
import { PAGE_LIST } from "../../components/layout/page";

type Range = "1" | "7";

export function SchedulePage() {
  const { session } = useSession();
  const { state } = useAppState();
  const [range, setRange] = useState<Range>("7");

  const isCompany = session?.role === "company";
  const titulo = isCompany ? "Escala" : "Minha agenda";

  if (!state) {
    return (
      <div className={PAGE_LIST}>
        <h1 className="text-display">{titulo}</h1>
        <div className="mt-6">
          <SkeletonLista />
        </div>
      </div>
    );
  }

  const list = isCompany
    ? companyAttendances(state, session?.companyId)
    : state.attendances.filter((a) => a.confirmedCaregiverId === session?.caregiverId);

  const days = scheduleDays(list, new Date(), Number(range));
  const total = days.reduce((sum, d) => sum + d.items.length, 0);
  const hoje = scheduleDays(list, new Date(), 1).reduce((s, d) => s + d.items.length, 0);
  const base = isCompany ? "/empresa/atendimentos" : "/cuidador/atendimentos";

  const abas: Aba<Range>[] = [
    { key: "1", label: "Hoje", count: hoje },
    { key: "7", label: "7 dias", count: scheduleDays(list, new Date(), 7).reduce((s, d) => s + d.items.length, 0) },
  ];

  return (
    <div className={PAGE_LIST}>
      <h1 className="text-display">{titulo}</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">
        {total === 0
          ? "Nenhum atendimento no período."
          : `${total} ${total === 1 ? "atendimento" : "atendimentos"} no período.`}
      </p>

      <Tabs abas={abas} atual={range} onChange={setRange} label="Período da escala" className="mt-5" />

      {/*
        A escala é **um registro só**, com o dia como cabeçalho de grupo grudado no topo — não uma
        pilha de blocos, um por dia, cada um com o próprio cabeçalho e a própria lista solta.

        A diferença aparece na semana cheia: com blocos separados, a pessoa perde de vista de que
        dia é a linha que está lendo assim que rola dois dias; com cabeçalho `sticky`, o dia
        acompanha. É o comportamento de uma agenda de verdade.
      */}
      <AttendanceList className="mt-4">
        {/* Fragmento, e não um `<li>` com `<ul>` dentro: o `divide-y` da moldura desenha o fio
            entre **filhos diretos**, e um nível a mais de lista tiraria todas as linhas do dia de
            baixo dele — cada grupo voltaria a ser um bloco solto, que é justamente o que saiu. */}
        {days.map((day) => (
          <Fragment key={day.date}>
            <AttendanceGroupHeader label={rotuloDoDia(day.date)} count={day.items.length} />
            {day.items.length === 0 ? (
              <li>
                <Vazio porte="linha">Nenhum atendimento neste dia.</Vazio>
              </li>
            ) : (
              day.items.map((a) => {
                const patient = state.patients.find((p) => p.id === a.patientId);
                const caregiver = state.caregivers.find((c) => c.id === a.confirmedCaregiverId);
                return (
                  <AttendanceRow
                    key={a.id}
                    attendance={a}
                    to={`${base}/${a.id}`}
                    patientName={patient?.name ?? "Paciente"}
                    /* A empresa precisa saber quem cobre o plantão; o cuidador é ele mesmo. */
                    caregiverName={isCompany ? caregiver?.name : undefined}
                    caregiverId={isCompany ? a.confirmedCaregiverId : undefined}
                    showDate={false}
                  />
                );
              })
            )}
          </Fragment>
        ))}
      </AttendanceList>
    </div>
  );
}
