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
