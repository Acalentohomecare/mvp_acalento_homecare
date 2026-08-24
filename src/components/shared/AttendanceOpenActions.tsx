import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ROW_ACTION_CLASS } from "../ui";
import { isAwaitingCaregiver } from "../../services/attendances";
import type { Attendance } from "../../types";

interface AttendanceOpenActionsProps {
  attendance: Attendance;
  applicationsCount: number;
}

/**
 * A camada 5 da linha de registro (docs/DESIGN_SYSTEM.md, seção 9.0): o que dá para fazer sobre um
 * plantão que ainda espera cuidador. Repetida ao pé de cada linha onde a lista de atendimentos
 * aparece — Atendimentos e Início —, e extraída para não haver uma segunda cópia divergindo da
 * primeira, como já tinha acontecido com `ACTION_LINK_CLASS`.
 *
 * Passaram de botões com borda a links de texto (`ROW_ACTION_CLASS`) quando o card virou linha:
 * dois retângulos por registro, em quinze registros, somavam trinta molduras dentro de uma lista
 * que a moldura externa já delimita.
 *
 * **O ponto médio entre elas não é decoração.** Ele é o que faz duas ações lerem como uma barra de
 * ações e não como duas frases soltas que por acaso caíram perto. Antes o que as separava era só o
 * `gap` do contêiner, e nessa mesma faixa também morava o recado "1 compatível no quadro" — texto
 * neutro ao lado de texto clicável, com 12px entre eles: a informação parecia link e os links
 * pareciam continuação da informação. O recado subiu para a camada 4, as ações ficaram sozinhas na
 * 5, e o ponto médio marca que as duas pertencem ao mesmo grupo.
 *
 * A contagem entra entre parênteses no rótulo — "Candidaturas (2)" —, e é esse o lugar dela: uma
 * contagem é informação sobre a ação, não o **estado** do atendimento. Enquanto "Candidaturas" era
 * também o rótulo do estado `applications_received`, a mesma palavra dizia duas coisas em duas
 * camadas diferentes da mesma linha.
 */
export function AttendanceOpenActions({ attendance, applicationsCount }: AttendanceOpenActionsProps) {
  /* Uma lista, e não dois JSX soltos com um `&&` no meio: o separador precisa saber se existe algo
     antes dele. Com o `&&`, "Buscar cuidadores" ausente deixava um ponto médio órfão abrindo a
     linha — o tipo de detalhe que só aparece no plantão já convidado, que é justamente o que menos
     se olha durante uma apresentação. */
  const acoes = [
    ...(isAwaitingCaregiver(attendance)
      ? [
          {
            key: "buscar",
            to: `/empresa/atendimentos/${attendance.id}/cuidadores`,
            label: "Buscar cuidadores",
          },
        ]
      : []),
    {
      key: "candidaturas",
      to: `/empresa/atendimentos/${attendance.id}/candidaturas`,
      label:
        applicationsCount > 0 ? `Candidaturas (${applicationsCount})` : "Candidaturas",
    },
  ];

  return (
    <>
      {acoes.map((acao, i) => (
        <Fragment key={acao.key}>
          {i > 0 && (
            <span aria-hidden="true" className="text-ink-subtle/70 select-none">
              ·
            </span>
          )}
          <Link to={acao.to} className={ROW_ACTION_CLASS}>
            {acao.label}
          </Link>
        </Fragment>
      ))}
    </>
  );
}
