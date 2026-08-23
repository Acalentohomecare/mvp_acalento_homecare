import { useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import { Button, Input, Select, TelaCarregando } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { companyPatients } from "../../services/patients";
import { buildReport, reportToCsv, reportTotals, type ReportFilters } from "../../services/reports";
import { formatCurrency } from "../../utils/format";
import { PAGE_LIST } from "../../components/layout/page";

function hours(value: number): string {
  return `${value.toFixed(1).replace(".", ",")}h`;
}

function brDate(iso: string): string {
  return iso.split("-").reverse().join("/");
}

export function ReportsPage() {
  const { session } = useSession();
  const { state } = useAppState();
  const [filters, setFilters] = useState<ReportFilters>({
    from: "",
    to: "",
    caregiverId: "",
    patientId: "",
  });
  /* Só governa o celular: a partir de `md` os filtros ficam sempre visíveis. */
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  if (!state) {
    return <TelaCarregando />;
  }

  const rows = buildReport(state, session?.companyId, filters);
  const totals = reportTotals(rows);
  const patients = companyPatients(state, session?.companyId);
  const caregiverIds = [
    ...new Set(
      state.attendances
        .filter((a) => a.companyId === session?.companyId && a.confirmedCaregiverId)
        .map((a) => a.confirmedCaregiverId as string),
    ),
  ];

  const set = (patch: Partial<ReportFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const filtrosAtivos = Object.values(filters).filter(Boolean).length;

  const exportCsv = () => {
    const blob = new Blob([`﻿${reportToCsv(rows)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-horas.csv";
    link.click();
    // Revogar no mesmo quadro cancela o download em Firefox e Safari antes de ele começar.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <div className={PAGE_LIST}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display">Relatório de horas</h1>
          <p className="prosa mt-1 text-body text-ink-subtle">
            Calculado a partir dos check-ins e check-outs registrados.
          </p>
        </div>
        {/* No celular as duas ações dividem uma linha só, embaixo do título; no desktop
            "Exportar" volta para a direita do título e "Filtros" desaparece — lá os campos
            ficam sempre abertos. */}
        <div className="flex w-full gap-2 md:w-auto">
          <button
            type="button"
            onClick={() => setFiltrosAbertos((v) => !v)}
            aria-expanded={filtrosAbertos}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border border-linha bg-surface-raised px-3.5 text-note font-semibold text-ink-muted shadow-card transition-colors duration-150 ease-out hover:border-accent/45 hover:text-ink md:hidden"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 numero text-meta leading-none text-accent-ink">
                {filtrosAtivos}
              </span>
            )}
          </button>
          <Button
            variant="primary"
            className="flex-1 md:flex-none"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            <Download size={15} /> Exportar CSV
          </Button>
        </div>
      </div>

      {/*
        Quatro campos de filtro empilhados empurram o relatório inteiro para fora da tela do
        celular — e quem abre esta tela quer primeiro **ver as horas**, não filtrá-las. No celular
        eles recolhem atrás de um botão que diz quantos estão ativos; a partir de `md` ficam
        sempre à vista, porque lá a largura não é disputada.
      */}
      <div
        className={`${filtrosAbertos ? "mt-4 grid" : "hidden"} gap-2.5 md:mt-5 md:grid md:grid-cols-2 lg:grid-cols-4`}
      >
        <Input label="De" type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} />
        <Input label="Até" type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} />
        <Select
          label="Cuidador"
          value={filters.caregiverId}
          onChange={(e) => set({ caregiverId: e.target.value })}
        >
          <option value="">Todos</option>
          {caregiverIds.map((id) => (
            <option key={id} value={id}>
              {state.caregivers.find((c) => c.id === id)?.name ?? id}
            </option>
          ))}
        </Select>
        <Select
          label="Paciente"
          value={filters.patientId}
          onChange={(e) => set({ patientId: e.target.value })}
        >
          <option value="">Todos</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-linha bg-linha sm:grid-cols-4">
        {[
          { label: "Atendimentos", value: String(totals.attendances) },
          { label: "Horas previstas", value: hours(totals.plannedHours) },
          { label: "Horas realizadas", value: hours(totals.workedHours) },
          { label: "Valor estimado", value: formatCurrency(totals.value) },
        ].map((item) => (
          <div key={item.label} className="bg-surface-raised px-3.5 py-3">
            <div className="text-dado text-ink-subtle uppercase">{item.label}</div>
            <div className="mt-1 numero text-body leading-none">{item.value}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-card border border-dashed border-linha py-10 text-center text-body text-ink-subtle">
          Nenhum atendimento concluído nesse filtro.
        </p>
      ) : (
        <>
          {/*
            A mesma informação, em duas formas.

            No celular, cada linha vira um registro: o paciente é o título, o valor fica à
            direita, e previsto/realizado ficam embaixo como um par — que é a leitura que importa
            num relatório de horas. Seis colunas roladas na horizontal obrigavam a arrastar para
            ver justamente a coluna que responde a pergunta da tela.

            A partir de `md`, tabela: com largura sobrando, a grade alinhada é mais rápida de
            varrer do que quinze cartões, e é assim que a coordenadora confere fechamento.
          */}
          <ul className="mt-5 flex flex-col gap-2.5 md:hidden">
            {rows.map((r) => (
              <li
                key={r.attendanceId}
                className="rounded-card border border-linha bg-surface-raised p-3.5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-note font-semibold">{r.patientName}</p>
                    <p className="mt-0.5 truncate text-meta text-ink-subtle">{r.caregiverName}</p>
                  </div>
                  <span className="shrink-0 numero text-note font-semibold">
                    {formatCurrency(r.value)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-x-4 gap-y-1 border-t border-linha pt-2 text-meta">
                  <span className="numero text-ink-subtle">{brDate(r.date)}</span>
                  <span className="ml-auto text-ink-subtle">
                    Previsto <span className="numero text-ink">{hours(r.plannedHours)}</span>
                  </span>
                  <span className="text-ink-subtle">
                    Realizado{" "}
                    <span className="numero font-semibold text-ink">{hours(r.workedHours)}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-note">
              <caption className="sr-only">Horas por atendimento no período filtrado</caption>
              <thead>
                <tr className="border-b border-linha text-dado text-ink-muted uppercase">
                  <th scope="col" className="py-2 font-semibold">Data</th>
                  <th scope="col" className="py-2 font-semibold">Cuidador</th>
                  <th scope="col" className="py-2 font-semibold">Paciente</th>
                  <th scope="col" className="py-2 text-right font-semibold">Previsto</th>
                  <th scope="col" className="py-2 text-right font-semibold">Realizado</th>
                  <th scope="col" className="py-2 text-right font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.attendanceId} className="border-b border-linha last:border-0">
                    <td className="py-2 numero">{brDate(r.date)}</td>
                    <td className="py-2">{r.caregiverName}</td>
                    <td className="py-2">{r.patientName}</td>
                    <td className="py-2 text-right numero">{hours(r.plannedHours)}</td>
                    <td className="py-2 text-right numero">{hours(r.workedHours)}</td>
                    <td className="py-2 text-right numero">{formatCurrency(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
