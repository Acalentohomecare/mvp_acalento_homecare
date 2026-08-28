import { Fragment, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Input, SkeletonLista, Tabs, Vazio, type Aba } from "../../components/ui";
import { AttendanceList, AttendanceRow } from "../../components/shared/AttendanceRow";
import { VerDiasDaEscala } from "../../components/shared/SerieDias";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  agruparPorSerie,
  caregiverAttendances,
  isConcluded,
  rotuloDaSerie,
} from "../../services/attendances";
import type { Attendance } from "../../types";
import { PAGE_LIST } from "../../components/layout/page";
import { DE_ATENDIMENTOS } from "../../constants/origem";

/*
 * O histórico de trabalho do cuidador (CLAUDE.md §9 e §11).
 *
 * Faltava, e a falta era estrutural: a agenda era a única lista de atendimentos que o cuidador
 * tinha, e ela só olha para frente. Um plantão concluído — com o registro, a conversa e a
 * avaliação que a empresa deixou — ficava inalcançável assim que o dia passava, e o número
 * "atendimentos concluídos" no Início não tinha para onde levar.
 *
 * É a contraparte de `company/AttendancesPage`, e a divisão de trabalho é a mesma dos dois lados
 * do produto: **agenda é planejamento** (por dia, a partir de uma âncora que anda), **atendimentos
 * é registro** (a lista inteira, com busca e período). Sem essa separação, um filtro de data na
 * agenda faria uma tela só tentar ser as duas — e o cabeçalho de dia grudado, que é o que faz a
 * agenda funcionar, só faz sentido em uma delas.
 *
 * A âncora móvel da escala não desfaz essa divisão: **andar não é filtrar.** A agenda continua
 * mostrando todos os dias do recorte, um a um, inclusive os vazios — que é o que ela existe para
 * mostrar. Filtrar é reduzir a lista a quem casa com um critério, e isso continua morando aqui.
 */

type Filtro = "todos" | "agendados" | "concluidos" | "cancelados";

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "agendados", label: "Agendados" },
  { key: "concluidos", label: "Concluídos" },
  { key: "cancelados", label: "Cancelados" },
];

/*
 * O cuidador não tem rascunho nem plantão em aberto: tudo que chega aqui já é dele. Por isso os
 * recortes são três estados do próprio trabalho — o que vem, o que fechou, o que caiu — e não a
 * fila de publicação que a empresa acompanha.
 */
function combina(attendance: Attendance, filtro: Filtro): boolean {
  switch (filtro) {
    case "agendados":
      return attendance.status === "confirmed" || attendance.status === "in_progress";
    case "concluidos":
      return isConcluded(attendance);
    case "cancelados":
      return attendance.status === "cancelled";
    default:
      return true;
  }
}

export function CaregiverAttendancesPage() {
  const { session } = useSession();
  const { state } = useAppState();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  /* Só governa o celular: a partir de `md` a busca e o período ficam sempre visíveis. */
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  /* Mesma regra da lista da empresa: escala é um item só até alguém querer ver dia a dia. */
  const [escalasAbertas, setEscalasAbertas] = useState<string[]>([]);

  /* Do mais recente para o mais antigo: aqui a pergunta é "o que eu fiz", e a resposta começa
     pelo último plantão. É o inverso da agenda, onde a pergunta é "o que vem". */
  const todos = useMemo(
    () =>
      state
        ? [...caregiverAttendances(state, session?.caregiverId)].sort((a, b) =>
            `${b.startDate}T${b.startTime}`.localeCompare(`${a.startDate}T${a.startTime}`),
          )
        : [],
    [state, session?.caregiverId],
  );

  if (!state) {
    return (
      <div className={PAGE_LIST}>
        <h1 className="text-display">Atendimentos</h1>
        <div className="mt-6">
          <SkeletonLista />
        </div>
      </div>
    );
  }

  const patientName = (id: string) => state.patients.find((p) => p.id === id)?.name ?? "Paciente";
  const companyName = (id: string) => state.companies.find((c) => c.id === id)?.name;

  const term = query.trim().toLowerCase();
  /* O recorte de texto e período vale para a contagem de todas as abas: a contagem precisa dizer
     quanto existe **dentro do filtro corrente**, senão a aba promete dez e entrega dois. */
  const noRecorte = todos.filter((a) => {
    if (term && !patientName(a.patientId).toLowerCase().includes(term)) return false;
    if (dateFrom && a.startDate < dateFrom) return false;
    if (dateTo && a.startDate > dateTo) return false;
    return true;
  });
  const visiveis = noRecorte.filter((a) => combina(a, filtro));
  const filtrosAtivos = [query, dateFrom, dateTo].filter(Boolean).length;

  const abas: Aba<Filtro>[] = FILTROS.map((f) => ({
    key: f.key,
    label: f.label,
    count: noRecorte.filter((a) => combina(a, f.key)).length,
  }));

  const limparFiltros = () => {
    setQuery("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className={PAGE_LIST}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display">Atendimentos</h1>
          <p className="prosa mt-1 text-body text-ink-subtle">
            Todos os atendimentos que você assumiu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFiltrosAbertos((v) => !v)}
          aria-expanded={filtrosAbertos}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-control border border-linha bg-surface-raised px-3.5 text-note font-semibold text-ink-muted transition-colors duration-150 ease-out hover:border-accent/45 hover:text-ink md:hidden"
        >
          <SlidersHorizontal size={15} />
          Filtros
          {filtrosAtivos > 0 && (
            <span className="numero rounded-marker bg-accent px-1.5 py-px text-meta leading-[1.4] text-accent-ink">
              {filtrosAtivos}
            </span>
          )}
        </button>
      </div>

      {/* Recolhidos atrás de "Filtros" no celular pelo mesmo motivo da lista da empresa: quem abre
          o histórico quer ver os plantões primeiro, não filtrá-los. */}
      <div
        className={`${filtrosAbertos ? "mt-4 grid" : "hidden"} gap-2.5 md:mt-5 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]`}
      >
        <Input
          label="Paciente"
          placeholder="Buscar por nome"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Input label="De" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input label="Até" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <Tabs
        abas={abas}
        atual={filtro}
        onChange={setFiltro}
        label="Recorte dos atendimentos"
        className="mt-5"
      />

      {/* Quanto está visível e, quando há filtro, a saída para desfazê-lo. Sem essa saída, lista
          vazia por filtro vira beco. */}
      <div className="mt-3 mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="text-meta text-ink-subtle">
          {visiveis.length === todos.length
            ? `${todos.length} ${todos.length === 1 ? "atendimento" : "atendimentos"}`
            : `${visiveis.length} de ${todos.length} ${todos.length === 1 ? "atendimento" : "atendimentos"}`}
        </p>
        {filtrosAtivos > 0 && (
          <button
            type="button"
            onClick={limparFiltros}
            className="inline-flex min-h-11 items-center gap-1 text-meta font-semibold text-accent transition-colors duration-150 ease-out hover:text-accent-strong pointer-fine:min-h-6"
          >
            <X size={12} /> Limpar filtros
          </button>
        )}
      </div>

      <AttendanceList>
        {visiveis.length === 0 ? (
          <li>
            <Vazio
              acao={
                filtrosAtivos > 0 ? (
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="text-note font-semibold text-accent underline decoration-accent/40 underline-offset-2"
                  >
                    Limpar filtros
                  </button>
                ) : undefined
              }
            >
              {filtro === "todos" && filtrosAtivos === 0
                ? "Você ainda não assumiu nenhum atendimento. Os convites que receber aparecem em Convites."
                : filtrosAtivos > 0
                  ? "Nenhum atendimento neste recorte. Os outros continuam na lista — é o filtro que está estreito."
                  : "Nenhum atendimento neste recorte."}
            </Vazio>
          </li>
        ) : (
          agruparPorSerie(visiveis).map((linha) =>
            linha.tipo === "atendimento" ? (
              <AttendanceRow
                key={linha.atendimento.id}
                attendance={linha.atendimento}
                to={`/cuidador/atendimentos/${linha.atendimento.id}`}
                state={DE_ATENDIMENTOS}
                patientName={patientName(linha.atendimento.patientId)}
                /* Camada 4 — por qual empresa foi o atendimento. O cuidador pode estar aprovado em
                   mais de uma (Sandra está nas duas), e no histórico é isso que diz com quem falar
                   sobre um atendimento antigo. Na lista da empresa esta camada não existe: lá a
                   empresa é sempre a mesma, e repeti-la em toda linha seria ruído. */
                note={companyName(linha.atendimento.companyId)}
              />
            ) : (
              /* A escala que ele assumiu é uma contratação, não sessenta registros: entra como uma
                 linha e abre no lugar. O histórico dele tem meses de trabalho — sem agrupar, uma
                 escala apagaria todo o resto da lista. */
              <Fragment key={linha.serie.seriesId}>
                <AttendanceRow
                  attendance={linha.serie.representante}
                  to={`/cuidador/atendimentos/${linha.serie.representante.id}`}
                  state={DE_ATENDIMENTOS}
                  patientName={patientName(linha.serie.representante.patientId)}
                  note={`${companyName(linha.serie.representante.companyId)} · ${rotuloDaSerie(linha.serie)}`}
                  actions={
                    <VerDiasDaEscala
                      total={linha.serie.membros.length}
                      aberta={escalasAbertas.includes(linha.serie.seriesId)}
                      onToggle={() =>
                        setEscalasAbertas((prev) =>
                          prev.includes(linha.serie.seriesId)
                            ? prev.filter((id) => id !== linha.serie.seriesId)
                            : [...prev, linha.serie.seriesId],
                        )
                      }
                    />
                  }
                />
                {escalasAbertas.includes(linha.serie.seriesId) &&
                  linha.serie.membros
                    .filter((m) => m.id !== linha.serie.representante.id)
                    .map((m) => (
                      <AttendanceRow
                        key={m.id}
                        attendance={m}
                        to={`/cuidador/atendimentos/${m.id}`}
                        state={DE_ATENDIMENTOS}
                        patientName={patientName(m.patientId)}
                      />
                    ))}
              </Fragment>
            ),
          )
        )}
      </AttendanceList>
    </div>
  );
}
