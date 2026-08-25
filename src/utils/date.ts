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

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/**
 * Intervalo de período: `25–31 Ago`, e `29 Ago – 4 Set` quando o recorte cruza o mês.
 *
 * `25/08 – 31/08` diz exatamente a mesma coisa e lê pior: são dez algarismos e três barras para
 * uma informação que o olho quer pegar de relance, e o mês repetido obriga a conferir se os dois
 * números são mesmo iguais. Aqui o mês aparece **uma vez**, no fim, e o dia perde o zero à
 * esquerda — zero à esquerda existe para alinhar coluna, e um rótulo solto não é coluna.
 *
 * O travessão muda com o caso, e não é preciosismo: sem espaço dentro do mesmo mês (`25–31`) o par
 * lê como uma unidade; com espaço entre meses (`29 Ago – 4 Set`) lê como duas datas, que é o que
 * são. É a convenção de intervalo, e é ela que dispensa qualquer palavra ligando os dois lados.
 */
export function intervaloCurto(inicio: string, fim: string): string {
  const [, mesInicio, diaInicio] = inicio.split("-");
  const [, mesFim, diaFim] = fim.split("-");
  const dia = (d: string) => String(Number(d));
  return mesInicio === mesFim
    ? `${dia(diaInicio)}–${dia(diaFim)} ${MESES[Number(mesFim) - 1]}`
    : `${dia(diaInicio)} ${MESES[Number(mesInicio) - 1]} – ${dia(diaFim)} ${MESES[Number(mesFim) - 1]}`;
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

/**
 * Carimbo de evento: `14/03 às 07:04`. Usado na linha do tempo, na observação e na mensagem.
 *
 * O "às" entrou junto com a linha do tempo empilhada (revisão 16). Sem ele, `14/03 07:04` é uma
 * sequência de quatro números que o olho lê como um bloco só — tolerável quando o carimbo estava
 * numa coluna própria, à direita, mas não quando ele passou a ser a **última linha de um evento**,
 * logo abaixo de uma frase. Ali a preposição é o que separa data de hora sem gastar um separador
 * gráfico.
 */
export function carimbo(iso: string): string {
  const d = paraData(iso);
  const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${data} às ${hora(d)}`;
}

/** Carimbo com ano, para quando o evento pode ser antigo: `14/03/2026 às 07:04`. */
export function carimboCompleto(iso: string): string {
  const d = paraData(iso);
  const data = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return `${data} às ${hora(d)}`;
}

/*
 * Data **sem hora** é meia-noite local, nunca UTC.
 *
 * `new Date("2026-03-14")` cai em 00:00Z — que em Brasília é 21:00 **do dia anterior**. Enquanto o
 * `createdAt` dos atendimentos era uma data seca, a linha do tempo mostrava todo "atendimento
 * criado" um dia antes do que foi, sempre às 21:00. Os mocks passaram a gravar hora, mas a guarda
 * fica: é a mesma armadilha que `rotuloDoDia` evita do outro lado, e a regra do arquivo é uma só —
 * data deste produto é lida no fuso de quem lê.
 */
function paraData(iso: string): Date {
  return new Date(iso.includes("T") ? iso : `${iso}T00:00`);
}

function hora(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
