import { Contador } from "./Painel";

/*
 * Abas de recorte (docs/DESIGN_SYSTEM.md, seção 9.4).
 *
 * O filtro do módulo de Atendimentos era uma fila de `<Chip>` — pastilhas de 999px, a selecionada
 * pintada de teal cheio. Cinco pastilhas coloridas no topo de uma lista competem com a lista, e
 * pílula é a forma que este redesenho está tirando de circulação.
 *
 * A aba sublinhada é o vocabulário de recorte de software operacional: o item aceso é dito por
 * **posição e traço**, não por um bloco de cor; a contagem entra ao lado do rótulo porque quem
 * escolhe um recorte quer saber quanto tem dentro dele antes de clicar.
 *
 * `<Chip>` continua vivo, e continua sendo o certo para **seleção**: dia da semana, turno,
 * atividade — vários acesos ao mesmo tempo, sem noção de "aba atual".
 *
 * A fila rola na horizontal no celular pelo mesmo motivo do `<FilterRow>`: quebrar em duas linhas
 * gasta metade da altura útil antes do primeiro registro.
 */

export interface Aba<T extends string> {
  key: T;
  label: string;
  /** Contagem do recorte. `undefined` esconde a pastilha; `0` mostra o zero, que é informação. */
  count?: number;
}

interface TabsProps<T extends string> {
  abas: Aba<T>[];
  atual: T;
  onChange: (key: T) => void;
  /** Rótulo do grupo para leitor de tela — ex.: "Recorte dos atendimentos". */
  label: string;
  className?: string;
}

export function Tabs<T extends string>({ abas, atual, onChange, label, className = "" }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      /* A linha de base corre por baixo de todas as abas e continua até a borda da página: é ela
         que amarra a fila ao conteúdo abaixo. Sem ela, as abas flutuam. */
      className={`-mx-6 flex gap-0.5 overflow-x-auto border-b border-linha px-6 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {abas.map((aba) => {
        const aceso = aba.key === atual;
        return (
          <button
            key={aba.key}
            type="button"
            role="tab"
            aria-selected={aceso}
            onClick={() => onChange(aba.key)}
            /* O traço é `border-b-2` com `-mb-px` para cobrir a linha de base do contêiner, e o
               inativo carrega a mesma borda em transparente — assim a aba não muda de altura ao
               acender, que é o pulo que mais denuncia componente montado às pressas. */
            className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 text-note font-semibold whitespace-nowrap transition-colors duration-150 ease-out pointer-fine:min-h-9 ${
              aceso
                ? "-mb-px border-accent text-accent"
                : "-mb-px border-transparent text-ink-subtle hover:border-linha-strong hover:text-ink"
            }`}
          >
            {aba.label}
            {aba.count !== undefined && (
              <Contador
                valor={aba.count}
                className={aceso ? "bg-accent-soft text-accent" : ""}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
