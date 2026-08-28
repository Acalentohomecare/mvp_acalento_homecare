import { ChevronDown } from "lucide-react";
import { ROW_ACTION_CLASS } from "../ui";

/**
 * O botão que abre os dias de uma escala dentro da lista (camada 5 da linha de registro).
 *
 * Uma escala fixa chega às listas como **uma** linha — a alternativa seria sessenta registros
 * iguais empurrando o resto da tela para fora. Mas a linha resumida esconde os dias, e há
 * perguntas que só o dia responde ("em qual deles ela não fez check-in?"). Este botão é a saída:
 * a lista continua curta por padrão e abre onde a pessoa quiser olhar.
 *
 * Mora ao lado das ações do plantão em aberto, com a mesma tinta e o mesmo tamanho, porque é a
 * mesma camada — o que dá para fazer a partir desta linha.
 */
export function VerDiasDaEscala({
  total,
  aberta,
  onToggle,
}: {
  total: number;
  aberta: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={aberta} className={ROW_ACTION_CLASS}>
      {aberta ? "Ocultar os dias" : `Ver os ${total} dias`}
      <ChevronDown
        size={13}
        aria-hidden="true"
        className={`ml-1 inline-block transition-transform duration-150 ease-out ${
          aberta ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}
