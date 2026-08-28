import { Link } from "react-router-dom";
import {
  Aviso,
  ButtonLink,
  Dado,
  ListaDeDados,
  Painel,
  SECAO_LINK_CLASS,
  Secao,
  SkeletonLista,
  StatusAtendimento,
  Vazio,
} from "../../components/ui";
import { AttendanceList, AttendanceRow } from "../../components/shared/AttendanceRow";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { ATTENDANCE_TYPE_LABEL } from "../../constants/attendance";
import { DE_INICIO } from "../../constants/origem";
import { caregiverEarnings, todayISO } from "../../services/attendances";
import { caregiverInvitations } from "../../services/invitations";
import { formatCurrency } from "../../utils/format";
import { rotuloDoDia } from "../../utils/date";
import { PAGE_WORK, WORK_ASIDE, WORK_GRID } from "../../components/layout/page";

/**
 * Quantos plantões a Agenda do Início mostra antes de mandar para a agenda completa.
 *
 * É a regra de teto da `<Secao>` (design system, seção 7): N linhas no corpo e uma saída no
 * cabeçalho para a tela onde a lista inteira mora. A contagem do rótulo continua sendo a **real** —
 * se o cuidador tem doze plantões à frente, o cabeçalho diz doze e o "Ver tudo" leva aos sete que
 * não couberam. Contagem que reflete o corte em vez do total transforma o número em enfeite: ele
 * deixa de responder "quanto trabalho eu tenho pela frente".
 */
const AGENDA_VISIVEL = 5;

/**
 * Valor de ganho como alvo de navegação.
 *
 * Cada linha do painel leva ao lugar onde aquele dinheiro vive — o que está por vir, na agenda; o
 * que fechou, no histórico. Sem isso, o painel volta a ser o bloco de números decorativos que ele
 * substituiu: a diferença entre um resumo e um placar é o resumo levar a algum lugar.
 *
 * A tinta é a do texto normal, não a da marca: dentro de uma lista de dados, dois valores em
 * petróleo puxariam mais atenção que o próximo atendimento ao lado, que é a manchete da tela. O
 * sublinhado no ponteiro e o alvo de 44px no dedo é que dizem que se clica — a mesma gramática do
 * `ROW_ACTION_CLASS`, um degrau mais baixo.
 */
const GANHO_LINK_CLASS =
  "inline-flex min-h-11 flex-col items-end justify-center gap-0.5 rounded-control underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-linha-strong active:text-accent pointer-fine:min-h-0";

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
  const restanteTotal = Math.max(upcoming.length - 1, 0);
  const restante = upcoming.slice(1, 1 + AGENDA_VISIVEL);
  const invitations = caregiverInvitations(state, session?.caregiverId);
  const ganhos = caregiverEarnings(mine);

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
        <Aviso
          tom="atencao"
          className="mt-5"
          acao={
            <ButtonLink to="/cuidador/convites" size="sm">
              Ver {invitations.length === 1 ? "convite" : "convites"}
            </ButtonLink>
          }
        >
          <span className="font-semibold">
            {invitations.length} {invitations.length === 1 ? "convite" : "convites"}
          </span>{" "}
          aguardando sua resposta.
        </Aviso>
      )}

      <div className={`mt-5 ${WORK_GRID}`}>
        <div className="flex min-w-0 flex-col gap-5">
          {/*
            O próximo atendimento é a tela inteira para quem está a caminho dele. Não é um card
            entre cards: é um painel com os dados operacionais em lista de definição — endereço,
            horário, duração, valor —, que é como se lê uma ordem de serviço.

            É também o **único** `<Painel>` da coluna, e isso agora é a hierarquia da tela. A
            Agenda logo abaixo perdeu a moldura (virou `<Secao>`) porque uma lista de plantões já
            se delimita sozinha pelos fios entre as linhas; sobrando só aqui, a superfície branca
            deixa de ser "mais uma caixa" e volta a significar "comece por isto".
          */}
          <Painel title="Próximo atendimento">
            {!next ? (
              <Vazio porte="linha">Nenhum atendimento à frente.</Vazio>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <div className="min-w-0">
                    <Link
                      to={`/cuidador/atendimentos/${next.id}`}
                      state={DE_INICIO}
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

                {/*
                  A ação principal da tela, e ela precisava sair do cabeçalho.

                  Era um "Abrir ficha" de 13px solto na faixa do painel: ~18px de altura clicável,
                  contra o piso de 44px da seção 11 — num link que o cuidador aperta de pé, na
                  porta do paciente, com o telefone numa mão. E é o caminho mais curto até o
                  check-in, ou seja, o alvo mais difícil da tela era também o mais usado dela.

                  `secondary` (tonal) e não `primary` porque quando há convite pendente o botão da
                  faixa acima é o primário: dois retângulos escuros na mesma tela deixam de ter
                  hierarquia entre si.
                */}
                <ButtonLink
                  to={`/cuidador/atendimentos/${next.id}`}
                  state={DE_INICIO}
                  variant="secondary"
                  size="sm"
                  className="mt-3.5 w-full sm:w-auto"
                >
                  Abrir ficha
                </ButtonLink>
              </>
            )}
          </Painel>

          {/*
            A Agenda é uma lista de registros — o caso exato do `<Secao>`: os fios entre as linhas
            e o alinhamento das colunas já delimitam o conjunto, então o que faltava era o nome da
            região, não uma parede em volta dela. Com a moldura, cinco plantões dentro de um painel
            com faixa de cabeçalho liam como *um card com um atendimento dentro*.

            A disposição é `empilhado` pelo mesmo motivo do Início da empresa: aqui são no máximo
            cinco registros, densidade não é o problema e legibilidade de relance é. É também o que
            faz o texto das linhas nascer na mesma margem do rótulo da seção — o `-mx-2` do
            `variant="fluxo"` compensa exatamente o `px-2` da linha empilhada.
          */}
          <Secao
            title="Agenda"
            count={restanteTotal || undefined}
            actions={
              restanteTotal > 0 && (
                <Link to="/cuidador/agenda" className={SECAO_LINK_CLASS}>
                  Ver tudo
                </Link>
              )
            }
          >
            {restante.length === 0 ? (
              <Vazio porte="solto">Nada além do próximo atendimento.</Vazio>
            ) : (
              <AttendanceList variant="fluxo">
                {restante.map((a) => (
                  <AttendanceRow
                    key={a.id}
                    layout="empilhado"
                    attendance={a}
                    to={`/cuidador/atendimentos/${a.id}`}
                    state={DE_INICIO}
                    patientName={patientName(a.patientId)}
                  />
                ))}
              </AttendanceList>
            )}
          </Secao>
        </div>

        {/*
          A coluna de apoio responde **quanto eu ganho**, que era a pergunta que esta tela não
          respondia em lugar nenhum. O valor aparecia plantão a plantão e nunca somado.

          Ela substituiu um bloco de três números que não sobreviveram à análise:

          - *Avaliação* saiu porque o cuidador não avalia mais ninguém e a nota que ele recebe é
            leitura de ficha, não manchete de Início.
          - *Horas realizadas* saiu por duplicar a linha vizinha: com plantões padronizados de 12h
            e 24h, "12h realizadas" e "1 atendimento concluído" são o mesmo fato em duas unidades.
            E era soma vitalícia, sem período — um número sem denominador não responde nada.
          - *Atendimentos concluídos* virou a segunda linha daqui, agora com destino: a contagem
            existia sem ter para onde levar.

          As duas linhas são recortes de tempo opostos e cada uma leva ao lugar onde ela vive: o
          que vem à frente, para a agenda; o que fechou, para o histórico. É relatório, não
          pagamento (CLAUDE.md §36) — a regra e a conta moram em `caregiverEarnings`.

          Painel `quieto`: a moldura de 1px fica, o preenchimento branco e a faixa do cabeçalho
          saem. É o mesmo tratamento do painel de Pendências no Início da empresa, e pela mesma
          razão — coluna de apoio precisa estar à vista, não precisa competir com o painel do
          próximo atendimento ao lado. Com `WORK_ASIDE` ela também acompanha a rolagem no desktop.
        */}
        <Painel title="Seus ganhos" variant="quieto" className={WORK_ASIDE}>
          <ListaDeDados>
            <Dado termo="A receber">
              {ganhos.aReceberCount === 0 ? (
                <span className="text-ink-subtle">Nenhum plantão confirmado</span>
              ) : (
                <Link to="/cuidador/agenda" className={GANHO_LINK_CLASS}>
                  <span className="numero">{formatCurrency(ganhos.aReceberValor)}</span>
                  <span className="text-meta text-ink-subtle">
                    <span className="numero">{ganhos.aReceberCount}</span>{" "}
                    {ganhos.aReceberCount === 1 ? "plantão" : "plantões"}
                  </span>
                </Link>
              )}
            </Dado>
            <Dado termo="Concluído no mês">
              {ganhos.mesCount === 0 ? (
                <span className="text-ink-subtle">Nenhum plantão encerrado</span>
              ) : (
                <Link to="/cuidador/atendimentos" className={GANHO_LINK_CLASS}>
                  <span className="numero">{formatCurrency(ganhos.mesValor)}</span>
                  <span className="text-meta text-ink-subtle">
                    <span className="numero">{ganhos.mesCount}</span>{" "}
                    {ganhos.mesCount === 1 ? "plantão" : "plantões"}
                  </span>
                </Link>
              )}
            </Dado>
          </ListaDeDados>
        </Painel>
      </div>
    </div>
  );
}
