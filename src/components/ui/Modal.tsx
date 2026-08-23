import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Diálogo do produto (docs/DESIGN_SYSTEM.md, seção 7). **Uma implementação, duas formas:** em
 * celular é uma folha que sobe da borda inferior, onde o polegar já está; a partir de `md` é a
 * caixa centralizada de sempre. Quem chama não escolhe — a tela não sabe a diferença.
 *
 * O componente cuida sozinho do que um diálogo precisa ter e que a versão anterior não tinha:
 * `role="dialog"` + `aria-modal`, foco que entra ao abrir e **volta para quem abriu** ao fechar,
 * foco preso enquanto aberto, Esc, rolagem do fundo travada e arraste para baixo no celular.
 */

/** Tudo que pode receber foco dentro da folha — usado para prender o Tab. */
const FOCALIZAVEL =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Duração da entrada e da saída. Igual à `duration-200` da seção 6. */
const DURACAO = 200;

/** Fração da altura da folha que o arraste precisa vencer para fechar (seção 7). */
const LIMIAR_ARRASTE = 0.25;

export function Modal({ title, onClose, children }: ModalProps) {
  const painelRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();

  /* `entrou` dispara a subida da folha no quadro seguinte à montagem; `saindo` toca a saída
     antes de avisar o pai, para que a folha não suma de um quadro para o outro. */
  const [entrou, setEntrou] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [arrasteY, setArrasteY] = useState(0);

  /**
   * Fecha com a animação de saída. Todo caminho de fechamento passa por aqui — botão, véu, Esc e
   * arraste. O `saindo` também serve de trava: dois toques rápidos no véu não devem agendar dois
   * `onClose`.
   */
  const saindoRef = useRef(false);
  const fechar = useCallback(() => {
    if (saindoRef.current) return;
    saindoRef.current = true;
    setSaindo(true);
    window.setTimeout(onClose, DURACAO);
  }, [onClose]);

  /* ---------- foco: entra ao abrir, volta para quem abriu ao fechar ---------- */
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    painelRef.current?.focus();
    return () => anterior?.focus?.();
  }, []);

  /* ---------- entrada ---------- */
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntrou(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---------- rolagem do fundo travada ----------
     O padding compensa a barra de rolagem que some no desktop; sem ele a página inteira dá um
     salto lateral ao abrir o diálogo. */
  useEffect(() => {
    const { body } = document;
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    const overflowAnterior = body.style.overflow;
    const paddingAnterior = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (larguraBarra > 0) body.style.paddingRight = `${larguraBarra}px`;
    return () => {
      body.style.overflow = overflowAnterior;
      body.style.paddingRight = paddingAnterior;
    };
  }, []);

  /* ---------- Esc e prisão de foco ---------- */
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        return fechar();
      }
      if (e.key !== "Tab") return;

      const alvos = painelRef.current?.querySelectorAll<HTMLElement>(FOCALIZAVEL);
      if (!alvos?.length) return;
      const primeiro = alvos[0];
      const ultimo = alvos[alvos.length - 1];
      const atual = document.activeElement;

      // Sai pela frente ou por trás? Volta pela outra ponta.
      if (!e.shiftKey && atual === ultimo) {
        e.preventDefault();
        primeiro.focus();
      } else if (e.shiftKey && (atual === primeiro || atual === painelRef.current)) {
        e.preventDefault();
        ultimo.focus();
      }
    };

    document.addEventListener("keydown", aoTeclar, true);
    return () => document.removeEventListener("keydown", aoTeclar, true);
  }, [fechar]);

  /* ---------- arraste para baixo (só celular) ----------
     A alça promete que a folha se puxa; sem isto ela seria enfeite. */
  const inicioY = useRef<number | null>(null);
  /* `arrastando` é estado, e não `inicioY.current !== null`: o render precisa desligar a
     transição enquanto o dedo está na tela, e ref não provoca render. */
  const [arrastando, setArrastando] = useState(false);

  const aoPegar = (e: React.PointerEvent) => {
    if (window.matchMedia("(min-width: 768px)").matches) return;
    inicioY.current = e.clientY;
    setArrastando(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const aoMover = (e: React.PointerEvent) => {
    if (inicioY.current === null) return;
    // Só para baixo: puxar para cima não faz a folha crescer.
    setArrasteY(Math.max(0, e.clientY - inicioY.current));
  };

  const aoSoltar = () => {
    if (inicioY.current === null) return;
    const altura = painelRef.current?.offsetHeight ?? 0;
    inicioY.current = null;
    setArrastando(false);
    if (altura > 0 && arrasteY > altura * LIMIAR_ARRASTE) fechar();
    setArrasteY(0);
  };

  const fora = saindo || !entrou;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-end justify-center bg-ink/45 backdrop-blur-[2px] transition-opacity duration-200 ease-out md:items-center md:p-5 ${
        fora ? "opacity-0" : "opacity-100"
      }`}
      onClick={fechar}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        data-movimento="sobe"
        style={arrasteY ? { transform: `translateY(${arrasteY}px)` } : undefined}
        className={`flex max-h-[85dvh] w-full flex-col rounded-t-panel border border-linha bg-surface-raised shadow-overlay outline-none ease-out md:max-h-[80dvh] md:max-w-[420px] md:rounded-panel ${
          arrastando ? "" : "transition-transform duration-200"
        } ${fora ? "translate-y-full md:translate-y-0" : "translate-y-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Alça: a affordance de "isto se puxa". Some no desktop, onde não há o que arrastar. */}
        <div
          onPointerDown={aoPegar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          className="flex shrink-0 cursor-grab touch-none justify-center pt-2.5 active:cursor-grabbing md:hidden"
        >
          <span aria-hidden="true" className="h-1 w-9 rounded-full bg-linha" />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-linha px-5 pt-3 pb-2.5 md:pt-5">
          <span id={tituloId} className="text-title font-semibold">
            {title}
          </span>
          {/* -m-2.5 devolve a área de toque de 44px sem engordar o ícone (seção 11). */}
          <button
            type="button"
            aria-label="Fechar"
            onClick={fechar}
            className="-m-2.5 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink/45 transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* A rolagem é do conteúdo, não da folha: cabeçalho e alça ficam presos.
            `min-h-0` não é enfeite: filho de flex-column tem `min-height: auto` por padrão e se
            recusa a encolher abaixo do próprio conteúdo — sem isto o painel estoura os 85dvh em
            vez de rolar por dentro. */}
        <div className="min-h-0 overflow-y-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}
