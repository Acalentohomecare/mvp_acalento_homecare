import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ButtonLink,
  LinhaDoTempo,
  PRODUTO_NOME,
  Painel,
  PontoNivel,
  SECAO_LINK_CLASS,
  Secao,
  SkeletonLista,
  Vazio,
  type EventoLinhaDoTempo,
} from "../../components/ui";
import { AttendanceList, AttendanceRow } from "../../components/shared/AttendanceRow";
import { AttendanceOpenActions } from "../../components/shared/AttendanceOpenActions";
import { DE_INICIO } from "../../constants/origem";
import { rosterQueue } from "../../services/roster";
import { awaitingByUrgency, compatibleCaregivers } from "../../services/matching";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  activeCaregiverIds,
  agruparPorSerie,
  applicationsToReview,
  awaitingCaregiverAttendances,
  companyAttendances,
  completedHours,
  draftAttendances,
  pendingCheckins,
  recentActivity,
  rotuloDaSerie,
  todayAttendances,
  upcomingAttendances,
  type RecentActivityKind,
} from "../../services/attendances";
import { companyPatients } from "../../services/patients";
import { carimbo } from "../../utils/date";
import { NIVEL_ORDEM, type Nivel } from "../../constants/nivel";
import { PAGE_WORK } from "../../components/layout/page";

/**
 * Pendência — o que espera uma decisão da coordenadora.
 *
 * O `nivel` é o da seção 3.2 do design system, e ele faz duas coisas ao mesmo tempo: decide a
 * tinta do ponto **e** a posição da linha na lista. Antes era um booleano `urgente`, e a cor
 * ficava solta — um check-in atrasado podia aparecer abaixo de um rascunho, com o vermelho no
 * meio da lista sem nada explicando por quê. Cor que não acompanha a ordem não é sinal, é
 * decoração.
 */
interface Pendencia {
  id: string;
  texto: string;
  para: string;
  nivel: Nivel;
}

/**
 * Quantas pendências a coluna mostra antes de dobrar o resto.
 *
 * A coluna acompanha a rolagem: se ela cresce até quinze linhas, deixa de caber na tela e o
 * "acompanha" vira "rola junto", que é exatamente o que ela existe para não fazer. Cinco cobre a
 * operação de um dia normal; o excedente continua a um clique.
 */
const PENDENCIAS_VISIVEIS = 5;

/**
 * Quantos atendimentos do dia o Início mostra antes de mandar para a escala.
 *
 * Foi a última das quatro seções a ganhar teto: nasceu com `today.map()` direto, sem corte e sem
 * saída no cabeçalho. No cenário inicial isso não aparece, porque só um plantão cai em
 * `isoDate(0)`; numa empresa que roda doze plantões no dia, a seção sozinha ocupa a tela antes de
 * "Em aberto" — a seção logo abaixo, onde estão as ações — chegar a aparecer. É a mesma falha que
 * `EM_ABERTO_VISIVEIS` já resolvia lá embaixo, acontecendo aqui em cima.
 *
 * Quatro, o mesmo de "Próximos" e não os três de "Em aberto", porque o teto é de altura de tela e
 * não de contagem. Nas camadas do `<AttendanceRow>`: aqui existem a 1 (hora · paciente · estado),
 * a 2 (tipo · duração · bairro · valor) e a 3 (situação) — o plantão em aberto acrescenta a 4
 * (recado de compatibilidade) e a 5 (barra de ações). A linha de hoje é ainda um degrau mais baixa
 * que a de "Próximos", que carrega a data (`showDate`); quatro cabe nas duas.
 */
const HOJE_VISIVEIS = 4;

/**
 * Quantos plantões em aberto o Início mostra antes de mandar para a tela de Atendimentos.
 *
 * "Em aberto" foi a primeira seção a ganhar teto, e é a que tem a linha mais alta do produto: cinco
 * camadas (hora, paciente, situação, recado e duas ações) contra as três de "Próximos". Com seis
 * plantões abertos ela sozinha passava de 800px no celular e empurrava Próximos e Atividade
 * recente para fora de qualquer relance — o Início deixava de ser um resumo da operação e virava
 * a lista de "Em aberto" com apêndices.
 *
 * Três, e não os quatro de "Próximos", pela mesma aritmética ao contrário: a linha é quase o
 * dobro da altura, então o mesmo espaço de tela cabe menos registro. O que passa disso continua
 * a um toque no "Ver todos" do cabeçalho, que leva à tela já filtrada — e lá existem busca,
 * intervalo de datas e a linha densa, que é onde essa leitura deve acontecer.
 */
const EM_ABERTO_VISIVEIS = 3;

/*
 * A tinta do marcador de cada evento na linha do tempo — três tons, e nada além disso.
 *
 * `neutro` para a rotina (atendimento criado, que é o evento mais comum da lista), `feito` para a
 * operação que andou (check-in, conclusão) e `caiu` para o cancelamento. Histórico não é semáforo:
 * se cada tipo de evento ganhasse a sua cor, a coluna viraria uma escala cromática que ninguém
 * lê de cor — e a única coisa que precisa saltar ali é o que deu errado.
 */
const TOM_ATIVIDADE: Record<RecentActivityKind, EventoLinhaDoTempo["tom"]> = {
  criado: "neutro",
  checkin: "feito",
  concluido: "feito",
  cancelado: "caiu",
};

export function CompanyDashboardPage() {
  const { session } = useSession();
  const { state } = useAppState();
  const [verTodas, setVerTodas] = useState(false);

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
  /* Ordem por urgência real, não por data: o plantão que nenhum cuidador do quadro pode assumir
     sobe para o topo, porque a saída dele é aprovar alguém para o quadro — outra tela e um prazo
     bem maior que o de enviar convite. A regra mora em `services/matching`. */
  const awaiting = awaitingByUrgency(state, awaitingCaregiverAttendances(all));
  const upcoming = upcomingAttendances(all);
  const drafts = draftAttendances(all);
  const toReview = applicationsToReview(all);
  const lateCheckins = pendingCheckins(all);
  const activity = recentActivity(all, patients);
  const awaitingApproval = rosterQueue(state, session?.companyId);
  const activeCount = activeCaregiverIds(all).length;

  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "Paciente";
  const caregiverName = (id?: string) =>
    id ? state.caregivers.find((c) => c.id === id)?.name : undefined;

  /*
   * Só entra aqui o que espera uma decisão **sobre a operação**: fila do quadro, check-in que não
   * veio, candidatura sem resposta, rascunho parado. Cada linha nasce de um dado do estado e leva
   * à tela onde a decisão é tomada.
   *
   * O que saiu foi a coleção `dashboardAlerts` — avisos escritos à mão no mock ("revisão
   * trimestral de contratos vence nesta semana", "nenhum cuidador favoritado ainda"). Eles não
   * derivavam de nada, ninguém podia resolvê-los dentro do produto, e ocupavam duas das seis
   * linhas da coluna no cenário inicial. Recado administrativo dividindo lista com check-in
   * atrasado é o que faz o vermelho parar de significar alguma coisa: quando metade da coluna
   * nunca vai sair de lá, a coordenadora aprende a não olhar para ela.
   *
   * O tipo, o mock e o campo do `AppState` saíram junto — nada mais os lia.
   */
  const pendencias: Pendencia[] = [
    ...(awaitingApproval.length > 0
      ? [
          {
            id: "roster",
            texto: `${awaitingApproval.length} cuidador(es) aguardando aprovação para o quadro`,
            para: "/empresa/cuidadores",
            nivel: "atencao" as const,
          },
        ]
      : []),
    // Atrasado é o único nível crítico daqui: o plantão começou e ninguém registrou chegada.
    ...lateCheckins.map((a) => ({
      id: `chk-${a.id}`,
      texto: `Check-in pendente — ${patientName(a.patientId)}, ${a.startTime}`,
      para: `/empresa/atendimentos/${a.id}`,
      nivel: "critico" as const,
    })),
    ...toReview.map((a) => ({
      id: `app-${a.id}`,
      texto: `Candidaturas aguardando decisão — ${patientName(a.patientId)}`,
      para: `/empresa/atendimentos/${a.id}/candidaturas`,
      nivel: "atencao" as const,
    })),
    // Rascunho não trava ninguém hoje: é lembrete, não decisão vencendo.
    ...drafts.map((a) => ({
      id: `dft-${a.id}`,
      texto: `Rascunho não publicado — ${patientName(a.patientId)}`,
      para: `/empresa/atendimentos/${a.id}`,
      nivel: "informacao" as const,
    })),
  ].sort((a, b) => NIVEL_ORDEM[a.nivel] - NIVEL_ORDEM[b.nivel]);

  const pendenciasVisiveis = verTodas ? pendencias : pendencias.slice(0, PENDENCIAS_VISIVEIS);
  const pendenciasOcultas = pendencias.length - pendenciasVisiveis.length;

  /* Toda entrada daqui nasce de um atendimento, então toda entrada tem para onde levar: a linha
     inteira abre a ficha do plantão que a gerou. Sem isso, "Check-in registrado em Antônio
     Ferreira" é uma notícia que obriga a procurar o atendimento na mão, na tela ao lado. */
  const eventos: EventoLinhaDoTempo[] = activity.map((entry) => ({
    id: entry.id,
    evento: entry.text,
    contexto: entry.detail,
    quando: carimbo(entry.at),
    tom: TOM_ATIVIDADE[entry.kind],
    para: `/empresa/atendimentos/${entry.attendanceId}`,
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
              {awaiting.length} em aberto
            </Link>{" "}
            aguardando cuidador
          </>
        ) : (
          " — nenhum atendimento em aberto no momento"
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
        {/*
          Painel `quieto`: a moldura fica, o preenchimento branco sai. Pendência é coluna de
          apoio — ela precisa estar sempre à vista, não precisa competir com a fila de plantões
          ao lado. Sem os divisores e sem a faixa do cabeçalho, dez linhas param de parecer dez
          caixas empilhadas e voltam a parecer uma lista.
        */}
        <Painel
          title="Pendências"
          count={pendencias.length}
          flush
          variant="quieto"
          className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1"
        >
          {pendencias.length === 0 ? (
            <Vazio porte="linha">
              <PontoNivel nivel="sucesso" className="mr-2 inline-block align-middle" />
              Nada pendente no momento.
            </Vazio>
          ) : (
            /* Cada pendência é uma linha clicável que leva ao lugar onde a decisão é tomada. Eram
               itens de lista com borda e sombra que não levavam a lugar nenhum: a coordenadora
               lia "Candidaturas aguardando decisão" e precisava procurar o atendimento na mão. */
            <>
              <ul className="px-1 pb-1">
                {pendenciasVisiveis.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={p.para}
                      state={DE_INICIO}
                      className="flex min-h-11 items-start gap-2 rounded-control px-2 py-2 text-note text-ink-muted transition-colors duration-150 ease-out hover:bg-surface-sunken/60 hover:text-ink pointer-fine:min-h-0 pointer-fine:py-1.5"
                    >
                      <PontoNivel nivel={p.nivel} className="mt-2" />
                      <span className="min-w-0">{p.texto}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {pendencias.length > PENDENCIAS_VISIVEIS && (
                <button
                  type="button"
                  onClick={() => setVerTodas((v) => !v)}
                  className="flex min-h-11 w-full items-center gap-1 px-3 pb-2 text-meta text-ink-subtle transition-colors duration-150 ease-out hover:text-ink pointer-fine:min-h-8"
                >
                  <ChevronDown
                    size={13}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ease-out ${verTodas ? "rotate-180" : ""}`}
                  />
                  {verTodas
                    ? "Mostrar menos"
                    : `mais ${pendenciasOcultas} ${pendenciasOcultas === 1 ? "pendência" : "pendências"}`}
                </button>
              )}
            </>
          )}
        </Painel>

        <div className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-1">
          {/*
            Hoje, Em aberto e Próximos são as três leituras da escala — o que acontece agora, o
            que falta resolver, o que vem à frente —, e as três saíram da moldura. Um painel
            anuncia "aqui começa uma caixa" antes de deixar ler o que interessa; empilhados, quatro
            painéis somavam quatro bordas, quatro faixas de cabeçalho e quatro fundos brancos entre
            a coordenadora e uma dúzia de plantões — e "Atendimentos de hoje", com três linhas
            dentro de uma caixa grande, lia como *um card contendo um atendimento* em vez de *a
            lista do dia*. A lista de plantões já se delimita sozinha: os fios entre as linhas e o
            alinhamento das colunas fazem esse trabalho. O que faltava era só o nome da região, que
            é o `<Secao>`.

            Sem moldura, o que separa uma seção da outra é o rótulo em versalete e o espaço — e é
            por isso que as três precisavam mudar juntas: uma caixa sobrando no meio de listas
            soltas não lê como "esta é diferente", lê como sobra.

            O que faltava depois disso era hierarquia **dentro** da coluna: com os quatro rótulos
            no mesmo cinza, "Atendimentos de hoje" e "Em aberto" chegavam com o mesmo peso de
            "Atividade recente", que é histórico. Numa tela que a coordenadora abre para saber o
            que fazer agora, isso é hierarquia invertida.

            A correção é de tinta, e só de tinta: as duas seções operacionais usam
            `variant="destaque"` (rótulo em `--ink`, contagem em `--ink-muted`); contexto e
            histórico ficam no `padrao`. Dar a elas uma superfície própria — fundo branco, moldura
            de 1px, canto arredondado — foi tentado e desfeito na revisão 18: mesmo sem sombra, e
            mesmo sendo uma caixa por região e não por registro, lia como card, e duas delas no
            topo desta coluna reconstroem a pilha de painéis que a revisão 15 desmontou.

            A disposição muda junto: aqui são três ou quatro registros por seção, não trinta.
            Densidade deixa de ser o problema e legibilidade de relance passa a ser — daí o
            `empilhado`, com hora e estado na primeira linha e alvo de toque folgado.

            Sem atendimento hoje a seção inteira some: a frase de abertura já disse "Nenhum
            atendimento hoje", e repeti-la num vazio custa altura no topo da tela mais usada do
            produto. Vazio só se justifica quando o vazio é notícia; aqui a notícia já foi dada.
          */}
          {today.length > 0 && (
            <Secao
              title="Atendimentos de hoje"
              count={today.length}
              variant="destaque"
              /* A saída leva à escala já na aba "Hoje" (`?periodo=1`), e não à lista de
                 Atendimentos: quem clica aqui quer o resto **do dia**, não o filtro de estado. */
              actions={
                today.length > HOJE_VISIVEIS && (
                  <Link to="/empresa/agenda?periodo=1" className={SECAO_LINK_CLASS}>
                    Ver o dia
                  </Link>
                )
              }
            >
              <AttendanceList variant="fluxo">
                {today.slice(0, HOJE_VISIVEIS).map((a) => (
                  <AttendanceRow
                    key={a.id}
                    layout="empilhado"
                    attendance={a}
                    to={`/empresa/atendimentos/${a.id}`}
                    state={DE_INICIO}
                    patientName={patientName(a.patientId)}
                    caregiverName={caregiverName(a.confirmedCaregiverId)}
                    caregiverId={a.confirmedCaregiverId}
                    showDate={false}
                  />
                ))}
              </AttendanceList>
            </Secao>
          )}

          <Secao
            title="Em aberto"
            count={awaiting.length}
            variant="destaque"
            actions={
              awaiting.length > 0 && (
                <Link
                  to="/empresa/atendimentos?filtro=awaiting"
                  className={SECAO_LINK_CLASS}
                >
                  Ver todos
                </Link>
              )
            }
          >
            {awaiting.length === 0 ? (
              <Vazio porte="solto">Nenhum atendimento aguardando cuidador.</Vazio>
            ) : (
              <AttendanceList variant="fluxo">
                {/* Agrupado por escala: a fila do Início é de **decisões**, e uma escala de
                    sessenta dias é uma decisão só. Sem isso, as três linhas visíveis da seção
                    seriam três dias da mesma contratação e o resto da operação sumiria. */}
                {agruparPorSerie(awaiting)
                  .slice(0, EM_ABERTO_VISIVEIS)
                  .map((linha) => {
                  const serie = linha.tipo === "serie" ? linha.serie : null;
                  const a = linha.tipo === "serie" ? linha.serie.representante : linha.atendimento;
                  const compatible = compatibleCaregivers(state, a).length;
                  const applications = state.applications.filter(
                    (ap) => ap.attendanceId === a.id,
                  ).length;
                  return (
                    <AttendanceRow
                      key={a.id}
                      layout="empilhado"
                      attendance={a}
                      to={`/empresa/atendimentos/${a.id}`}
                      state={DE_INICIO}
                      patientName={patientName(a.patientId)}
                      caregiverName={caregiverName(a.confirmedCaregiverId)}
                      caregiverId={a.confirmedCaregiverId}
                      /*
                        Camada 4 — o que já se sabe sobre a busca. A frase era "1 compatível no
                        quadro": um adjetivo sem substantivo, encostado numa contagem, e quem lê
                        precisa completar sozinho *compatível o quê*. Dizer "1 cuidador compatível
                        no quadro" custa uma palavra e devolve a frase inteira.

                        A tinta padrão da camada é neutra (a linha aplica `--ink-subtle`) porque
                        informação complementar não deve competir com as ações logo abaixo. O zero
                        é a exceção que se paga: quando **nenhum** cuidador do quadro pode assumir
                        o plantão, o dado deixou de ser contexto e virou o problema — buscar
                        cuidadores não vai resolver, aprovar alguém para o quadro vai.
                      */
                      note={
                        <>
                          {compatible === 0 ? (
                            <span className="text-status-cancelado">
                              Nenhum cuidador compatível no quadro
                            </span>
                          ) : (
                            <>
                              <span className="numero">{compatible}</span>{" "}
                              {compatible === 1 ? "cuidador compatível" : "cuidadores compatíveis"}{" "}
                              no quadro
                            </>
                          )}
                          {/* Na escala, o que está em aberto não é este dia — é a contratação
                              inteira. Sem dizer isso, a linha promete um plantão de terça e
                              esconde os outros quarenta e um. */}
                          {serie && <> · {rotuloDaSerie(serie, true)}</>}
                        </>
                      }
                      actions={
                        <AttendanceOpenActions attendance={a} applicationsCount={applications} />
                      }
                    />
                  );
                })}
              </AttendanceList>
            )}
          </Secao>

          <Secao
            title="Próximos"
            count={upcoming.length}
            actions={
              upcoming.length > 4 && (
                <Link
                  to="/empresa/agenda"
                  className={SECAO_LINK_CLASS}
                >
                  Ver escala
                </Link>
              )
            }
          >
            {upcoming.length === 0 ? (
              <Vazio porte="solto">Nenhum atendimento confirmado à frente.</Vazio>
            ) : (
              <AttendanceList variant="fluxo">
                {upcoming.slice(0, 4).map((a) => (
                  <AttendanceRow
                    key={a.id}
                    layout="empilhado"
                    attendance={a}
                    to={`/empresa/atendimentos/${a.id}`}
                    state={DE_INICIO}
                    patientName={patientName(a.patientId)}
                    caregiverName={caregiverName(a.confirmedCaregiverId)}
                    caregiverId={a.confirmedCaregiverId}
                  />
                ))}
              </AttendanceList>
            )}
          </Secao>

          {/*
            Fim da leitura da operação: hoje → em aberto → à frente → o que acabou de acontecer.

            A última moldura da coluna caiu junto com as outras três (revisão 16). Um `<Painel>`
            com faixa de cabeçalho em volta de seis eventos lia como *um card de notificações do
            dashboard*; o que a seção é, de fato, é o **histórico da operação** — e histórico se
            apresenta como documento, com um rótulo em cima e a cronologia embaixo. O fio da linha
            do tempo já delimita a região melhor do que uma borda faria.
          */}
          <Secao title="Atividade recente">
            {eventos.length === 0 ? (
              <Vazio porte="solto">Sem movimentação registrada.</Vazio>
            ) : (
              <LinhaDoTempo eventos={eventos} state={DE_INICIO} />
            )}
          </Secao>
        </div>
      </div>
    </div>
  );
}
