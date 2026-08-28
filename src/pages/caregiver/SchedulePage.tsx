import { useMemo, useState } from "react";
import { Calendario, Secao, SkeletonLista, Vazio } from "../../components/ui";
import { AttendanceList, AttendanceRow } from "../../components/shared/AttendanceRow";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { todayISO } from "../../services/attendances";
import { rotuloDoDia, rotuloMes } from "../../utils/date";
import { PAGE_LIST } from "../../components/layout/page";

/*
 * A agenda do cuidador — calendário em cima, plantões do dia escolhido embaixo.
 *
 * ------------------------------------------------------------------ por que não é a escala
 *
 * A empresa e o cuidador liam a mesma tela, e não deviam: as perguntas são diferentes.
 *
 * Quem coordena pergunta *quem cobre qual dia* — são dezenas de plantões por semana, vários
 * cuidadores no mesmo dia, e a resposta é uma lista longa que se varre com filtro por pessoa. É a
 * escala, e ela continua como estava (`pages/company/SchedulePage`).
 *
 * O cuidador pergunta outra coisa: *quando eu trabalho?* Ele tem poucos plantões, espalhados no
 * mês, e o que precisa saber é onde estão os buracos — para marcar médico, para aceitar ou não um
 * convite, para combinar o fim de semana. Isso é uma pergunta de **forma do mês**, e lista não
 * responde: a lista mostra sete dias por vez e obriga a andar de semana em semana para descobrir
 * que a segunda quinzena está livre. O mês inteiro numa grade responde de relance.
 *
 * -------------------------------------------------------------------- as duas zonas
 *
 * O calendário é a visão de conjunto e não tenta ser mais que isso: ponto no dia que tem plantão,
 * nada de horário, nada de estado (o porquê está em `<Calendario>`). O detalhe fica embaixo, no
 * dia escolhido, na mesma linha de registro que o resto do produto usa.
 *
 * ------------------------------------------------------------- só o que está confirmado
 *
 * O calendário mostra plantão **confirmado**, e não convite pendente. Convite não é compromisso:
 * marcá-lo na grade faria a pessoa se planejar em cima de um dia que pode não acontecer, e é
 * justamente para decidir o fim de semana que ela abre esta tela. Convite tem tela própria, onde
 * a ação de aceitar existe.
 */
export function CaregiverSchedulePage() {
  const { session } = useSession();
  const { state } = useAppState();

  const hoje = todayISO();
  const [selecionado, setSelecionado] = useState(hoje);
  const [mes, setMes] = useState(() => hoje.slice(0, 7));

  /* Os plantões deste cuidador — a mesma leitura que a escala fazia do lado dele: confirmado é o
     que entra na agenda. */
  const plantoes = useMemo(
    () =>
      (state?.attendances ?? []).filter(
        (a) => a.confirmedCaregiverId === session?.caregiverId && a.status !== "cancelled",
      ),
    [state, session?.caregiverId],
  );

  /* Quantos plantões por dia, para o calendário pontuar. Um passo pela lista inteira, não um
     `filter` por célula: com 31 células isso seriam 31 varreduras da agenda a cada renderização. */
  const marcas = useMemo(() => {
    const contagem: Record<string, number> = {};
    for (const a of plantoes) contagem[a.startDate] = (contagem[a.startDate] ?? 0) + 1;
    return contagem;
  }, [plantoes]);

  if (!state) {
    return (
      <div className={PAGE_LIST}>
        <h1 className="text-display">Minha agenda</h1>
        <div className="mt-6">
          <SkeletonLista />
        </div>
      </div>
    );
  }

  const doDia = plantoes
    .filter((a) => a.startDate === selecionado)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  /* O resumo acompanha o **mês visível**, não o dia escolhido: é a leitura que o calendário logo
     abaixo está oferecendo, e um número que falasse do dia repetiria a contagem da seção de baixo. */
  const noMes = plantoes.filter((a) => a.startDate.startsWith(mes)).length;
  const resumo =
    noMes === 0
      ? `Nenhum atendimento em ${rotuloMes(mes)}.`
      : `${noMes} ${noMes === 1 ? "atendimento" : "atendimentos"} em ${rotuloMes(mes)}.`;

  return (
    <div className={PAGE_LIST}>
      <h1 className="text-display">Minha agenda</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">{resumo}</p>

      <Calendario
        className="mt-5"
        mes={mes}
        selecionado={selecionado}
        hoje={hoje}
        marcas={marcas}
        nomeMarca={["atendimento", "atendimentos"]}
        onSelecionar={setSelecionado}
        onMudarMes={setMes}
      />

      {/*
        O dia escolhido é escrito por extenso — "Hoje", "Ter, 26/08". É o que impede a tela de
        depender do fundo pintado na grade para dizer qual dia está aberto: quem não distingue a
        cor lê a palavra, e quem virou o mês sem escolher dia nenhum enxerga que a lista de baixo
        continua sendo a de outro mês.
      */}
      <Secao title={rotuloDoDia(selecionado)} count={doDia.length} variant="destaque" className="mt-6">
        {doDia.length === 0 ? (
          <Vazio porte="solto">
            {selecionado === hoje
              ? "Você não tem atendimento hoje."
              : "Você não tem atendimento neste dia."}
          </Vazio>
        ) : (
          <AttendanceList variant="fluxo">
            {doDia.map((a) => (
              <AttendanceRow
                key={a.id}
                attendance={a}
                to={`/cuidador/atendimentos/${a.id}`}
                patientName={state.patients.find((p) => p.id === a.patientId)?.name ?? "Paciente"}
                /* A data já está no cabeçalho da seção: repeti-la em cada linha seria a mesma
                   informação três vezes na mesma tela. */
                showDate={false}
                layout="empilhado"
              />
            ))}
          </AttendanceList>
        )}
      </Secao>
    </div>
  );
}
