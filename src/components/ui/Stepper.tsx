import { Fragment } from "react";

interface StepperProps {
  steps: string[];
  currentIndex: number;
}

/**
 * Régua de progresso do atendimento (docs/DESIGN_SYSTEM.md, seção 7.4).
 *
 * Estava documentada e **não era usada por tela nenhuma** — a ficha do atendimento mostrava o
 * estado como uma etiqueta solta, sem dizer o que já passou nem o que falta. Passou a ser o
 * cabeçalho da ficha na revisão do módulo, que é o lugar para o qual ela sempre foi escrita.
 *
 * O estado nunca depende só de cor: a etapa atual é dita por **posição**, pelo peso do texto e
 * pelo tamanho do marcador, além do tom.
 *
 * ------------------------------------------------------------------- tela pequena
 *
 * Seis rótulos em colunas de largura igual dão ~48px cada num telefone de 320px, e "Confirmado"
 * precisa de 65px: a fila quebrava no meio da palavra. Abaixo de `sm` os rótulos somem e sobra
 * **uma frase** — "Etapa 3 de 6 · Confirmado" —, que diz a mesma coisa em menos espaço. Os
 * marcadores continuam, porque é deles que vem a leitura de quanto já andou.
 */
export function Stepper({ steps, currentIndex }: StepperProps) {
  const atual = steps[currentIndex];

  return (
    <div>
      <div className="flex items-center">
        {steps.map((step, i) => (
          <Fragment key={step}>
            <div
              /* `transition-colors` sozinho não anima o que muda aqui: o marcador cresce de
                 `size-2.5` para `size-3.5`, e isso é `width`/`height`. Os 200ms da seção 6 são
                 justamente a duração reservada para mudança de tamanho. */
              className={`shrink-0 rounded-full transition-[width,height,background-color,box-shadow] duration-200 ease-out ${
                i < currentIndex
                  ? "size-2.5 bg-accent"
                  : i === currentIndex
                    ? "ring-accent/20 size-3.5 bg-accent ring-4"
                    : "size-2.5 bg-linha"
              }`}
            />
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 ${i < currentIndex ? "bg-accent/45" : "bg-linha"}`} />
            )}
          </Fragment>
        ))}
      </div>

      {/* Celular: a frase. */}
      <p className="mt-2 text-meta text-ink-subtle sm:hidden">
        Etapa <span className="numero">{currentIndex + 1}</span> de{" "}
        <span className="numero">{steps.length}</span> ·{" "}
        <span className="font-semibold text-accent">{atual}</span>
      </p>

      {/* `sm` para cima: a fila completa. */}
      <div className="mt-1.5 hidden sm:flex">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`flex-1 px-1 text-center text-meta ${
              i === currentIndex ? "font-semibold text-accent" : "text-ink-subtle"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
