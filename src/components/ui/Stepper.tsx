import { Fragment } from "react";

interface StepperProps {
  steps: string[];
  currentIndex: number;
}

/**
 * Stepper horizontal de progresso do atendimento (docs/DESIGN_SYSTEM.md, seção 7). O estado do
 * atendimento nunca depende só de cor: a etapa atual é dita por posição, por peso do texto e
 * pelo tamanho do marcador, além do tom.
 */
export function Stepper({ steps, currentIndex }: StepperProps) {
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
      <div className="mt-1.5 flex">
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
