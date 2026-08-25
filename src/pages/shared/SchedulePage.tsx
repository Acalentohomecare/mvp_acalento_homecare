import { Fragment, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Select, SkeletonLista, Tabs, Vazio, type Aba } from "../../components/ui";
import {
  AttendanceGroupHeader,
  AttendanceList,
  AttendanceRow,
} from "../../components/shared/AttendanceRow";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { companyAttendances, scheduleDays, todayISO } from "../../services/attendances";
import { rosterCaregivers } from "../../services/roster";
import { intervaloCurto, rotuloDoDia } from "../../utils/date";
import { PAGE_LIST } from "../../components/layout/page";

/*
 * A escala é **planejamento** — por dia, com o cabeçalho do dia grudado no topo. O registro (a
 * lista inteira, com busca por paciente e intervalo de datas) mora em Atendimentos, dos dois lados
 * do produto. A divisão está escrita em `caregiver/AttendancesPage`, e é ela que mantém esta tela
 * com uma pergunta só: *quem cobre qual dia*.
 *
 * Por isso aqui não há busca por texto, nem filtro de estado, nem campos De/Até — pedi-los é pedir
 * a tela de Atendimentos de novo. O que faltava não era filtro: era a escala **andar**.
 */

/** Recorte de leitura, não período fixo: um dia por vez, ou a semana rolante a partir da âncora. */
type Zoom = "1" | "7";

/**
 * Data local ao meio-dia.
 *
 * `scheduleDays` deriva cada dia com `setDate`/`getDate`, e uma data criada à meia-noite escorrega
 * de fuso — a mesma armadilha que `rotuloDoDia` e `diaDaSemana` evitam do outro lado. A regra do
 * produto é uma só: data daqui é lida no fuso de quem lê.
 */
function meioDia(iso: string): Date {
  return new Date(`${iso}T12:00`);
}

function moverDias(iso: string, dias: number): string {
  const d = meioDia(iso);
  d.setDate(d.getDate() + dias);
  return todayISO(d);
}

/**
 * Seta de período: **alvo de 44px, desenho de 24px.**
 *
 * É a técnica da seção 11 do design system, a mesma do fechar do `<Modal>` — `size-11` com
 * `-mx-2.5` devolvendo a folga ao layout. Sem ela o dilema é escolher entre uma seta discreta que
 * não se acerta com o polegar e um botão emoldurado que rouba a atenção da data; com ela, o ícone
 * encosta na data e continua com o alvo inteiro por baixo.
 *
 * Sem borda e sem fundo em repouso, ao contrário do `variant="ghost"`: dois retângulos brancos
 * cercando o rótulo transformariam o grupo em três caixas, que é o oposto do que ele deve ser.
 * O hover pinta o fundo e a tinta sobe para `--ink` — a resposta aparece quando é pedida.
 *
 * No ponteiro o alvo encolhe junto com a margem (`size-8` / `-mx-1`), e é preciso mexer nas duas:
 * a margem de 10px foi calculada contra uma caixa de 44px, e sobre uma de 32px ela comeria mais da
 * metade do botão — o ícone passaria a encostar no texto sem folga nenhuma.
 */
const SETA_CLASSE =
  "-mx-2.5 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink-subtle transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-ink active:text-accent pointer-fine:-mx-1 pointer-fine:size-8";

export function SchedulePage() {
  const { session } = useSession();
  const { state } = useAppState();
  const [searchParams] = useSearchParams();

  /*
   * O recorte abre em "Dia" por `?periodo=1` — é assim que chega quem clicou em "Ver o dia" na
   * seção "Atendimentos de hoje" do Início. Só o valor inicial vem da URL: ninguém lê esse
   * parâmetro depois da montagem, e sincronizar de volta só faria sentido se a escala precisasse
   * ser compartilhável por link, o que não é pedido aqui.
   */
  const [zoom, setZoom] = useState<Zoom>(searchParams.get("periodo") === "1" ? "1" : "7");

  /*
   * A âncora é o que faltava. A escala estava presa em `new Date()`: dois recortes, sempre a
   * partir de hoje, sempre para frente — o que significa que a coordenadora não conseguia montar a
   * escala da semana que vem, que é o trabalho dela. No oitavo dia a tela simplesmente acabava.
   *
   * Andar para trás vem junto, de graça, e **não** transforma isto num histórico: continua sendo a
   * mesma leitura por dia, com o mesmo agrupamento. Histórico com busca e estado é Atendimentos.
   */
  const [ancora, setAncora] = useState(() => todayISO());

  /*
   * O recorte por pessoa que faltava **do lado do planejamento**.
   *
   * Relatórios já filtra por cuidador, mas responde outra pergunta: quantas horas ela fez e quanto
   * custou num período — retrospectivo, somado, sem dia. Atendimentos não filtra por cuidador de
   * jeito nenhum: a busca casa só nome de paciente, e o rótulo do campo diz isso.
   *
   * O que nenhuma das duas responde é *em que dias a Sandra está escalada*, que é a pergunta de
   * quem monta escala: serve para ver quem está sobrecarregado e, com os dias vazios à mostra,
   * quem está livre no sábado.
   *
   * Só do lado empresa: o cuidador já enxerga apenas os próprios plantões.
   */
  const [cuidadorId, setCuidadorId] = useState("");

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

  const recorte = cuidadorId ? list.filter((a) => a.confirmedCaregiverId === cuidadorId) : list;

  const hojeISO = todayISO();
  const dias = Number(zoom);
  const days = scheduleDays(recorte, meioDia(ancora), dias);
  const total = days.reduce((sum, d) => sum + d.items.length, 0);
  const base = isCompany ? "/empresa/atendimentos" : "/cuidador/atendimentos";

  const quadro = isCompany ? rosterCaregivers(state, session?.companyId) : [];
  const nomeCuidador = cuidadorId
    ? state.caregivers.find((c) => c.id === cuidadorId)?.name
    : undefined;

  /* As contagens acompanham a âncora, não o dia de hoje: aba que promete o que existe noutra
     semana é pior do que aba sem contagem nenhuma. */
  const contar = (n: number) =>
    scheduleDays(recorte, meioDia(ancora), n).reduce((s, d) => s + d.items.length, 0);

  const abas: Aba<Zoom>[] = [
    { key: "1", label: "Dia", count: contar(1) },
    { key: "7", label: "Semana", count: contar(7) },
  ];

  /* "Hoje"/"Amanhã" no recorte de um dia, intervalo no de semana — a mesma leitura que o cabeçalho
     de grupo faz lá embaixo, para o controle e a lista não se contradizerem. */
  const rotuloPeriodo =
    zoom === "1"
      ? rotuloDoDia(days[0].date)
      : intervaloCurto(days[0].date, days[days.length - 1].date);

  const resumo = nomeCuidador
    ? total === 0
      ? `${nomeCuidador} não tem plantão neste período.`
      : `${nomeCuidador} tem ${total} ${total === 1 ? "plantão" : "plantões"} neste período.`
    : total === 0
      ? "Nenhum atendimento no período."
      : `${total} ${total === 1 ? "atendimento" : "atendimentos"} no período.`;

  return (
    <div className={PAGE_LIST}>
      <h1 className="text-display">{titulo}</h1>
      <p className="prosa mt-1 text-body text-ink-subtle">{resumo}</p>

      {/*
        Controles acima das abas, abas coladas na lista — a mesma ordem de Atendimentos.

        **A navegação vem primeiro, e à esquerda.** Ela era o bloco empurrado para a direita com
        `ml-auto`, com o filtro na outra ponta: duas ilhas separadas por um vão que não dizia nada,
        e o filtro ocupando a posição que o olho lê primeiro. Nesta faixa o assunto é *que período
        estou olhando*; o cuidador é um recorte disso, e recorte vem depois do que ele recorta.

        **A distância conta a hierarquia.** Zero dentro do grupo de setas, 8px até o "Hoje" (outra
        ação, mesmo assunto), 20px até o filtro (outro assunto). Vão uniforme entre os três faria
        três controles soltos, que é exatamente como a faixa estava lendo.

        As abas **não** entram nesta linha: `<Tabs>` é full-bleed no celular (`-mx-6 … px-6`) e a
        borda inferior dele corre até a margem da página, que é o que amarra a fila ao conteúdo
        abaixo. Como item de um flex ele encolhe para o próprio conteúdo, e essa borda vira um
        risco solto no meio da tela.

        `items-center`, e não `items-end`: sem rótulo em cima do filtro, os dois controles são
        caixas de uma linha só e alinham pelo meio.
      */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2">
          {/*
            Setas e data são **um grupo só**, e o que os agrupa não é moldura nem fundo: é o vão.

            A largura mínima do rótulo é o que dava a folga que sobrava — ela existe para as setas
            não dançarem quando o texto troca, mas dimensionada para o rótulo mais longo ela
            afastava as setas em vinte e poucos pixels no mais curto. Agora o piso acompanha o
            recorte: a semana escreve "25–31 Ago", o dia escreve "Hoje". Nos dois casos o piso fica
            logo abaixo do rótulo típico, então ele segura o pior caso sem inflar o comum.
          */}
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Período anterior"
              onClick={() => setAncora((a) => moverDias(a, -dias))}
              className={SETA_CLASSE}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            {/*
              O foco do grupo. Peso 600 e tinta cheia contra o `--ink-subtle` das setas: a
              hierarquia é só de peso e tinta, sem caixa nenhuma.

              `tabular-nums` sem o `.numero`: o algarismo de mesma largura é o que impede o rótulo
              de respirar quando "1–7 Set" vira "25–31 Ago", mas o utilitário completo traz peso
              500 e tracking apertado, e aqui o peso é 600 e metade do rótulo é palavra.
            */}
            <span
              className={`px-1 text-center text-note font-semibold text-ink tabular-nums whitespace-nowrap ${
                zoom === "7" ? "min-w-[5rem]" : "min-w-[3.5rem]"
              }`}
            >
              {rotuloPeriodo}
            </span>
            <button
              type="button"
              aria-label="Próximo período"
              onClick={() => setAncora((a) => moverDias(a, dias))}
              className={SETA_CLASSE}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>

          {/*
            Tonal, não emoldurado: `secondary` é o petróleo diluído sobre `--accent-soft`, sem
            borda — recua ao lado da data e continua lendo como botão.

            **Sem `disabled`.** Ele nascia desabilitado, porque a tela abre com a âncora em hoje —
            ou seja, o estado normal do botão era o apagado, e `disabled:opacity-45` sobre um tom
            já claro lia como controle quebrado. Voltar para hoje estando em hoje não é erro nem
            operação inválida: é um clique que não muda nada, e é assim que toda agenda trata o
            próprio "hoje". O botão fica vivo, com o contraste inteiro do teal sobre o teal
            diluído, e a faixa deixa de abrir com um elemento de aparência morta.
          */}
          <Button variant="secondary" size="sm" onClick={() => setAncora(hojeISO)}>
            Hoje
          </Button>
        </div>

        {isCompany && (
          /*
            O filtro recua: `variant="filtro"` tira o branco e a borda de 1,5px do campo de
            formulário. O rótulo visível saiu junto — ele empilhava 24px em cima do controle e
            fazia um recorte de lista parecer um campo de cadastro no meio de uma faixa de
            navegação. `aria-label` mantém o nome para quem lê por leitor de tela.
          */
          <div className="w-full sm:w-[13rem]">
            <Select
              variant="filtro"
              aria-label="Filtrar a escala por cuidador"
              value={cuidadorId}
              onChange={(e) => setCuidadorId(e.target.value)}
            >
              <option value="">Todos do quadro</option>
              {quadro.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <Tabs
        abas={abas}
        atual={zoom}
        onChange={setZoom}
        label="Escala por dia ou por semana"
        className="mt-4"
      />

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
                {/* Dia vazio continua aparecendo, e sob filtro de cuidador ele é o próprio
                    resultado: é assim que se enxerga quem está livre no sábado. */}
                <Vazio porte="linha">
                  {nomeCuidador
                    ? `${nomeCuidador} está livre neste dia.`
                    : "Nenhum atendimento neste dia."}
                </Vazio>
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
