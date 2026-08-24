const DAY_MS = 24 * 60 * 60 * 1000;

/** Datas relativas a "agora", para que o dataset da demo pareça sempre atual (CLAUDE.md §44). */
export function addDays(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

export function isoDate(days: number): string {
  return addDays(days).toISOString().slice(0, 10);
}

export function isoDateTime(days: number, time: string): string {
  return `${isoDate(days)}T${time}`;
}

/*
 * -------------------------------------------------------------- leitura de data
 *
 * `startDate.split("-").reverse().join("/")` estava escrito à mão em onze telas, cada uma com o
 * seu formato: umas com ano, outras sem, outras com "às" no meio. Data é dado de operação — a
 * coordenadora compara horários entre plantões — e formato que muda de tela para tela obriga a
 * reler cada um. As funções abaixo são a única forma de escrever data neste produto.
 */

const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** `2026-03-14` → `14/03`. A forma da coluna de registro, onde o ano é ruído. */
export function diaMes(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

/** `2026-03-14` → `14/03/2026`. Onde o ano importa: ficha, relatório, histórico. */
export function dataCompleta(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** `2026-03-14` → `Ter`. Meio-dia fixo para a data não escorregar de fuso. */
export function diaDaSemana(iso: string): string {
  return SEMANA[new Date(`${iso}T12:00`).getDay()];
}

/**
 * Cabeçalho de grupo da agenda: `Hoje`, `Amanhã` ou `Ter, 14/03`.
 *
 * "Hoje" e "amanhã" não são enfeite: numa escala, os dois primeiros dias são os que a pessoa
 * está realmente decidindo, e ler a palavra é mais rápido que conferir o número contra o
 * calendário mental.
 */
export function rotuloDoDia(iso: string, hoje = new Date()): string {
  /* Data **local**, nunca `toISOString()`: às 22h em Brasília o UTC já virou o dia seguinte, e
     "Hoje" apareceria em cima do plantão de amanhã. É a mesma conta que `todayISO()` faz em
     `services/attendances.ts`, e as duas precisam concordar. */
  const local = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (iso === local(hoje)) return "Hoje";
  if (iso === local(new Date(hoje.getTime() + DAY_MS))) return "Amanhã";
  return `${diaDaSemana(iso)}, ${diaMes(iso)}`;
}

/** Carimbo de evento: `14/03 07:04`. Usado na linha do tempo e no registro de atividade. */
export function carimbo(iso: string): string {
  const d = new Date(iso);
  const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const hora = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${data} ${hora}`;
}

/** Carimbo com ano, para quando o evento pode ser antigo. */
export function carimboCompleto(iso: string): string {
  const d = new Date(iso);
  return `${dataCompleta(d.toISOString().slice(0, 10))} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
