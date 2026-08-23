import type { ReactNode } from "react";
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
  actions,
}: AttendanceCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
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

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-note text-ink-muted">
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

      <div className="mt-2 inline-flex items-center gap-1 text-note">
        <UserRound size={12} className="text-ink-subtle" />
        {caregiverName ? (
          <span className="text-ink-muted">{caregiverName}</span>
        ) : (
          <span className="text-ink-subtle">Sem cuidador definido</span>
        )}
      </div>

      {actions && <div className="mt-2.5 flex flex-wrap gap-2">{actions}</div>}
    </Card>
  );
}
