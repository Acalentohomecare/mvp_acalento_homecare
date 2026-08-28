import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { StatusAtendimento } from "../ui/StatusAtendimento";
import {
  ATTENDANCE_SITUATION,
  ATTENDANCE_STATUS_TINT,
  ATTENDANCE_TYPE_SHORT,
} from "../../constants/attendance";
import { formatCurrency } from "../../utils/format";
import { diaMes } from "../../utils/date";
import type { Attendance } from "../../types";
import type { EstadoDeOrigem } from "../../constants/origem";

/*
 * A linha de registro do atendimento (docs/DESIGN_SYSTEM.md, seção 9.0).
 *
 * Substitui o `<AttendanceCard>`, e a troca é estrutural, não de estilo. O card punha cada plantão
 * numa caixa com borda, raio de 14px e sombra; quinze plantões viravam quinze objetos flutuando
 * sobre a página, ~150px cada, e a coordenadora precisava **ler** um por um porque nenhum dado
 * ficava na mesma posição de uma caixa para a outra.
 *
 * A linha resolve as duas coisas de uma vez: cada informação tem **coluna fixa**, então a leitura
 * vira varredura vertical — a coluna de horários alinha, a de valores alinha, a de estados alinha.
 *
 * ------------------------------------------------------------------ as cinco camadas
 *
 * Um plantão em aberto carrega mais do que os próprios dados: carrega o que a operação está
 * esperando, o que já se sabe sobre a busca e o que dá para fazer a respeito. Antes isso chegava
 * embaralhado — o recado ("1 compatível no quadro") e as ações ("Buscar cuidadores",
 * "Candidaturas") dividiam uma linha só, separados por um vão de 12px, e a informação parecia um
 * link que não clicava enquanto os links pareciam continuação da frase.
 *
 * Agora cada coisa é uma camada, e a ordem é a de quem lê:
 *
 *   1  principal      hora · paciente · **estado**       o que é e em que pé está
 *   2  contexto       tipo · duração · bairro · valor    que trabalho é, quanto vale
 *   3  operacional    "Aguardando cuidador"              o que a operação está esperando
 *   4  complementar   "1 cuidador compatível no quadro"  o que já se sabe
 *   5  ação           Buscar cuidadores · Candidaturas   o que dá para fazer daqui
 *
 * As camadas 3, 4 e 5 só existem quando há o que dizer, e cada uma tem a sua linha: empilhadas,
 * elas param de disputar a mesma faixa horizontal e o olho desce em degraus. A distinção entre a
 * 3 e a 5 é a que mais importava — situação é **estado do mundo**, ação é **coisa que se clica**,
 * e as duas moravam lado a lado, na mesma faixa, com pesos parecidos.
 *
 * Cada camada tem um recurso tipográfico próprio, e nenhum deles é só cor (regra 3 do design
 * system):
 *
 *   1  `text-note` 600 em `--ink`, mais o marcador de forma do estado
 *   2  `text-meta` em `--ink-subtle`, e o valor tabular à direita
 *   3  `text-note` 500 na tinta do estado que espera — peso, não pastilha
 *   4  `text-meta` em `--ink-subtle`, neutra de propósito: não compete com a ação abaixo
 *   5  `ROW_ACTION_CLASS` — tinta da marca, sublinhado no ponteiro, separadas por ponto médio
 *
 * ------------------------------------------------------------------ as duas disposições
 *
 * O mesmo componente, o mesmo DOM e a mesma hierarquia servem dois trabalhos diferentes, e o que
 * os separa é **quantos registros a pessoa vai varrer de uma vez**:
 *
 * `denso` — a escala inteira: Atendimentos e a Escala da empresa. Trinta plantões numa tela, e o
 *   que importa é caber. No desktop tudo entra numa faixa de ~56px, cinco colunas.
 *
 * `empilhado` — o recorte curto: os plantões de hoje no Início, os que esperam cuidador, e o dia
 *   escolhido na agenda do cuidador. São um a quatro registros, e ali densidade não é o problema —
 *   legibilidade de relance é. Cada informação ganha a sua linha, o dedo tem alvo folgado e a
 *   leitura desce em vez de atravessar.
 *
 * Não são dois componentes porque não são duas hierarquias: paciente continua sendo o dado
 * principal, hora continua sendo a âncora, valor e estado continuam encostados à direita. O que
 * muda é só **em que célula da grade cada um cai**.
 *
 * O horário fica numa coluna própria, à esquerda de tudo, porque numa escala **quando** é a
 * primeira pergunta — antes até de quem. É o que uma escala impressa sempre fez. No celular, onde
 * não há largura para uma calha, ele sobe para o topo do registro e leva o estado a reboque: a
 * primeira linha responde *quando* e *como está*, que é a leitura de um turno.
 *
 * ---------------------------------------------------------------------- os ícones
 *
 * Não há nenhum. A versão anterior abria cada dado com um ícone de 12px — calendário, relógio,
 * alfinete, bonequinho — na sequência de data, hora, local e cuidador. Nenhum deles acelerava
 * reconhecimento: a data já se reconhece por ser data, e quatro ícones cinzas na mesma linha
 * viram textura. O que separa os dados agora é **posição de coluna**, que é o que uma planilha de
 * escala sempre usou e ninguém precisou de legenda para entender.
 *
 * -------------------------------------------------------------------- uma grade só
 *
 * Em cada disposição, celular e desktop usam a **mesma grade e o mesmo DOM** — o que muda é onde
 * cada célula cai:
 *
 *   denso, celular (3 col)                denso, desktop lg (5 col)
 *   +------+-----------------+-------+   +------+-----------+---------+-------+--------+
 *   |14/03 | Marli Gonçalves | R$180 |   |14/03 | Marli G.  | Sandra  | R$180 | o Em   |
 *   |07:00 | Plantão 12h ... | o Em  |   |07:00 | Plantão.. | Oliveira|       | andam. |
 *   |      | Sandra Oliveira | andam.|   +------+-----------+---------+-------+--------+
 *   +------+-----------------+-------+
 *
 *   empilhado, celular (2 col)             empilhado, desktop sm (3 col)
 *   +---------------------+-----------+   +------+----------------------+-----------+
 *   | 26/08 15:00         | o Em busca|   |26/08 | Marli Souza          | o Em busca|
 *   | Marli Souza         |     R$ 120|   |15:00 | Avulsa · 1h · Centro |           |
 *   | Avulsa · 1h · Centro            |   |      | Aguardando cuidador  |     R$ 120|
 *   | Aguardando cuidador             |   |      | 1 cuidador compatível no quadro  |
 *   | 1 cuidador compatível no quadro |   |      | Buscar cuidadores · Candidaturas |
 *   | Buscar cuidadores · Candidatu.. |   +------+----------------------+-----------+
 *   +---------------------------------+
 *
 * O nome do cuidador é o mesmo nó nos quatro casos — ele muda de lugar por `col-start`/`row-start`,
 * não por uma segunda cópia escondida com `lg:hidden`. Cópia escondida é o atalho que duplica o
 * conteúdo para leitor de tela e sai de sincronia na primeira alteração.
 */

type AttendanceRowLayout = "denso" | "empilhado";

/**
 * A grade e o preenchimento de cada disposição.
 *
 * `gap-y` é praticamente zero nas duas porque o ritmo vertical entre as camadas vem de `mt-*` em
 * cada célula, não do vão uniforme da grade — e precisa vir de lá: as camadas 3, 4 e 5 aparecem e
 * somem conforme o plantão, e um vão uniforme deixaria buraco onde a camada não existe. Com
 * `mt-*`, a linha que não tem recado simplesmente não abre espaço para ele.
 *
 * No `empilhado`, `min-h-20` garante o alvo de toque confortável mesmo no registro mais curto
 * (sem data, sem cuidador), e `pointer-fine:min-h-0` o devolve à altura do conteúdo onde existe
 * mouse — a régua é o método de entrada, não a largura da tela: um tablet em paisagem tem largura
 * de desktop e dedo de celular.
 */
const GRADE: Record<AttendanceRowLayout, string> = {
  denso:
    "grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-0.5 px-3.5 py-2.5 lg:grid-cols-[3.5rem_minmax(0,1.7fr)_minmax(0,1fr)_5.5rem_8.5rem] lg:items-center lg:gap-x-4",
  empilhado:
    "min-h-20 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-0 px-2 py-3 pointer-fine:min-h-0 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-x-4 sm:py-2.5",
};

/** Onde cada uma das oito células cai, em cada disposição. */
const CELULA: Record<AttendanceRowLayout, Record<string, string>> = {
  denso: {
    quando: "col-start-1 row-span-3 row-start-1 lg:row-span-2",
    paciente: "col-start-2 row-start-1",
    contexto: "col-start-2 row-start-2",
    /* Na disposição densa a camada operacional é uma **coluna** no desktop — a mesma do cuidador,
       porque é a mesma pergunta. Ali ela não pode virar linha: com trinta registros, uma linha a
       mais em cada plantão aberto custaria uma tela inteira de rolagem. Abaixo de `lg` ela desce
       para a terceira linha do bloco de texto, que é onde há largura. */
    operacao:
      "col-start-2 row-start-3 text-meta lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:text-note",
    valor: "col-start-3 row-start-1 text-ink lg:col-start-4 lg:row-span-2 lg:row-start-1",
    estado: "col-start-3 row-span-2 row-start-2 lg:col-start-5 lg:row-span-2 lg:row-start-1",
    nota: "col-span-2 col-start-2 row-start-4 mt-1 lg:col-span-4 lg:col-start-2 lg:row-start-3",
    acoes: "col-span-2 col-start-2 row-start-5 mt-1 lg:col-span-4 lg:col-start-2 lg:row-start-4",
  },
  empilhado: {
    /* No celular a data fica **ao lado** da hora, não por cima: a primeira linha do registro é
       larga e sobra espaço, e empilhar ali gastaria uma linha inteira para dois dados curtos —
       além de desalinhar o estado, que passaria a flutuar ao lado de um bloco de duas alturas.
       No desktop a calha volta a ter 3.5rem e o empilhamento volta com ela (`sm:block`). */
    quando:
      "col-start-1 row-start-1 flex items-baseline gap-1.5 self-center sm:row-span-3 sm:block sm:self-start",
    paciente: "col-start-1 row-start-2 mt-1 sm:col-start-2 sm:row-start-1 sm:mt-0",
    contexto: "col-span-2 col-start-1 row-start-3 sm:col-span-1 sm:col-start-2 sm:row-start-2",
    /* `mt-2` é o maior respiro de dentro do registro, e é ele que separa o **bloco de dados**
       (camadas 1 e 2) do **bloco de operação** (3, 4 e 5). Sem esse degrau, "Aguardando cuidador"
       lia como uma quarta linha de contexto do plantão em vez de como a situação dele. */
    operacao:
      "col-span-2 col-start-1 row-start-4 mt-2 text-note sm:col-span-1 sm:col-start-2 sm:row-start-3 sm:mt-1",
    valor: "col-start-2 row-start-2 mt-1 text-ink-muted sm:col-start-3 sm:row-start-3 sm:mt-1",
    estado: "col-start-2 row-start-1 self-center sm:col-start-3 sm:row-start-1 sm:self-start",
    nota: "col-span-2 col-start-1 row-start-5 mt-1.5 sm:col-start-2 sm:row-start-4",
    acoes: "col-span-2 col-start-1 row-start-6 mt-1 sm:col-start-2 sm:row-start-5",
  },
};

interface AttendanceRowProps {
  attendance: Attendance;
  patientName: string;
  /** Para onde a linha inteira navega. */
  to: string;
  /** A tela de onde a linha foi aberta, para o "voltar" da ficha saber por onde voltar. */
  state?: EstadoDeOrigem;
  caregiverName?: string;
  /** Quando presente junto de `caregiverName`, o nome vira link para o perfil do cuidador. */
  caregiverId?: string;
  /**
   * Camada 4 — o que já se sabe sobre a busca (ex.: quantos cuidadores compatíveis há no quadro).
   * Neutra por padrão: informação que ajuda a decidir, não a decisão nem a ação.
   */
  note?: ReactNode;
  /** Camada 5 — o que dá para fazer daqui (buscar cuidadores, ver candidaturas). */
  actions?: ReactNode;
  /** A agenda já agrupa por dia: ali a data na coluna seria a mesma em todas as linhas. */
  showDate?: boolean;
  /** `denso` para a escala inteira, `empilhado` para o recorte curto do Início. */
  layout?: AttendanceRowLayout;
}

export function AttendanceRow({
  attendance,
  patientName,
  to,
  state,
  caregiverName,
  caregiverId,
  note,
  actions,
  showDate = true,
  layout = "denso",
}: AttendanceRowProps) {
  const contexto = [
    ATTENDANCE_TYPE_SHORT[attendance.type],
    `${attendance.durationHours}h`,
    attendance.neighborhood,
  ].join(" · ");

  const celula = CELULA[layout];
  const situacao = ATTENDANCE_SITUATION[attendance.status];

  return (
    <li
      /* No `denso`, as duas colunas de texto são fracionárias (1,7fr e 1fr) em vez de uma elástica
         e outra fixa: com `10rem` fixos, toda a folga de um monitor de 1440px se acumulava num vão
         entre o nome do paciente e o nome do cuidador, e os dois pareciam de linhas diferentes.

         `active:` existe para o toque, onde não há hover: o dedo cobre o ponto tocado e, sem uma
         mudança imediata de fundo, a pessoa não sabe se o toque pegou. `has-[a:focus-visible]`
         acende a mesma tinta quando o link esticado recebe foco de teclado — sem isso, o anel de
         foco aparece só em volta do nome do paciente e não fica claro que a **linha** é o destino. */
      className={`relative grid transition-colors duration-150 ease-out hover:bg-surface-sunken/60 active:bg-surface-sunken has-[a:focus-visible]:bg-surface-sunken/60 ${GRADE[layout]}`}
    >
      {/*
        Camada 1 — quando. A âncora operacional da linha.

        Quem lidera depende de quem está sozinho. Na Agenda e nos plantões de hoje só a hora
        aparece: o dia já é o do grupo, e a hora é a pergunta que sobra. Nas listas que atravessam
        semanas — Atendimentos, "Em aberto", "Próximos" — a data volta, e é ela que passa a
        carregar o peso: primeiro que dia, depois que horas.

        Antes a hora vencia nos três eixos ao mesmo tempo (dois pontos maior, semibold e na tinta
        cheia) enquanto a data ficava em 13px terciários por cima. Além de inverter a leitura,
        isso jogava o elemento mais forte da coluna para a segunda linha, desencontrado do nome do
        paciente ao lado — a linha inteira parecia torta. Com a troca, o item forte da coluna
        divide a primeira linha de base com o nome, e a hora desce para o apoio.

        `leading-tight` só quando as duas aparecem: ali elas precisam ler como um bloco só.
        Sozinha, a hora volta à entrelinha normal para cair na mesma linha de base do nome.
      */}
      <div className={celula.quando}>
        {showDate && (
          <div className="numero text-note font-semibold leading-tight text-ink">
            {diaMes(attendance.startDate)}
          </div>
        )}
        <div
          className={
            showDate
              ? "numero text-meta leading-tight text-ink-muted"
              : "numero text-note font-semibold text-ink"
          }
        >
          {attendance.startTime}
        </div>
      </div>

      {/* Camada 1 — paciente. O link se estica por cima da linha inteira (`after:inset-0`), então
             qualquer ponto da linha abre a ficha; os links de dentro sobem com `relative z-10`. */}
      <div className={`min-w-0 ${celula.paciente}`}>
        <Link
          to={to}
          state={state}
          className="block truncate text-note font-semibold text-ink after:absolute after:inset-0 hover:text-accent"
        >
          {patientName}
        </Link>
      </div>

      {/* Camada 1 — estado. Sempre na mesma posição e sempre respondendo à mesma pergunta: em que
             pé está o registro. Nunca uma contagem, nunca um substantivo de coisa — foi por isso
             que "Candidaturas" saiu daqui e virou "Em confirmação"; a razão inteira está em
             `constants/attendance.ts`. */}
      <div className={`flex justify-end ${celula.estado}`}>
        <StatusAtendimento status={attendance.status} />
      </div>

      {/* Camada 2 — contexto. */}
      <p className={`min-w-0 truncate text-meta text-ink-subtle ${celula.contexto}`}>{contexto}</p>

      {/* Camada 2 — valor. */}
      <div className={`numero text-right text-note ${celula.valor}`}>
        {formatCurrency(attendance.value)}
      </div>

      {/* Camada 3 — situação operacional, ou o cuidador que a resolveu. É a mesma linha porque é a
             mesma pergunta em dois tempos: enquanto o plantão espera, ela diz **o que** se espera;
             depois de confirmado, diz **quem** assumiu. */}
      <div className={`min-w-0 truncate ${celula.operacao}`}>
        {caregiverName && caregiverId ? (
          <Link
            to={`/empresa/cuidadores/${caregiverId}`}
            className="relative z-10 text-ink-muted underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:text-accent hover:decoration-accent/40"
          >
            {caregiverName}
          </Link>
        ) : caregiverName ? (
          <span className="text-ink-muted">{caregiverName}</span>
        ) : situacao ? (
          /* A espera não é um dado ausente, é o trabalho que falta fazer — por isso sai na tinta
             do estado que espera, com peso 500, e não em cinza de placeholder. Peso e tinta, sem
             pastilha: a camada precisa de mais presença que o contexto acima dela, não de uma
             etiqueta que transformaria a lista num mural.

             Só existe situação **enquanto alguém é esperado** — `ATTENDANCE_SITUATION` cobre só os
             três estados abertos. Num rascunho ou num cancelado, o âmbar prometia trabalho que não
             existe e a coluna inteira acendia sem motivo; ali a ausência volta a ser ausência. */
          <span className={`font-medium ${ATTENDANCE_STATUS_TINT[attendance.status]}`}>
            {situacao}
          </span>
        ) : (
          <span className="text-ink-subtle">—</span>
        )}
      </div>

      {/* Camada 4 — informação complementar. Neutra e sem sublinhado: ela **informa** a decisão que
             as ações abaixo executam, e confundir as duas era o problema que a separação resolve.
             Tinta de estado aqui é exceção, reservada a quando o próprio dado é o problema (nenhum
             cuidador compatível no quadro) — quem chama passa a sua. */}
      {note && <p className={`text-meta text-ink-subtle ${celula.nota}`}>{note}</p>}

      {/* Camada 5 — ações. `relative z-10` para ficar por cima do link esticado da linha. O
             `gap-x-3` no toque é o afastamento mínimo entre dois alvos (seção 11): dois links de
             44px colados produzem toque errado na borda. */}
      {actions && (
        <div
          className={`relative z-10 flex flex-wrap items-center gap-x-3 gap-y-0.5 pointer-fine:gap-x-2.5 ${celula.acoes}`}
        >
          {actions}
        </div>
      )}
    </li>
  );
}

/**
 * O registro — a moldura que faz um conjunto de linhas ler como uma lista só.
 *
 * `moldura` — uma borda para o conjunto inteiro e um fio de 1px entre as linhas, em vez de borda
 *   e sombra em cada item. É a diferença entre uma planilha e uma pilha de post-its, e é o que
 *   mais mudou a aparência do módulo. Usar quando a lista é o conteúdo da tela.
 *
 * `fluxo` — os mesmos fios entre as linhas, **sem** borda, fundo ou raio. A lista deixa de ser um
 *   objeto sobre a página e passa a ser parte dela. Usar sob um `<Secao>`, no Início, onde vários
 *   recortes curtos se seguem: ali cada moldura extra é uma parede a mais entre a coordenadora e
 *   a operação do dia.
 *
 *   O `-mx-2` compensa exatamente o `px-2` da linha empilhada: o texto volta a nascer na margem
 *   da página, e o fundo de hover/toque sobra 8px para cada lado em vez de encostar nas letras.
 */
export function AttendanceList({
  children,
  variant = "moldura",
  className = "",
}: {
  children: ReactNode;
  variant?: "moldura" | "fluxo";
  className?: string;
}) {
  /*
    `overflow-clip` e não `overflow-hidden`, e a diferença aqui é funcional, não de gosto:
    `hidden` cria um contêiner de rolagem, e `position: sticky` passa a se resolver contra ele —
    o cabeçalho de dia da agenda pararia de grudar no topo da janela e não grudaria em lugar
    nenhum. `clip` recorta o canto arredondado do mesmo jeito **sem** criar o contêiner de
    rolagem, então o sticky continua respondendo à rolagem da página.
  */
  const moldura =
    variant === "moldura"
      ? "overflow-clip rounded-card border border-linha bg-surface-raised"
      : "-mx-2";

  return <ul className={`divide-y divide-linha ${moldura} ${className}`}>{children}</ul>;
}

/**
 * Cabeçalho de grupo dentro do registro — o dia, na agenda.
 *
 * Fica grudado no topo enquanto o grupo rola (`sticky`): em escala longa, saber de que dia é a
 * linha que se está lendo não pode depender de rolar de volta.
 */
export function AttendanceGroupHeader({
  label,
  count,
  className = "",
}: {
  label: string;
  count?: number;
  className?: string;
}) {
  return (
    <li
      className={`sticky top-0 z-10 flex items-baseline justify-between gap-3 bg-surface-sunken px-3.5 py-1.5 ${className}`}
    >
      <span className="text-dado text-ink-muted uppercase">{label}</span>
      {count !== undefined && (
        <span className="numero text-meta text-ink-subtle">
          {count === 0 ? "sem atendimentos" : count === 1 ? "1 atendimento" : `${count} atendimentos`}
        </span>
      )}
    </li>
  );
}
