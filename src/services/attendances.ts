import type {
  AppState,
  Attendance,
  AttendanceStatus,
  AttendanceType,
  CaregiverCategory,
  Patient,
} from "../types";
import { dataCompleta, rotuloDosDias, somarDias } from "../utils/date";

/** Tolerância antes de considerar o check-in atrasado (mesma regra da Etapa 12). */
export const CHECKIN_TOLERANCE_MINUTES = 15;

const OPEN_STATUSES: AttendanceStatus[] = ["open", "invited", "applications_received"];

export function todayISO(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function attendanceStart(attendance: Attendance): Date {
  return new Date(`${attendance.startDate}T${attendance.startTime}`);
}

function byStart(a: Attendance, b: Attendance): number {
  return `${a.startDate}T${a.startTime}`.localeCompare(`${b.startDate}T${b.startTime}`);
}

/** Isolamento de dados: a empresa só enxerga os próprios atendimentos. */
export function companyAttendances(state: AppState, companyId: string | undefined): Attendance[] {
  if (!companyId) return [];
  return state.attendances.filter((a) => a.companyId === companyId);
}

/**
 * Isolamento pelo outro lado: o cuidador só enxerga os plantões que ele assumiu.
 *
 * Note que **não** há recorte por empresa. O vínculo é por empresa (o mesmo cuidador pode estar
 * aprovado numa e em análise noutra), mas o histórico de trabalho é dele: Sandra atende pela
 * Acalento e pela Cuidar Bem, e as duas aparecem juntas na lista dela. Cada empresa continua
 * vendo só o que é seu — a assimetria é proposital, não um furo.
 */
export function caregiverAttendances(
  state: AppState,
  caregiverId: string | undefined,
): Attendance[] {
  if (!caregiverId) return [];
  return state.attendances.filter((a) => a.confirmedCaregiverId === caregiverId);
}

/** Plantão encerrado — o trabalho que já foi feito, avaliado ou não. */
export function isConcluded(attendance: Attendance): boolean {
  return attendance.status === "completed" || attendance.status === "evaluated";
}

export interface CaregiverEarnings {
  /** Plantões confirmados à frente: o que já está garantido. */
  aReceberValor: number;
  aReceberCount: number;
  /** Plantões encerrados dentro do mês corrente. */
  mesValor: number;
  mesCount: number;
}

/**
 * O que o cuidador ganha — a pergunta que a tela dele não respondia.
 *
 * Substituiu "horas realizadas" no Início, e a troca não é de rótulo. A soma de horas era
 * vitalícia e sem período ("12h" desde quando?) e, com plantões padronizados de 12h e 24h,
 * repetia a contagem de atendimentos em outra unidade: 1 plantão concluído *era* 12h realizadas.
 * O valor é o que aquelas horas estavam tentando dizer, e é o número que quem trabalha por
 * plantão realmente acompanha.
 *
 * O recorte do mês é o que dá sentido ao número. Total vitalício não responde "como foi este
 * mês", que é a pergunta que se faz olhando para o próprio trabalho.
 *
 * Isto é relatório, não pagamento (CLAUDE.md §36): soma o `value` acordado em cada plantão, do
 * mesmo jeito que o relatório da empresa (§33) mostra "valor estimado". Não há cobrança, repasse
 * nem status de pagamento em lugar nenhum.
 */
export function caregiverEarnings(list: Attendance[], now = new Date()): CaregiverEarnings {
  const hoje = todayISO(now);
  /* `YYYY-MM` do mês corrente. Comparar prefixo de string evita construir Date por atendimento e
     usa o mesmo fuso local que `todayISO` — as duas contas precisam concordar. */
  const mes = hoje.slice(0, 7);

  return list.reduce<CaregiverEarnings>(
    (acc, a) => {
      if (a.status === "confirmed" && a.startDate >= hoje) {
        acc.aReceberValor += a.value;
        acc.aReceberCount += 1;
      }
      if (isConcluded(a) && a.startDate.startsWith(mes)) {
        acc.mesValor += a.value;
        acc.mesCount += 1;
      }
      return acc;
    },
    { aReceberValor: 0, aReceberCount: 0, mesValor: 0, mesCount: 0 },
  );
}

/** Atendimento publicado e ainda sem cuidador confirmado. */
export function isAwaitingCaregiver(attendance: Attendance): boolean {
  return OPEN_STATUSES.includes(attendance.status);
}

export function todayAttendances(list: Attendance[], now = new Date()): Attendance[] {
  const today = todayISO(now);
  return list
    .filter((a) => a.startDate === today && a.status !== "draft" && a.status !== "cancelled")
    .sort(byStart);
}

export function awaitingCaregiverAttendances(list: Attendance[]): Attendance[] {
  return list.filter(isAwaitingCaregiver).sort(byStart);
}

export function upcomingAttendances(list: Attendance[], now = new Date()): Attendance[] {
  const today = todayISO(now);
  return list
    .filter((a) => a.status === "confirmed" && a.startDate > today)
    .sort(byStart);
}

export interface ScheduleDay {
  date: string;
  items: Attendance[];
}

/** Agenda/escala: N dias a partir de `from`, cada um com os atendimentos que não foram cancelados. */
export function scheduleDays(list: Attendance[], from: Date, days: number): ScheduleDay[] {
  return Array.from({ length: days }, (_, offset) => {
    const day = new Date(from);
    day.setDate(day.getDate() + offset);
    const date = todayISO(day);
    return {
      date,
      items: list
        .filter((a) => a.startDate === date && a.status !== "cancelled" && a.status !== "draft")
        .sort(byStart),
    };
  });
}

export function draftAttendances(list: Attendance[]): Attendance[] {
  return list.filter((a) => a.status === "draft").sort(byStart);
}

export function applicationsToReview(list: Attendance[]): Attendance[] {
  return list.filter((a) => a.status === "applications_received").sort(byStart);
}

/** Confirmado, horário já passou da tolerância e o cuidador não fez check-in. */
export function pendingCheckins(list: Attendance[], now = new Date()): Attendance[] {
  return list
    .filter(
      (a) =>
        a.status === "confirmed" &&
        !a.checkinAt &&
        now.getTime() - attendanceStart(a).getTime() > CHECKIN_TOLERANCE_MINUTES * 60_000,
    )
    .sort(byStart);
}

/** Horas realizadas de verdade — calculadas do check-in/check-out, não da duração prevista. */
export function completedHours(list: Attendance[]): number {
  return list.reduce((total, a) => {
    if (!a.checkinAt || !a.checkoutAt) return total;
    const hours =
      (new Date(a.checkoutAt).getTime() - new Date(a.checkinAt).getTime()) / 3_600_000;
    return total + Math.max(hours, 0);
  }, 0);
}

/** Cuidadores com atendimento confirmado ou em andamento nesta empresa. */
export function activeCaregiverIds(list: Attendance[]): string[] {
  const ids = list
    .filter((a) => (a.status === "confirmed" || a.status === "in_progress") && a.confirmedCaregiverId)
    .map((a) => a.confirmedCaregiverId as string);
  return [...new Set(ids)];
}

/** A natureza do que aconteceu. Quem exibe decide a tinta do marcador a partir daqui. */
export type RecentActivityKind = "criado" | "checkin" | "concluido" | "cancelado";

export interface RecentActivityEntry {
  id: string;
  at: string;
  /** O evento. Frase curta, verbo no particípio, **sem ponto final** — é rótulo, não parágrafo. */
  text: string;
  /**
   * A informação complementar do evento: o motivo do cancelamento, o local do check-in.
   *
   * Nasceu porque o cancelamento vinha como `"... cancelado: Paciente foi internada."` — evento e
   * motivo grudados numa frase só, que na linha do tempo obriga a ler a sentença inteira para
   * descobrir o que aconteceu. Separados, o evento é escaneável e o motivo fica um degrau abaixo.
   */
  detail?: string;
  kind: RecentActivityKind;
  /** O atendimento de origem — é ele que a entrada abre quando a linha do tempo é clicável. */
  attendanceId: string;
}

/**
 * "Atividade recente" derivada dos próprios atendimentos da empresa — de propósito não usa o
 * `auditLog`, que é global e traz ações de outras empresas/cuidadores (isolamento de dados).
 */
export function recentActivity(
  list: Attendance[],
  patients: Patient[],
  limit = 6,
): RecentActivityEntry[] {
  const patientName = (id: string) => patients.find((p) => p.id === id)?.name ?? "paciente";
  const entries: RecentActivityEntry[] = [];

  for (const a of list) {
    const nome = patientName(a.patientId);
    if (a.checkoutAt) {
      entries.push({ id: `${a.id}-out`, at: a.checkoutAt, text: `Atendimento de ${nome} concluído`, kind: "concluido", attendanceId: a.id });
    }
    if (a.checkinAt) {
      entries.push({ id: `${a.id}-in`, at: a.checkinAt, text: `Check-in registrado em ${nome}`, detail: a.checkinLocation, kind: "checkin", attendanceId: a.id });
    }
    if (a.cancellation) {
      entries.push({ id: `${a.id}-cancel`, at: a.cancellation.at, text: `Atendimento de ${nome} cancelado`, detail: a.cancellation.reason, kind: "cancelado", attendanceId: a.id });
    }
    entries.push({ id: `${a.id}-new`, at: a.createdAt, text: `Atendimento de ${nome} criado`, kind: "criado", attendanceId: a.id });
  }

  return entries.sort((x, y) => y.at.localeCompare(x.at)).slice(0, limit);
}

export interface NewAttendanceInput {
  companyId: string;
  patientId: string;
  type: AttendanceType;
  neighborhood: string;
  street: string;
  number: string;
  startDate: string;
  startTime: string;
  durationHours: number;
  recurring: boolean;
  recurrenceDescription?: string;
  activityIds: string[];
  /** Escolhido por quem publica — ver a nota em `Attendance.requiredCategory`. */
  requiredCategory: CaregiverCategory;
  value: number;
}

/** Campos que variam entre os dias de uma escala; o resto do atendimento é igual em todos. */
interface DiaDaEscala {
  id: string;
  startDate: string;
  seriesId?: string;
  recurrenceDescription?: string;
}

function montarAtendimento(
  input: NewAttendanceInput,
  publish: boolean,
  dia: DiaDaEscala,
  criadoEm: string,
): Attendance {
  return {
    id: dia.id,
    companyId: input.companyId,
    patientId: input.patientId,
    type: input.type,
    neighborhood: input.neighborhood,
    street: input.street,
    number: input.number,
    startDate: dia.startDate,
    startTime: input.startTime,
    durationHours: input.durationHours,
    recurring: Boolean(dia.seriesId) || input.recurring,
    recurrenceDescription: dia.recurrenceDescription,
    seriesId: dia.seriesId,
    activityIds: input.activityIds,
    requiredCategory: input.requiredCategory,
    value: input.value,
    status: publish ? "open" : "draft",
    // A escolha entre convite direto e publicação aberta acontece na Etapa 9.
    openApplications: false,
    createdAt: criadoEm,
  };
}

export function createAttendance(
  state: AppState,
  input: NewAttendanceInput,
  publish: boolean,
): { attendance: Attendance; nextState: AppState } {
  const attendance = montarAtendimento(
    input,
    publish,
    {
      id: `at_${Date.now()}`,
      startDate: input.startDate,
      recurrenceDescription: input.recurring ? input.recurrenceDescription : undefined,
    },
    new Date().toISOString(),
  );

  return {
    attendance,
    nextState: { ...state, attendances: [...state.attendances, attendance] },
  };
}

/* --------------------------------------------------------------- escala fixa

   O arranjo mais comum do home care — "12h de segunda a sexta com a Dona Maria, por três meses"
   — não é um atendimento longo: são sessenta atendimentos iguais. Tratá-lo como um registro só
   quebraria tudo que é diário (check-in, registro, avaliação) e mentiria na agenda, que mostraria
   um dia onde há três meses de trabalho.

   Por isso a escala **gera** os dias na publicação. O que continua sendo evento único é a
   contratação: convite, aceite e confirmação valem para a série inteira (ver
   `services/invitations.ts`), porque ninguém contrata a mesma cuidadora sessenta vezes.
*/

/** Teto por publicação. Três meses de dias úteis cabem folgados, e a escala se renova publicando. */
export const ESCALA_MAX_DIAS = 92;
export const ESCALA_MAX_ATENDIMENTOS = 70;

/** As datas que a escala ocupa: os dias da semana marcados, de `inicio` a `fim`, inclusive. */
export function datasDaEscala(inicio: string, fim: string, diasDaSemana: number[]): string[] {
  if (!inicio || !fim || fim < inicio || diasDaSemana.length === 0) return [];

  const datas: string[] = [];
  let dia = inicio;
  for (let i = 0; i <= ESCALA_MAX_DIAS && dia <= fim; i += 1) {
    if (diasDaSemana.includes(new Date(`${dia}T12:00`).getDay())) datas.push(dia);
    if (datas.length === ESCALA_MAX_ATENDIMENTOS) break;
    dia = somarDias(dia, 1);
  }
  return datas;
}

export interface EscalaInput {
  /** 0 = domingo, como em `Date.getDay()` e em `DIAS_DA_SEMANA`. */
  diasDaSemana: number[];
  /** Última data que a escala pode ocupar — a "data de saída" da contratação. */
  ate: string;
}

export function createAttendanceSeries(
  state: AppState,
  input: NewAttendanceInput,
  publish: boolean,
  escala: EscalaInput,
): { attendances: Attendance[]; nextState: AppState } {
  const datas = datasDaEscala(input.startDate, escala.ate, escala.diasDaSemana);
  const criadoEm = new Date().toISOString();
  const seriesId = `se_${Date.now()}`;
  const descricao = `${rotuloDosDias(escala.diasDaSemana)}, até ${dataCompleta(escala.ate)}`;

  const attendances = datas.map((data, i) =>
    montarAtendimento(
      input,
      publish,
      {
        id: `at_${Date.now()}_${i}`,
        startDate: data,
        seriesId,
        recurrenceDescription: descricao,
      },
      criadoEm,
    ),
  );

  return {
    attendances,
    nextState: { ...state, attendances: [...state.attendances, ...attendances] },
  };
}

export interface SerieResumo {
  seriesId: string;
  /** Todos os dias da escala presentes no recorte, em ordem de data. */
  membros: Attendance[];
  /** O dia que representa a escala na lista: o primeiro que ainda não passou. */
  representante: Attendance;
  de: string;
  ate: string;
  /** `Seg a Sex`, derivado dos dias que a série realmente ocupa. */
  rotuloDias: string;
}

export function resumoDaSerie(membros: Attendance[], hoje = todayISO()): SerieResumo {
  const ordenados = [...membros].sort(byStart);
  const diasDaSemana = ordenados.map((a) => new Date(`${a.startDate}T12:00`).getDay());

  return {
    seriesId: ordenados[0].seriesId ?? "",
    membros: ordenados,
    representante: ordenados.find((a) => a.startDate >= hoje) ?? ordenados[ordenados.length - 1],
    de: ordenados[0].startDate,
    ate: ordenados[ordenados.length - 1].startDate,
    rotuloDias: rotuloDosDias(diasDaSemana),
  };
}

/**
 * A escala em uma linha de apoio (camada 4 do registro): `Escala fixa · Seg a Sex · 42 dias · até
 * 31/10/2026`. É o que substitui os 41 registros que a lista deixou de mostrar, então precisa
 * dizer as três coisas que eles diziam juntos: o formato, o tamanho e até quando vai.
 */
export function rotuloDaSerie(serie: SerieResumo, curto = false): string {
  const base = `Escala fixa · ${serie.rotuloDias} · ${serie.membros.length} dias`;
  return curto ? base : `${base} · até ${dataCompleta(serie.ate)}`;
}

export type LinhaDeLista =
  | { tipo: "atendimento"; atendimento: Attendance }
  | { tipo: "serie"; serie: SerieResumo };

/**
 * Agrupa os dias de cada escala numa linha só, preservando a ordem da lista recebida: a série
 * ocupa o lugar do seu primeiro membro. Sem isso, uma escala de sessenta dias empurraria todo o
 * resto da tela para fora — e a lista de Atendimentos deixaria de responder "o que está em pé".
 *
 * A agenda **não** usa isto de propósito: lá a pergunta é o dia, e cada dia é uma linha.
 */
export function agruparPorSerie(list: Attendance[], hoje = todayISO()): LinhaDeLista[] {
  const linhas: LinhaDeLista[] = [];
  const vistas = new Set<string>();

  for (const atendimento of list) {
    if (!atendimento.seriesId) {
      linhas.push({ tipo: "atendimento", atendimento });
      continue;
    }
    if (vistas.has(atendimento.seriesId)) continue;
    vistas.add(atendimento.seriesId);

    const membros = list.filter((a) => a.seriesId === atendimento.seriesId);
    linhas.push(
      membros.length === 1
        ? { tipo: "atendimento", atendimento: membros[0] }
        : { tipo: "serie", serie: resumoDaSerie(membros, hoje) },
    );
  }

  return linhas;
}
