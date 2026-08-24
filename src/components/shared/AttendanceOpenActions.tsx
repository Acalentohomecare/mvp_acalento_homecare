import { Link } from "react-router-dom";
import { ROW_ACTION_CLASS } from "../ui";
import { isAwaitingCaregiver } from "../../services/attendances";
import type { Attendance } from "../../types";

interface AttendanceOpenActionsProps {
  attendance: Attendance;
  applicationsCount: number;
}

/**
 * Ações de "Buscar cuidadores" / "Candidaturas" sobre um atendimento — repetidas ao pé de cada
 * linha onde a lista de atendimentos aparece (Atendimentos, Início). Extraída para não haver uma
 * segunda cópia divergindo da primeira, como já tinha acontecido com `ACTION_LINK_CLASS`.
 *
 * Passaram de botões com borda a links de texto (`ROW_ACTION_CLASS`) quando o card virou linha:
 * dois retângulos por registro, em quinze registros, somavam trinta molduras dentro de uma lista
 * que a moldura externa já delimita.
 */
export function AttendanceOpenActions({ attendance, applicationsCount }: AttendanceOpenActionsProps) {
  return (
    <>
      {isAwaitingCaregiver(attendance) && (
        <Link to={`/empresa/atendimentos/${attendance.id}/cuidadores`} className={ROW_ACTION_CLASS}>
          Buscar cuidadores
        </Link>
      )}
      <Link to={`/empresa/atendimentos/${attendance.id}/candidaturas`} className={ROW_ACTION_CLASS}>
        Candidaturas{applicationsCount > 0 && ` (${applicationsCount})`}
      </Link>
    </>
  );
}
