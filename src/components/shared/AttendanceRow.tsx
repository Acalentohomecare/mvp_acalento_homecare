import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { StatusAtendimento } from "../ui/StatusAtendimento";
import { ATTENDANCE_TYPE_SHORT } from "../../constants/attendance";
import { formatCurrency } from "../../utils/format";
import { diaMes } from "../../utils/date";
import { isAwaitingCaregiver } from "../../services/attendances";
import type { Attendance } from "../../types";

/*
 * A linha de registro do atendimento (docs/DESIGN_SYSTEM.md, seção 9.1).
 *
 * Substitui o `<AttendanceCard>`, e a troca é estrutural, não de estilo. O card punha cada plantão
 * numa caixa com borda, raio de 14px e sombra; quinze plantões viravam quinze objetos flutuando
 * sobre a página, ~150px cada, e a coordenadora precisava **ler** um por um porque nenhum dado
 * ficava na mesma posição de uma caixa para a outra.
 *
 * A linha resolve as duas coisas de uma vez: cada informação tem **coluna fixa**, então a leitura
 * vira varredura vertical — a coluna de horários alinha, a de valores alinha, a de estados alinha.
 * E a altura caiu para ~56px no desktop e ~74px no celular, com mais informação dentro.
 *
 * ------------------------------------------------------------------ a hierarquia
 *
 * Quatro pesos, e nenhum deles é só cor (a exigência do briefing, e a regra 3 do design system):
 *
 *   1. principal    nome do paciente        `text-note` peso 600, `--ink`
 *   2. operacional  hora, e a data acima    `numero` peso 500, `--ink` / `--ink-subtle`
 *   3. contextual   tipo · duração · bairro `text-meta`, `--ink-subtle`
 *   4. complementar valor e estado          `numero` / marcador, encostados à direita
 *
 * O horário fica numa coluna própria, à esquerda de tudo, porque numa escala **quando** é a
 * primeira pergunta — antes até de quem. É o que uma escala impressa sempre fez.
 *
 * ---------------------------------------------------------------------- os ícones
 *
 * Não há nenhum. A versão anterior abria cada dado com um ícone de 12px — calendário, relógio,
 * alfinete, bonequinho — na sequência `📅 data ◷ hora 📍 local 👤 cuidador`. Nenhum deles
 * acelerava reconhecimento: a data já se reconhece por ser data, e quatro ícones cinzas na mesma
 * linha viram textura. O que separa os dados agora é **posição de coluna**, que é o que uma
 * planilha de escala sempre usou e ninguém precisou de legenda para entender.
 *
 * -------------------------------------------------------------------- uma grade só
 *
 * Celular e desktop usam a **mesma grade e o mesmo DOM** — o que muda é onde cada célula cai:
 *
 *   celular (3 col × 3 linhas)          desktop lg (5 col × 2 linhas)
 *   ┌──────┬─────────────────┬───────┐  ┌──────┬───────────┬─────────┬───────┬────────┐
 *   │14/03 │ Marli Gonçalves │ R$180 │  │14/03 │ Marli G.  │ Sandra  │ R$180 │ ● Em   │
 *   │07:00 │ Plantão 12h ·…  │ ● Em  │  │07:00 │ Plantão…  │ Oliveira│       │ andam. │
 *   │      │ Sandra Oliveira │ andam.│  └──────┴───────────┴─────────┴───────┴────────┘
 *   └──────┴─────────────────┴───────┘
 *
 * O nome do cuidador é o mesmo nó nos dois casos — ele muda de lugar por `col-start`/`row-start`,
 * não por uma segunda cópia escondida com `lg:hidden`. Cópia escondida é o atalho que duplica o
 * conteúdo para leitor de tela e sai de sincronia na primeira alteração.
 */

interface AttendanceRowProps {
  attendance: Attendance;
  patientName: string;
  /** Para onde a linha inteira navega. */
  to: string;
  caregiverName?: string;
  /** Quando presente junto de `caregiverName`, o nome vira link para o perfil do cuidador. */
  caregiverId?: string;
  /** Recado curto — ex.: quantos cuidadores compatíveis existem no quadro. */
  note?: ReactNode;
  /** Ações rápidas da linha (buscar cuidadores, ver candidaturas). */
  actions?: ReactNode;
  /** A agenda já agrupa por dia: ali a data na coluna seria a mesma em todas as linhas. */
  showDate?: boolean;
}

export function AttendanceRow({
  attendance,
  patientName,
  to,
  caregiverName,
  caregiverId,
  note,
  actions,
  showDate = true,
}: AttendanceRowProps) {
  const contexto = [
    ATTENDANCE_TYPE_SHORT[attendance.type],
    `${attendance.durationHours}h`,
    attendance.neighborhood,
  ].join(" · ");

  return (
    <li
      /* As duas colunas de texto são fracionárias (1,7fr e 1fr) em vez de uma elástica e outra
         fixa: com `10rem` fixos, toda a folga de um monitor de 1440px se acumulava num vão entre
         o nome do paciente e o nome do cuidador, e os dois pareciam de linhas diferentes. */
      className="relative grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-0.5 px-3.5 py-2.5 transition-colors duration-150 ease-out hover:bg-surface-sunken/60 lg:grid-cols-[3.5rem_minmax(0,1.7fr)_minmax(0,1fr)_5.5rem_8.5rem] lg:items-center lg:gap-x-4"
    >
      {/* 1 — quando. A âncora operacional da linha. */}
      <div className="col-start-1 row-span-3 row-start-1 lg:row-span-2">
        {showDate && (
          <div className="numero text-meta leading-tight text-ink-subtle">
            {diaMes(attendance.startDate)}
          </div>
        )}
        <div className="numero text-note leading-tight font-semibold text-ink">
          {attendance.startTime}
        </div>
      </div>

      {/* 2 — paciente. O link se estica por cima da linha inteira (`after:inset-0`), então
             qualquer ponto da linha abre a ficha; os links de dentro sobem com `relative z-10`. */}
      <div className="col-start-2 row-start-1 min-w-0">
        <Link
          to={to}
          className="block truncate text-note font-semibold text-ink after:absolute after:inset-0 hover:text-accent"
        >
          {patientName}
        </Link>
      </div>

      {/* 3 — contexto. */}
      <p className="col-start-2 row-start-2 min-w-0 truncate text-meta text-ink-subtle">
        {contexto}
      </p>

      {/* 4 — cuidador. Celular: terceira linha do bloco central. Desktop: coluna própria. */}
      <div className="col-start-2 row-start-3 min-w-0 truncate text-meta lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:text-note">
        {caregiverName && caregiverId ? (
          <Link
            to={`/empresa/cuidadores/${caregiverId}`}
            className="relative z-10 text-ink-muted underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:text-accent hover:decoration-accent/40"
          >
            {caregiverName}
          </Link>
        ) : caregiverName ? (
          <span className="text-ink-muted">{caregiverName}</span>
        ) : isAwaitingCaregiver(attendance) ? (
          /* "Sem cuidador" não é um dado ausente, é o trabalho que falta fazer — por isso sai na
             tinta do estado que espera decisão, e não em cinza de placeholder.
             Só que isso **só vale enquanto o plantão espera alguém**: num rascunho ou num
             cancelado, o âmbar prometia trabalho que não existe, e a coluna inteira acendia sem
             motivo. Fora desses estados, a ausência volta a ser uma ausência. */
          <span className="text-status-aberto">Sem cuidador</span>
        ) : (
          <span className="text-ink-subtle">—</span>
        )}
      </div>

      {/* 5 — valor. */}
      <div className="col-start-3 row-start-1 text-right numero text-note text-ink lg:col-start-4 lg:row-span-2 lg:row-start-1">
        {formatCurrency(attendance.value)}
      </div>

      {/* 6 — estado. */}
      <div className="col-start-3 row-span-2 row-start-2 flex justify-end lg:col-start-5 lg:row-span-2 lg:row-start-1">
        <StatusAtendimento status={attendance.status} />
      </div>

      {/* 7 — recado e ações, quando existem. Só a linha que pede trabalho fica mais alta: numa
             lista, a exceção deve se destacar da regra, não ser nivelada com ela. */}
      {(note || actions) && (
        <div className="col-span-2 col-start-2 row-start-4 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:col-span-4 lg:col-start-2 lg:row-start-3">
          {note && <span className="text-meta">{note}</span>}
          {actions && <div className="relative z-10 flex flex-wrap gap-1.5">{actions}</div>}
        </div>
      )}
    </li>
  );
}

/**
 * O registro — a moldura que faz um conjunto de linhas ler como uma lista só.
 *
 * Uma borda para o conjunto inteiro e um fio de 1px entre as linhas, em vez de borda e sombra em
 * cada item. É a diferença entre uma planilha e uma pilha de post-its, e é o que mais mudou a
 * aparência do módulo.
 */
export function AttendanceList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  /*
    `overflow-clip` e não `overflow-hidden`, e a diferença aqui é funcional, não de gosto:
    `hidden` cria um contêiner de rolagem, e `position: sticky` passa a se resolver contra ele —
    o cabeçalho de dia da agenda pararia de grudar no topo da janela e não grudaria em lugar
    nenhum. `clip` recorta o canto arredondado do mesmo jeito **sem** criar o contêiner de
    rolagem, então o sticky continua respondendo à rolagem da página.
  */
  return (
    <ul
      className={`divide-y divide-linha overflow-clip rounded-card border border-linha bg-surface-raised ${className}`}
    >
      {children}
    </ul>
  );
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
