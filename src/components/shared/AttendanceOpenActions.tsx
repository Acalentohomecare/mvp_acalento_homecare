import { Link } from "react-router-dom";
import { ACTION_LINK_CLASS } from "../ui";
import { isAwaitingCaregiver } from "../../services/attendances";
import type { Attendance } from "../../types";

interface AttendanceOpenActionsProps {
  attendance: Attendance;
  applicationsCount: number;
}

/**
 * Ações de "Buscar cuidadores" / "Candidaturas" sobre um atendimento — repetidas ao pé de cada
 * card onde a lista de atendimentos aparece (Atendimentos, Início). Extraída para não haver uma
 * segunda cópia divergindo da primeira, como já tinha acontecido com `ACTION_LINK_CLASS`.
 */
export function AttendanceOpenActions({ attendance, applicationsCount }: AttendanceOpenActionsProps) {
  return (
    <>
      {isAwaitingCaregiver(attendance) && (
        <Link to={`/empresa/atendimentos/${attendance.id}/cuidadores`} className={ACTION_LINK_CLASS}>
          Buscar cuidadores
        </Link>
      )}
      <Link to={`/empresa/atendimentos/${attendance.id}/candidaturas`} className={ACTION_LINK_CLASS}>
        Candidaturas{applicationsCount > 0 && ` (${applicationsCount})`}
      </Link>
    </>
  );
}
