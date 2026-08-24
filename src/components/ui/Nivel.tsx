import { NIVEL_PONTO, NIVEL_ROTULO, type Nivel } from "../../constants/nivel";

/*
 * Ponto de nível (docs/DESIGN_SYSTEM.md, seção 3.2).
 *
 * O indexador da linha: diz **quanto** aquela linha pesa, sem competir com o texto que a
 * descreve. Era um ponto de 6px pintado direto no JSX do dashboard, com a cor decidida por um
 * booleano; virou 5px e uma escala de quatro níveis que vale para o produto inteiro.
 *
 * Cinco pixels não é preciosismo. Ao lado de um texto de 14px, o ponto de 6px lê como marcador de
 * lista — vira o primeiro elemento que o olho encontra, quando o trabalho dele é ser o segundo.
 *
 * Não tem variante grande, e é de propósito: onde o nível precisa ser a manchete, o elemento
 * certo é o `<Aviso>` (faixa com ícone e texto), não um ponto maior.
 */

interface PontoNivelProps {
  nivel: Nivel;
  /** Alinhamento com a primeira linha do texto ao lado — quem chama sabe a entrelinha dela. */
  className?: string;
}

export function PontoNivel({ nivel, className = "" }: PontoNivelProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`size-[5px] shrink-0 rounded-full ${NIVEL_PONTO[nivel]} ${className}`}
      />
      <span className="sr-only">{NIVEL_ROTULO[nivel]}: </span>
    </>
  );
}
