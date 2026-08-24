import {
  ATTENDANCE_STATUS_BLOCK,
  ATTENDANCE_STATUS_LABEL,
  ATTENDANCE_STATUS_SHAPE,
  ATTENDANCE_STATUS_SHORT,
  ATTENDANCE_STATUS_TINT,
  type StatusShape,
} from "../../constants/attendance";
import type { AttendanceStatus } from "../../types";

/*
 * Estado do atendimento (docs/DESIGN_SYSTEM.md, seção 3.1).
 *
 * **Por que isto não é um `<Cracha>`.** O crachá — pastilha redonda com furo de lanyard — é o
 * elemento de assinatura do design system, e continua sendo: ele identifica *uma pessoa*
 * (categoria do cuidador, selo de verificado, registro no conselho). Estado de atendimento não é
 * credencial de ninguém; é a situação de um registro dentro de um sistema. Usar a mesma pastilha
 * para as duas coisas fazia a lista de plantões parecer um mural de etiquetas, e era o que mais
 * empurrava o módulo para a estética de painel genérico.
 *
 * A separação é a regra: **crachá é pessoa, marcador é estado.**
 *
 * O marcador carrega a informação em três eixos ao mesmo tempo — forma, cor e palavra. A forma é
 * a primária, e é ela que faz uma coluna de trinta plantões ser varrida sem leitura: anel vazado
 * espera decisão, ponto está firmado, ponto com halo está acontecendo agora, quadrado cheio
 * encerrou, quadrado vazado caiu.
 */

interface MarcadorProps {
  shape: StatusShape;
  /** `sm` na linha de registro, `md` no crachá quadrado da ficha. */
  size?: "sm" | "md";
}

const LADO = { sm: "size-[7px]", md: "size-2" } as const;

/**
 * A forma sozinha, sem rótulo. `currentColor` em tudo: a tinta vem do contêiner, então o mesmo
 * marcador serve para texto colorido, para o crachá quadrado e para a régua da ficha.
 */
export function MarcadorEstado({ shape, size = "sm" }: MarcadorProps) {
  const lado = LADO[size];

  if (shape === "agora") {
    /* O halo é `ring`, não uma segunda forma: fica exatamente concêntrico e não empurra layout. */
    return (
      <span
        aria-hidden="true"
        className={`${lado} shrink-0 rounded-full bg-current ring-[3px] ring-current/20`}
      />
    );
  }

  const forma: Record<Exclude<StatusShape, "agora">, string> = {
    aguarda: "rounded-full border-[1.5px] border-current",
    firmado: "rounded-full bg-current",
    fechado: "rounded-[1.5px] bg-current",
    caiu: "rounded-[1.5px] border-[1.5px] border-current",
  };

  return <span aria-hidden="true" className={`${lado} shrink-0 ${forma[shape]}`} />;
}

interface StatusProps {
  status: AttendanceStatus;
  /**
   * `linha` — marcador + palavra na tinta do estado, sem fundo. É a forma padrão, e a que
   *   aparece em toda lista de atendimentos.
   * `bloco` — crachá quadrado com fundo `-soft` e borda. Reservado ao cabeçalho da ficha, onde o
   *   estado é a manchete e não um item de coluna.
   * `ponto` — só o marcador, para onde a palavra já está escrita ao lado.
   */
  variant?: "linha" | "bloco" | "ponto";
  className?: string;
}

export function StatusAtendimento({ status, variant = "linha", className = "" }: StatusProps) {
  const shape = ATTENDANCE_STATUS_SHAPE[status];
  const label = ATTENDANCE_STATUS_LABEL[status];
  const tint = ATTENDANCE_STATUS_TINT[status];

  if (variant === "ponto") {
    return (
      <span className={`inline-flex ${tint} ${className}`}>
        <MarcadorEstado shape={shape} />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  if (variant === "bloco") {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-marker border px-2 py-[3px] text-meta font-semibold ${tint} ${ATTENDANCE_STATUS_BLOCK[status]} ${className}`}
      >
        <MarcadorEstado shape={shape} size="md" />
        {label}
      </span>
    );
  }

  /* Na coluna, a forma curta; para leitor de tela, a longa — "Candidaturas" sozinho não diz o
     que aconteceu, e quem ouve a tela não tem a coluna para dar o contexto. */
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-meta font-semibold whitespace-nowrap ${tint} ${className}`}
    >
      <MarcadorEstado shape={shape} />
      <span aria-hidden="true">{ATTENDANCE_STATUS_SHORT[status]}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
