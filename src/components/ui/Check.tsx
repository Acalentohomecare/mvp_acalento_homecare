import type { InputHTMLAttributes } from "react";

interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

/**
 * Caixa de marcação com rótulo (docs/DESIGN_SYSTEM.md, seção 11).
 *
 * Existia copiada em três telas — atividades do novo atendimento, tarefas do registro e
 * atividades do perfil do cuidador — sempre como `size-4` dentro de uma linha de ~24px. Marcar
 * tarefa concluída na casa do paciente é a interação mais repetida do cuidador no celular, e ela
 * estava com metade do alvo mínimo.
 *
 * O alvo aqui é de **ponteiro, não de largura**: a linha tem 44px onde o dedo é o ponteiro e
 * volta à densidade de leitura onde existe mouse. Um tablet de 1024px é largo e continua sendo
 * dedo — a régua antiga (`md:`) errava exatamente esse caso.
 */
export function Check({ label, className = "", ...props }: CheckProps) {
  return (
    <label className="flex min-h-11 items-center gap-2.5 text-body text-ink-muted pointer-fine:min-h-0 pointer-fine:gap-2">
      <input
        type="checkbox"
        className={`size-5 shrink-0 accent-accent pointer-fine:size-4 ${className}`}
        {...props}
      />
      {label}
    </label>
  );
}
