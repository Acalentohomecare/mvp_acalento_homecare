import { useState } from "react";
import { Download } from "lucide-react";
import { Button, Input, Select } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { companyPatients } from "../../services/patients";
import { buildReport, reportToCsv, reportTotals, type ReportFilters } from "../../services/reports";
import { formatCurrency } from "../../utils/format";

function hours(value: number): string {
  return `${value.toFixed(1).replace(".", ",")}h`;
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

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink/50">Carregando…</div>
    );
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

  const exportCsv = () => {
    const blob = new Blob([`﻿${reportToCsv(rows)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-horas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold">Relatório de horas</h1>
          <p className="mt-1 text-[12.5px] text-ink/50">
            Calculado a partir dos check-ins e check-outs registrados.
          </p>
        </div>
        <Button variant="primary" onClick={exportCsv} disabled={rows.length === 0}>
          <Download size={15} /> Exportar CSV
        </Button>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
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

      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-linha bg-linha sm:grid-cols-4">
        {[
          { label: "Atendimentos", value: String(totals.attendances) },
          { label: "Horas previstas", value: hours(totals.plannedHours) },
          { label: "Horas realizadas", value: hours(totals.workedHours) },
          { label: "Valor estimado", value: formatCurrency(totals.value) },
        ].map((item) => (
          <div key={item.label} className="bg-surface-raised px-3.5 py-3">
            <div className="text-[10px] tracking-wide text-ink/40 uppercase">{item.label}</div>
            <div className="mt-1 font-mono text-[15px] leading-none">{item.value}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-[14px] border border-dashed border-linha py-10 text-center text-[12.5px] text-ink/45">
          Nenhum atendimento concluído nesse filtro.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-linha text-[10.5px] tracking-wide text-ink/40 uppercase">
                <th className="py-2 font-semibold">Data</th>
                <th className="py-2 font-semibold">Cuidador</th>
                <th className="py-2 font-semibold">Paciente</th>
                <th className="py-2 text-right font-semibold">Previsto</th>
                <th className="py-2 text-right font-semibold">Realizado</th>
                <th className="py-2 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.attendanceId} className="border-b border-linha last:border-0">
                  <td className="py-2 font-mono">{r.date.split("-").reverse().join("/")}</td>
                  <td className="py-2">{r.caregiverName}</td>
                  <td className="py-2">{r.patientName}</td>
                  <td className="py-2 text-right font-mono">{hours(r.plannedHours)}</td>
                  <td className="py-2 text-right font-mono">{hours(r.workedHours)}</td>
                  <td className="py-2 text-right font-mono">{formatCurrency(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
