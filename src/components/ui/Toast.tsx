import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { ToastContext } from "./toast-context";
import type { ToastTom as Tom } from "./toast-context";

interface Aviso {
  id: number;
  texto: string;
  tom: Tom;
}

/** Sucesso some sozinho; erro fica até ser dispensado (docs/DESIGN_SYSTEM.md, seção 8.4). */
const DURACAO_SUCESSO = 4000;

/**
 * Confirmação flutuante de ação (docs/DESIGN_SYSTEM.md, seção 8.4).
 *
 * Existe porque o produto não confirmava nada: aprovar um cuidador, publicar um atendimento,
 * fazer check-in — a tela mudava de estado e pronto. No celular, com o polegar cobrindo metade
 * da tela no momento do toque, a pessoa não via o que tinha mudado e tocava de novo.
 *
 * **Use só quando a mudança não é visível na própria tela.** Quando o crachá vira "Confirmado"
 * ou o item sai da fila à vista de quem tocou, o próprio elemento é a confirmação e o aviso
 * flutuante vira ruído.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [entrou, setEntrou] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const avisar = useCallback((texto: string, tom: Tom = "sucesso") => {
    window.clearTimeout(timer.current);
    // Um por vez: aviso novo substitui o anterior, nunca empilha.
    setAviso({ id: Date.now(), texto, tom });
    setEntrou(false);
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const quadro = requestAnimationFrame(() => setEntrou(true));
    if (aviso.tom === "sucesso") {
      timer.current = window.setTimeout(() => setAviso(null), DURACAO_SUCESSO);
    }
    return () => cancelAnimationFrame(quadro);
  }, [aviso]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const Icone = aviso?.tom === "erro" ? CircleAlert : CircleCheck;

  return (
    <ToastContext.Provider value={{ avisar }}>
      {children}

      {aviso && (
        <div
          key={aviso.id}
          /* Em celular fica ACIMA da barra de abas: o topo do telefone é onde está a mão que não
             toca na tela, e um aviso lá sai do campo de visão. No desktop, canto inferior
             direito, longe da coluna de leitura. */
          className={`fixed inset-x-5 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[90] mx-auto max-w-[420px] transition-[opacity,transform] duration-150 ease-out md:inset-x-auto md:right-6 md:bottom-6 md:mx-0 ${
            entrou ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
          data-movimento="sobe"
        >
          <div
            role={aviso.tom === "erro" ? "alert" : "status"}
            aria-live={aviso.tom === "erro" ? "assertive" : "polite"}
            className={`flex items-start gap-2 rounded-control border px-3 py-2.5 text-note shadow-raised ${
              aviso.tom === "erro"
                ? "border-status-cancelado/40 bg-status-cancelado-soft text-status-cancelado"
                : "border-status-confirmado/40 bg-status-confirmado-soft text-status-confirmado"
            }`}
          >
            <Icone size={15} aria-hidden="true" className="mt-[3px] shrink-0" />
            <span className="min-w-0 flex-1">{aviso.texto}</span>
            <button
              type="button"
              aria-label="Dispensar"
              onClick={() => setAviso(null)}
              className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-current opacity-55 transition-opacity duration-150 hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
