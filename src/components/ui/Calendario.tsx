import { useEffect, useRef, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { SETA_PERIODO_CLASS } from "./button-classes";
import { DIAS_DA_SEMANA, moverMes, rotuloMes, somarDias } from "../../utils/date";

/*
 * Grade de mês (docs/DESIGN_SYSTEM.md, seção 8).
 *
 * O calendário responde **uma** pergunta: *em que dias deste mês tem alguma coisa marcada?* Ele
 * não mostra o que é, não mostra em que pé está, não mostra a que horas. Tudo isso é o conteúdo
 * que a tela põe **embaixo** dele, para o dia escolhido — e a divisão é o que mantém a célula
 * legível num telefone: sete colunas numa tela de 360px dão ~44px de largura, que é o alvo de
 * toque e não sobra um pixel para texto.
 *
 * -------------------------------------------------------------- a marca é presença, não estado
 *
 * O ponto embaixo do número diz **que existe plantão ali**, e mais nada. Não é a cor do estado.
 *
 * Isso não é economia de escopo, é a regra 3 do design system: estado nunca é comunicado só por
 * cor. Numa célula de 44px não cabe rótulo de texto ao lado do ponto, então a cor seria o único
 * canal — exatamente a construção que o produto decidiu não ter, por causa de daltonismo. O estado
 * continua sendo lido onde há espaço para escrevê-lo por extenso: no registro de baixo, onde o
 * `<StatusAtendimento>` já traz forma e palavra.
 *
 * Três pontos é o teto. Além disso eles deixam de ser contáveis de relance e viram textura; quem
 * precisa do número exato lê a contagem no cabeçalho da seção de baixo.
 *
 * ------------------------------------------------------------------ hoje e selecionado
 *
 * São dois estados diferentes e nenhum dos dois pode depender só de cor:
 *
 * - **selecionado** — fundo cheio no accent, e `aria-pressed` no botão.
 * - **hoje** — anel fino e tinta da marca, e `aria-current="date"`.
 *
 * Além do canal assistivo, o dia escolhido é escrito por extenso logo abaixo do calendário, no
 * cabeçalho da seção ("Hoje", "Ter, 26/08"). Quem não distingue o fundo lê a palavra.
 *
 * ------------------------------------------------------------------ o mês vizinho não aparece
 *
 * As casas antes do dia 1 ficam **vazias**, sem os dias do mês anterior em cinza. O dia de outro
 * mês levanta uma pergunta que a grade não deveria levantar — clicar nele muda o mês? seleciona? —
 * e a resposta certa não é óbvia para ninguém. Vazio não tem ambiguidade.
 *
 * --------------------------------------------------------------------- teclado
 *
 * Uma parada de tabulação, não trinta e uma. O mês inteiro numa fila de `tab` faria quem navega
 * por teclado atravessar o calendário todo antes de chegar nos plantões — que é o conteúdo. Então
 * só o dia selecionado é focalizável (`tabIndex` 0; os outros, -1) e as setas do teclado andam na
 * grade, virando o mês sozinhas quando passam da borda.
 *
 * A seleção acompanha o foco: aqui escolher um dia não destrói nada, só troca a lista de baixo, e
 * exigir um Enter depois de cada seta seria cerimônia sem ganho.
 */

interface CalendarioProps {
  /** Mês visível, no formato `2026-08`. */
  mes: string;
  /** O dia aberto — é dele que a tela mostra o conteúdo. */
  selecionado: string;
  /** Hoje em ISO local. Vem de fora para o calendário e a tela nunca discordarem sobre a data. */
  hoje: string;
  /** Quantos registros cada dia tem. Chave em ISO; dia ausente é dia sem nada. */
  marcas: Record<string, number>;
  /** Como nomear a contagem no rótulo assistivo — `["plantão", "plantões"]`. */
  nomeMarca: [string, string];
  onSelecionar: (iso: string) => void;
  onMudarMes: (mes: string) => void;
  className?: string;
}

/** Quanto cada tecla anda na grade. */
const PASSO_DA_TECLA: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

export function Calendario({
  mes,
  selecionado,
  hoje,
  marcas,
  nomeMarca,
  onSelecionar,
  onMudarMes,
  className = "",
}: CalendarioProps) {
  const gradeRef = useRef<HTMLDivElement>(null);
  /* O foco só é movido à força quando **o teclado** mudou o dia. No clique o navegador já focou o
     botão tocado, e refocá-lo faria a página saltar de volta para o calendário em telefone que
     rolou até os plantões. */
  const moverFoco = useRef(false);

  useEffect(() => {
    if (!moverFoco.current) return;
    moverFoco.current = false;
    gradeRef.current?.querySelector<HTMLButtonElement>(`[data-dia="${selecionado}"]`)?.focus();
  }, [selecionado]);

  const [ano, numeroDoMes] = mes.split("-").map(Number);
  /* Dia 0 do mês seguinte é o último dia deste — a forma de contar dias do mês sem tabela de
     bissexto. */
  const totalDeDias = new Date(ano, numeroDoMes, 0).getDate();
  const casasVazias = new Date(ano, numeroDoMes - 1, 1).getDay();

  const irPara = (iso: string) => {
    moverFoco.current = true;
    /* Andar para fora do mês vira o mês junto: sem isto, a seta pararia no dia 1 e o teclado teria
       um limite que o mouse não tem. */
    const mesDoDestino = iso.slice(0, 7);
    if (mesDoDestino !== mes) onMudarMes(mesDoDestino);
    onSelecionar(iso);
  };

  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    const passo = PASSO_DA_TECLA[e.key];
    if (passo !== undefined) {
      e.preventDefault();
      irPara(somarDias(selecionado, passo));
      return;
    }
    /* Início e fim da semana do dia focado — `getDay()` diz quantos dias faltam para cada ponta. */
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const diaDaSemana = new Date(`${selecionado}T12:00`).getDay();
      irPara(somarDias(selecionado, e.key === "Home" ? -diaDaSemana : 6 - diaDaSemana));
      return;
    }
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const destino = moverMes(mes, e.key === "PageUp" ? -1 : 1);
      const [anoDestino, mesDestino] = destino.split("-").map(Number);
      /* 31 de janeiro + um mês não existe em fevereiro: o dia encosta no último do mês de destino
         em vez de escorregar para março. */
      const dia = Math.min(
        Number(selecionado.slice(8)),
        new Date(anoDestino, mesDestino, 0).getDate(),
      );
      irPara(`${destino}-${String(dia).padStart(2, "0")}`);
    }
  };

  const rotuloDoBotao = (dia: number, quantidade: number) => {
    const contagem =
      quantidade === 0
        ? `sem ${nomeMarca[1]}`
        : `${quantidade} ${quantidade === 1 ? nomeMarca[0] : nomeMarca[1]}`;
    return `${dia} de ${rotuloMes(mes)}, ${contagem}`;
  };

  return (
    <div className={`rounded-card border border-linha bg-surface-raised p-3 ${className}`}>
      {/*
        O cabeçalho do mês. Mesma gramática da faixa de período da escala: setas discretas, rótulo
        em peso cheio no meio, e a volta para hoje como ação tonal na ponta — nunca desabilitada,
        porque voltar para hoje estando em hoje não é erro, é um clique que não muda nada.
      */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Mês anterior"
            onClick={() => onMudarMes(moverMes(mes, -1))}
            className={SETA_PERIODO_CLASS}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          {/* `aria-live="polite"`: quem navega por teclado vira o mês com PageUp e precisa ouvir
              para onde foi. Sem isto, a única pista é visual. */}
          <span
            aria-live="polite"
            className="min-w-[8.5rem] px-1 text-center text-note font-semibold text-ink tabular-nums"
          >
            {rotuloMes(mes)}
          </span>
          <button
            type="button"
            aria-label="Próximo mês"
            onClick={() => onMudarMes(moverMes(mes, 1))}
            className={SETA_PERIODO_CLASS}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          onClick={() => {
            onMudarMes(hoje.slice(0, 7));
            onSelecionar(hoje);
          }}
        >
          Hoje
        </Button>
      </div>

      {/* Os nomes dos dias são decoração: cada botão da grade já se apresenta por extenso
          ("26 de Agosto 2026, 2 plantões"), e repetir "Terça" antes disso só alonga a fala. */}
      <div aria-hidden="true" className="mt-3 grid grid-cols-7 gap-0.5">
        {DIAS_DA_SEMANA.map((dia) => (
          <span key={dia} className="py-1 text-center text-dado text-ink-subtle uppercase">
            {dia}
          </span>
        ))}
      </div>

      {/* O `onKeyDown` mora no contêiner, não em cada botão: a tecla troca **qual** botão está
          focado, e um ouvinte preso ao botão que acabou de perder o foco perderia a tecla
          seguinte. O contêiner sobrevive à troca; ele é quem tem que ouvir. */}
      <div ref={gradeRef} onKeyDown={aoTeclar} className="mt-0.5 grid grid-cols-7 gap-0.5">
        {Array.from({ length: casasVazias }, (_, i) => (
          <span key={`vazio-${i}`} aria-hidden="true" />
        ))}

        {Array.from({ length: totalDeDias }, (_, i) => {
          const dia = i + 1;
          const iso = `${mes}-${String(dia).padStart(2, "0")}`;
          const quantidade = marcas[iso] ?? 0;
          const estaSelecionado = iso === selecionado;
          const ehHoje = iso === hoje;

          return (
            <button
              key={iso}
              type="button"
              data-dia={iso}
              tabIndex={estaSelecionado ? 0 : -1}
              aria-pressed={estaSelecionado}
              aria-current={ehHoje ? "date" : undefined}
              aria-label={rotuloDoBotao(dia, quantidade)}
              onClick={() => onSelecionar(iso)}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-control transition-colors duration-150 ease-out ${
                estaSelecionado
                  ? "bg-accent text-accent-ink"
                  : ehHoje
                    ? "text-accent ring-1 ring-accent/40 ring-inset hover:bg-accent-soft"
                    : "text-ink hover:bg-surface-sunken active:bg-surface-sunken"
              }`}
            >
              <span className={`numero text-note leading-none ${ehHoje ? "font-semibold" : ""}`}>
                {dia}
              </span>
              {/*
                A faixa dos pontos tem altura fixa e existe **em todo dia**, com ou sem plantão.
                Sem ela, o número de um dia vazio subiria 6px em relação ao do dia ao lado e a
                grade inteira ficaria trêmula — o defeito clássico de calendário com marcador.
              */}
              <span aria-hidden="true" className="flex h-1.5 items-center gap-0.5">
                {Array.from({ length: Math.min(quantidade, 3) }, (_, ponto) => (
                  <span
                    key={ponto}
                    className={`size-1 rounded-full ${
                      estaSelecionado ? "bg-accent-ink" : "bg-accent"
                    }`}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
