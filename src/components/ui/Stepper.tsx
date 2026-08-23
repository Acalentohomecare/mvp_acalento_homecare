import { Fragment } from "react";

interface StepperProps {
  steps: string[];
  currentIndex: number;
}

/** Stepper horizontal de progresso do atendimento (docs/DESIGN_SYSTEM.md, seção 4). */
export function Stepper({ steps, currentIndex }: StepperProps) {
  return (
    <div>
      <div className="flex items-center">
        {steps.map((step, i) => (
          <Fragment key={step}>
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                i < currentIndex
                  ? "bg-cat-informal"
                  : i === currentIndex
                    ? "bg-accent"
                    : "bg-linha"
              }`}
            />
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${i < currentIndex ? "bg-cat-informal" : "bg-linha"}`}
              />
            )}
          </Fragment>
        ))}
      </div>
      <div className="mt-1 flex">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`flex-1 px-1 text-center text-meta ${
              i === currentIndex ? "font-semibold text-ink" : "text-ink/50"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
