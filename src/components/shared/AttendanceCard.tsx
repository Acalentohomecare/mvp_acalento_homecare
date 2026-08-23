import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, UserRound } from "lucide-react";
import { Card, Cracha } from "../ui";
import {
  ATTENDANCE_STATUS_CLASS,
  ATTENDANCE_STATUS_LABEL,
  ATTENDANCE_TYPE_LABEL,
} from "../../constants/attendance";
import { formatCurrency } from "../../utils/format";
import type { Attendance } from "../../types";

interface AttendanceCardProps {
  attendance: Attendance;
  patientName: string;
  caregiverName?: string;
  /** Quando presente junto de `caregiverName`, o nome do cuidador vira link para o perfil dele. */
  caregiverId?: string;
  /** Recado curto sobre o atendimento — ex.: quantos cuidadores compatíveis já existem no quadro. */
  note?: ReactNode;
  /** Ações da empresa sobre o atendimento (buscar cuidadores, ver candidaturas). */
  actions?: ReactNode;
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function AttendanceCard({
  attendance,
  patientName,
  caregiverName,
  caregiverId,
  note,
  actions,
}: AttendanceCardProps) {
  return (
    <Card className="relative transition-[border-color,box-shadow] duration-150 ease-out hover:border-accent/45 hover:shadow-raised">
      {/*
        O card inteiro abre a ficha do atendimento (paciente + plantão) — inclusive a área que
        não tem link nenhum, como o nome do paciente e a faixa de data/hora. Como o cuidador e as
        ações já são links próprios dentro do card, não dá para envolver tudo num `<Link>` (âncora
        dentro de âncora é inválido); em vez disso este link ocupa o card inteiro por baixo, e
        cada link aninhado ganha `relative` para ficar por cima dele e continuar clicável.
      */}
      <Link
        to={`/empresa/atendimentos/${attendance.id}`}
        className="absolute inset-0 z-0 rounded-card"
        aria-label={`Ver ficha de ${patientName}`}
      />

      <div className="pointer-events-none flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-title">{patientName}</div>
          <div className="mt-0.5 text-note text-ink-subtle">
            {ATTENDANCE_TYPE_LABEL[attendance.type]} ·&nbsp;{attendance.durationHours}h
          </div>
        </div>
        <Cracha
          label={ATTENDANCE_STATUS_LABEL[attendance.status]}
          className={ATTENDANCE_STATUS_CLASS[attendance.status]}
        />
      </div>

      <div className="pointer-events-none mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-note text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} className="text-ink-subtle" />
          <span className="numero">{formatDate(attendance.startDate)}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} className="text-ink-subtle" />
          <span className="numero">{attendance.startTime}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} className="text-ink-subtle" />
          {attendance.neighborhood}
        </span>
        <span className="ml-auto numero text-ink-muted">{formatCurrency(attendance.value)}</span>
      </div>

      <div className="relative z-10 mt-2 inline-flex items-center gap-1 text-note">
        <UserRound size={12} className="text-ink-subtle" />
        {caregiverName && caregiverId ? (
          <Link
            to={`/empresa/cuidadores/${caregiverId}`}
            className="text-ink-muted underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:text-accent hover:decoration-accent/40"
          >
            {caregiverName}
          </Link>
        ) : caregiverName ? (
          <span className="text-ink-muted">{caregiverName}</span>
        ) : (
          <span className="text-ink-subtle">Sem cuidador definido</span>
        )}
      </div>

      {note && <div className="pointer-events-none relative mt-2 text-note">{note}</div>}

      {actions && (
        <div className="relative z-10 mt-2.5 flex flex-wrap gap-2">{actions}</div>
      )}
    </Card>
  );
}
