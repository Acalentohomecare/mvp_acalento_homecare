# DESIGN_SYSTEM.md — Acalento Gestão

> Padrão obrigatório para qualquer componente de front do projeto.
> Fonte de verdade dos tokens: [`src/index.css`](../src/index.css) (bloco `@theme`).
> Fonte de verdade dos componentes: [`src/components/ui/`](../src/components/ui/).
> Arquivo-mestre da marca: [`public/logo_new.jpeg`](../public/logo_new.jpeg) — **um arquivo só**,
> o mesmo para a interface, o favicon e o ícone de app.

**Nenhuma alteração visual importante entra no produto sem que esta página seja criada ou
atualizada junto.** Se um padrão novo nasce durante o desenvolvimento, ele é documentado aqui
**antes** de ser reutilizado em outra tela. A seção [15](#15-pendências-abertas) lista o que já
está especificado mas ainda não existe em código — nada de lá pode ser usado como se existisse.

### Como ler esta página

Cada componente e cada padrão é descrito no mesmo formato, sempre nesta ordem:
**objetivo · onde é usado · estrutura visual · variações · estados · espaçamento ·
responsividade e comportamento em celular · movimento · exemplo · restrições.**
Quando um item não tem variação ou não tem movimento, a linha some — não se escreve "nenhuma".

Marcadores de situação usados na página inteira:

| Marca | Significado |
|---|---|
| ✅ | Implementado e em uso. O que está escrito aqui é o que está no código. |
| 🟡 | Implementado, mas fora do padrão desta página. Tem entrada na seção 15. |
| 🔴 | Especificado aqui, **ainda não existe em código**. Não use como se existisse. |

> Hoje **tudo nesta página está ✅** — a revisão 6 fechou as pendências que a revisão 5 tinha
> levantado. Os outros dois marcadores continuam definidos porque a próxima especificação escrita
> antes da implementação vai precisar deles.

---

## Índice

| # | Seção |
|---|---|
| 0 | [As cinco regras](#0-as-cinco-regras) |
| 1 | [Marca](#1-marca) |
| 2 | [Cor — o ambiente](#2-cor--o-ambiente) |
| 3 | [Cor — estado e categoria (os crachás)](#3-cor--estado-e-categoria-os-crachás) |
| 3.1 | [O marcador de estado — forma antes de cor](#31-o-marcador-de-estado--forma-antes-de-cor-) |
| 3.2 | [Níveis de sinalização](#32-níveis-de-sinalização---pontonivel) |
| 4 | [Tipografia](#4-tipografia) |
| 5 | [Forma — espaçamento, grid, raio, borda, elevação](#5-forma--espaçamento-grid-raio-borda-elevação) |
| 6 | [Movimento — duração, curva, microinteração, transição](#6-movimento--duração-curva-microinteração-transição) |
| 7 | [Componentes base](#7-componentes-base) |
| 8 | [Estados de tela — carregando, vazio, erro, sucesso](#8-estados-de-tela--carregando-vazio-erro-sucesso) |
| 9 | [Padrões compostos](#9-padrões-compostos) |
| 10 | [Padrões de tela — layout e navegação](#10-padrões-de-tela--layout-e-navegação) |
| 11 | [Mobile first — regras transversais](#11-mobile-first--regras-transversais) |
| 12 | [Acessibilidade](#12-acessibilidade) |
| 13 | [Checklist antes de abrir PR de front](#13-checklist-antes-de-abrir-pr-de-front) |
| 14 | [Histórico de decisões](#14-histórico-de-decisões) |
| 15 | [Pendências abertas](#15-pendências-abertas) |

---

## 0. As cinco regras

1. **Nunca escreva cor, raio ou sombra literal.** Nada de `bg-[#175260]`, `rounded-[12px]`,
   `shadow-lg`, `text-blue-600`. Use os tokens desta página. Se falta um token para o que você
   precisa, o token é que precisa nascer — em `@theme`, com nome semântico e comentário.
2. **Antes de criar um componente, procure em `src/components/ui/`.** Botão, card, campo, crachá,
   stepper, modal, avatar e logo já existem. Um `<button>` solto com classes copiadas é dívida.
3. **Cor nunca é a única portadora de informação.** Todo estado tem rótulo em texto; todo item
   ativo tem peso, posição ou traço além do tom. Daltonismo e tela ao sol não são exceção nesse
   público.
4. **Cor saturada é reservada.** O ambiente é branco e cinza levemente azul-esverdeado. Teal cheio
   só aparece na ação primária da tela e nos crachás que carregam significado — e os degraus
   claros do teal não aparecem em lugar nenhum da interface: são da marca.
5. **Escreva para tela pequena primeiro.** A coordenadora decide plantão do celular, em pé, com
   pressa. Piso de 12px de texto, alvo de toque de 44px, nada essencial escondido em `hover`.
   A regra completa está na [seção 11](#11-mobile-first--regras-transversais).

---

## 1. Marca

O símbolo é a rede de cuidado: um núcleo e cinco elos que saem dele — três claros, dois escuros.
O arquivo oficial é [`public/logo_new.jpeg`](../public/logo_new.jpeg), e é o **único** arquivo de
marca do repositório: a interface, o favicon e o ícone de app apontam todos para ele. **Nada é
redesenhado em código, e não existe versão derivada** — derivada é o que sai do lugar quando a
arte muda.

A arte tem três tintas, e elas formam uma escala:

| Cor da marca | Token | Hex | Onde |
|---|---|---|---|
| Teal profundo | `--brand` | `#175260` | Elos escuros e hastes. É também `--accent`. |
| Teal médio | `--brand-mid` | `#236D77` | O núcleo do símbolo. |
| Aqua | `--brand-aqua` | `#88C3C9` | Elos claros. Só preenche forma. |
| Aqua de texto | `--brand-aqua-ink` | `#2A787F` | O aqua rebaixado até aguentar letra (5,1:1 sobre branco). |

Os valores foram amostrados pixel a pixel do arquivo (mediana por região), não estimados.

### A matiz gira, e é isso que segura a escala

| | L | C | H |
|---|---|---|---|
| Teal profundo | 0,408 | 0,063 | **217°** |
| Teal médio | 0,494 | 0,072 | **208°** |
| Aqua | 0,779 | 0,061 | **204°** |

Conforme o tom clareia, a matiz anda 13° em direção ao ciano. Não é ruído de JPEG: é o que
diferencia esta escala de três opacidades da mesma tinta, e é por isso que a marca parece
desenhada. Quem criar qualquer tom novo no eixo da marca repete essa torção — mais fundo, mais
azul.

### A marca fica com os três degraus; a interface, com um só

É esta a separação entre as duas paletas, e é o que deixa o logo mais marcante que o produto sem
precisar manter duas versões da mesma cor:

- o produto usa **apenas `#175260`**, o degrau mais fundo — cor institucional, que recua;
- o símbolo usa **os três**, e o aqua é o degrau que mais nada tem. Em 1,96:1 sobre branco ele é
  claro demais para qualquer papel de interface, e é justamente por isso que a marca se destaca de
  tudo o que está em volta dela.

`--brand-aqua` **nunca carrega texto**. Onde ele precisa virar palavra — o "Gestão" do lockup —
quem entra é `--brand-aqua-ink`.

### O símbolo vai sem fundo, em lugar nenhum

O arquivo é JPEG, e JPEG não tem transparência: ele carrega um fundo `#F7F7F7` opaco. Quem resolve
isso é `mix-blend-darken` no `<LogoMark>`, e não um recorte salvo à parte.

`darken` mantém, canal a canal, o menor valor entre o arquivo e a superfície de baixo. Toda
superfície onde a marca aparece é mais escura que `#F7F7F7` nos três canais — a barra lateral
(`#EDF2F3`), o fundo do app (`#F4F6F7`) e o véu da entrada (`#DFF1F3`) —, então o fundo do JPEG é
substituído pela superfície **exatamente**: 1,000:1 de diferença, conferido por cálculo. As três
tintas do símbolo são mais escuras que qualquer uma dessas superfícies e passam intactas.

`multiply` foi o primeiro candidato e perde: escurece o fundo em ~3% em vez de casá-lo, deixando um
quadrado de 1,07:1 visível em toda superfície. A única superfície onde `darken` deixaria resíduo é
o **branco puro**, e a marca não é usada sobre ele em lugar nenhum do produto — se um dia for,
esta seção é que precisa mudar primeiro.

```tsx
import { Logo, LogoMark } from "../components/ui";

<Logo variant="stacked" size={40} />                  // símbolo + nome abaixo
<Logo variant="stacked" align="center" size={76} />   // idem, centralizado
<Logo variant="inline" size={30} />                   // símbolo + nome ao lado
<LogoMark size={40} />                                // só o símbolo
```

| Contexto | Uso |
|---|---|
| Barra lateral (desktop) | `Logo variant="stacked" size={40}` |
| Cabeçalho do celular | `Logo variant="inline" size={30}` |
| Entrada / cadastro | `Logo variant="stacked" align="center" size={76}` / `{58}` |
| Aba do navegador | `public/logo_new.jpeg` |
| Ícone de app / iOS | `public/logo_new.jpeg` |

Aba e iOS usam o mesmo arquivo da interface. Ali o fundo opaco do JPEG não atrapalha — a aba é
clara nos dois temas, e no iOS ele é até conveniente, porque o sistema pinta preto atrás de PNG
transparente na tela de início.

**O nome é texto, não imagem, vem abaixo do símbolo e em caixa normal** — "Acalento Gestão", nunca
"ACALENTO GESTÃO". "Acalento" sai em `--brand` e "Gestão" em `--brand-aqua-ink`: a mesma escala do
símbolo, na mesma ordem, e o eco do lockup original, onde a segunda palavra sempre teve cor
própria. O lockup fica inteiro na tinta da marca — nenhuma das duas palavras usa cor de interface,
e é isso que faz ele se ler como marca e não como título de tela. Sendo texto, acompanha a fonte
do produto, fica nítido em qualquer densidade e é lido por leitor de tela.

A variante `inline` (nome ao lado) existe só para o cabeçalho do celular, onde empilhar o lockup
somaria uma terceira linha a uma barra que já é apertada.

**Não faça:** recolorir o símbolo; esticar; escrever o nome em caixa alta, em outra família ou em
outro peso; colocar fundo atrás do símbolo.

---

## 2. Cor — o ambiente

Produto de saúde e de gestão: o fundo é claro e quieto. Toda a escala neutra puxa levemente para
a matiz da marca — um grafite azul-esverdeado em H ≈ 208°, com croma sempre abaixo de 0,012
(nenhum cinza puro, nenhum preto puro). Não é detalhe de gosto: é o que faz o teal parecer da
mesma família do ambiente em vez de um adesivo colado sobre cinza neutro.

### Neutros

| Token | Utilidade | Hex | Uso |
|---|---|---|---|
| `--color-ink` | `text-ink` `bg-ink` | `#1D2122` | Texto principal. Grafite frio, nunca `#000`. |
| `--color-ink-muted` | `text-ink-muted` | `#525859` | Texto secundário. |
| `--color-ink-subtle` | `text-ink-subtle` | `#656C6D` | Terciário, ícone, placeholder. |
| `--color-surface` | `bg-surface` | `#F4F6F7` | Fundo do app. |
| `--color-surface-raised` | `bg-surface-raised` | `#FFFFFF` | Card, campo, `hover` de item de navegação. |
| `--color-surface-sunken` | `bg-surface-sunken` | `#E8EEEF` | Faixa de apoio, contador, cabeçalho de tabela. |
| `--color-surface-nav` | `bg-surface-nav` | `#EDF2F3` | Cromo de navegação: barra lateral, cabeçalho do celular, barra inferior. |
| `--color-linha` | `border-linha` | `#D9E1E2` | Divisor e borda de card. **Não serve para delimitar controle.** |
| `--color-linha-strong` | `border-linha-strong` | `#838D8E` | Borda de campo e de controle — 3,4:1 sobre branco. |

**Hierarquia de texto por token** — não invente cinzas, e **nunca** faça degrau com opacidade:

| Papel | Classe | Pior contraste no produto |
|---|---|---|
| Texto principal | `text-ink` | 13,9:1 |
| Texto secundário, rótulo de campo | `text-ink-muted` | 6,2:1 |
| Apoio, legenda, metadado, ícone, placeholder, vazio | `text-ink-subtle` | 4,6:1 |

> **Por que não `text-ink/50`.** A hierarquia já foi feita com opacidade — `text-ink/45`,
> `/50`, `/60` — em 154 lugares. Opacidade mistura a tinta com o fundo, e o resultado ia de
> 2,4:1 a 4,1:1: todo o degrau secundário e terciário do produto estava abaixo do mínimo da
> WCAG AA, incluindo os carimbos do registro de atividade e a frase que explica a regra de
> formação. O sistema de tokens estava correto e era contornado no call site. Agora o degrau
> **é** o token, e os três foram medidos contra a pior superfície do produto, não contra branco.
>
> `disabled` é a única exceção: controle inativo é isento de contraste pela própria WCAG, e por
> isso `field.ts` ainda usa `text-ink-subtle/70` ali — para que desabilitado continue parecendo
> desabilitado.

### Ação

| Token | Utilidade | Hex | Uso |
|---|---|---|---|
| `--color-accent` | `bg-accent` `text-accent` | `#175260` | Ação primária, item de navegação ativo, foco, valor em destaque. |
| `--color-accent-strong` | `hover:bg-accent-strong` | `#003D4A` | `hover` / pressionado da ação primária. |
| `--color-accent-ink` | `text-accent-ink` | `#FFFFFF` | Texto e ícone **sobre** `--accent`. |
| `--color-accent-ink-muted` | `text-accent-ink-muted` | `#B8D2D5` | Apoio **sobre** `--accent` (carimbo de hora na bolha de mensagem). |
| `--color-accent-soft` | `bg-accent-soft` | `#DFF1F3` | Fundo tonal: nav ativa, avatar, botão `secondary`, véu da entrada. |
| `--color-rating` | `fill-rating` `text-rating` | `#B1812C` | **Só** preenchimento de estrela de avaliação. |

> **`--accent` é `--brand`, e é o único degrau da marca que a interface tem direito de usar.** O
> teal médio e o aqua ficam reservados ao símbolo ([seção 1](#1-marca)). Se a interface também os
> usasse, o logo perderia o que tem de próprio e viraria mais um elemento da tela.

> `--rating` não carrega letra, mas **carrega informação**: estrela cheia é o que diz a nota. Por
> isso ele responde pelos 3:1 da WCAG 1.4.11 e não pelos 4,5:1 de texto — 3,5:1 sobre branco.
> Estrela na cor da marca lia como botão; a saída é o ouro, não a marca. O ouro é também o único
> complementar do sistema: contra um ambiente inteiro em teal frio, o âmbar quente é o par que
> fecha a roda em vez de brigar com ela.

**Uma ação primária por tela.** Se duas coisas na mesma tela são `bg-accent`, uma delas está
errada — vira `ghost` ou `secondary`.

---

## 3. Cor — estado e categoria (os crachás)

### O semáforo do produto

O produto tem um semáforo obrigatório, em versões dessaturadas para conviver com o ambiente
teal: **âmbar = espera alguém agir**, **verde = combinado de pé**, **vermelho = caiu**. Somam-se
a ele o teal vivo do que acontece agora e a ardósia do que já é histórico.

Cada estado é um **par**: a cor base (texto, ícone, ponto) e o `-soft` (fundo do chip).

| Estado | Token base | Base | Soft | Significado |
|---|---|---|---|---|
| Em busca / convite / candidaturas | `status-aberto` | `#79520A` | `#FDEED4` | Pendente — espera uma decisão. |
| Confirmado | `status-confirmado` | `#346B45` | `#E1F4E5` | Combinado de pé. |
| Em andamento | `status-andamento` | `#006877` | `#DAF2F6` | Acontecendo agora. |
| Concluído / avaliado | `status-concluido` | `#5D6567` | `#E8EEEF` | Encerrado, já é histórico. |
| Cancelado / recusado | `status-cancelado` | `#94392D` | `#FFE6E0` | Caiu. |
| Bloqueado | `status-bloqueado` | `#771814` | `#FFE0DA` | Decisão posterior da empresa sobre quem já estava no quadro (R12). |
| Rascunho | `status-rascunho` | `#616666` | `#E8EEEF` | Ainda não publicado. |

Bloqueado é vermelho mais profundo que cancelado de propósito: uma recusa é uma decisão pontual
sobre o cadastro que chegou; um bloqueio é uma decisão posterior sobre alguém que já estava dentro.

### 3.1 O marcador de estado — forma antes de cor ✅

**Crachá é pessoa; marcador é estado.** É a separação que organiza esta seção inteira, e ela nasceu
na revisão 13.

O `<Cracha>` — a pastilha redonda com furo de lanyard — identifica **uma pessoa**: categoria do
cuidador, selo de verificado, registro no conselho. Continua sendo o elemento de assinatura do
design system.

Estado de atendimento **não é credencial de ninguém**; é a situação de um registro dentro de um
sistema. Usar a mesma pastilha para as duas coisas fazia a lista de plantões parecer um mural de
etiquetas, e era o que mais empurrava o módulo para a estética de painel genérico. Quem responde
por estado é o `<StatusAtendimento>`.

Ele carrega a informação em **três eixos ao mesmo tempo** — forma, cor e palavra — e a forma é a
primária. Nove status, cinco formas:

| Forma | Desenho | Estados | Leitura |
|---|---|---|---|
| `aguarda` | anel vazado | Rascunho, Em busca, Convidado, Em confirmação | Falta alguém decidir. O vazio é literal: o plantão não tem dono. |
| `firmado` | ponto cheio | Confirmado | Combinado de pé. |
| `agora` | ponto cheio com halo | Em andamento | Está acontecendo neste momento. |
| `fechado` | quadrado cheio | Concluído, Avaliado | Encerrou, virou histórico. Quadrado porque parou. |
| `caiu` | quadrado vazado | Cancelado | A forma do fechado, sem o preenchimento. |

É a regra 3 resolvida na **estrutura**, e não num `aria-label`: uma coluna de trinta plantões é
varrida sem ler rótulo nenhum, e continua legível para quem não distingue âmbar de verde.

**Três variantes, três lugares:**

| Variante | Forma | Onde |
|---|---|---|
| `linha` (padrão) | marcador + palavra na tinta do estado, **sem fundo** | Toda lista de atendimentos. |
| `bloco` | crachá quadrado (`rounded-marker`), fundo `-soft` + borda | Cabeçalho da ficha, onde o estado é a manchete. |
| `ponto` | só o marcador, com o rótulo em `sr-only` | Onde a palavra já está escrita ao lado. |

#### O rótulo é um só, e é sempre um estado

`ATTENDANCE_STATUS_LABEL` é a **única** fonte da palavra, nas três variantes. Havia um segundo mapa
(`ATTENDANCE_STATUS_SHORT`) com uma forma curta para a coluna e uma longa para a ficha e o leitor
de tela, e ele divergia em dois estados — "Convite enviado"/"Convidado",
"Candidaturas recebidas"/"Candidaturas". Duas palavras para o mesmo estado é o que faz alguém
perguntar se são estados diferentes; o mapa curto saiu na revisão 17 e o `sr-only` da variante
`linha` saiu com ele.

| Status | Rótulo |
|---|---|
| `draft` | Rascunho |
| `open` | Em busca |
| `invited` | Convidado |
| `applications_received` | **Em confirmação** |
| `confirmed` | Confirmado |
| `in_progress` | Em andamento |
| `completed` | Concluído |
| `evaluated` | Avaliado |
| `cancelled` | Cancelado |

Duas réguas decidem a palavra, e as duas valem ao mesmo tempo:

**1. É um estado — nunca uma contagem, nunca um objeto.** "Candidaturas" era um substantivo de
coisa ocupando o lugar reservado à situação do registro, na mesma coluna onde as vizinhas diziam
"Em busca" e "Confirmado". Ler uma coluna em que a maioria das linhas responde *em que pé está* e
uma responde *o que chegou* obriga a parar e reinterpretar a posição. Quantas candidaturas
chegaram é informação complementar, e mora na camada 4 do registro (seção 9.0).

**2. Cabe na coluna, em 320px.** A coluna de estado é a última da linha densa, e cada pixel que ela
toma sai do nome do paciente. "Aguardando confirmação" mede ~152px a 13px e comeria metade da
largura útil de um telefone; "Em confirmação" mede ~97px e entra na família dos "Em ___" que o
ciclo já usa — **Em busca → Em confirmação → Em andamento**. O que a espera tem de específico
(*de quem* se espera) é trabalho da **situação operacional**, uma camada abaixo, onde a linha é
inteira e a frase pode ser completa.

```tsx
<StatusAtendimento status={attendance.status} />                  // na lista
<StatusAtendimento status={attendance.status} variant="bloco" />  // na ficha
```

**Não faça:** pôr estado de atendimento num `<Cracha>`; usar `rounded-full` num crachá de estado;
usar a variante `bloco` dentro de uma lista, onde ela vira uma coluna de pastilhas coloridas.

---

### 3.2 Níveis de sinalização ✅ — `<PontoNivel>`

**O problema que isto resolve.** O painel de Pendências do Início pintava o ponto de cada linha a
partir de um booleano `urgente`: âmbar quando falso, vermelho quando verdadeiro. Duas tintas sem
regra escrita, e a ordem da lista não acompanhava nenhuma delas — um check-in atrasado podia
aparecer abaixo de um rascunho, com o vermelho no meio da coluna sem nada explicando por quê.
**Cor que não acompanha a ordem não é sinal, é decoração.**

O produto passa a ter **quatro níveis**, e nenhuma matiz nova. Cada um se apoia num token que já
existe, porque a [regra 4](#0-as-cinco-regras) reserva uma única cor de destaque e uma quinta
matiz saturada afastaria a interface do teal da marca.

| Nível | Token | Base | Significa | Exemplos |
|---|---|---|---|---|
| `critico` | `status-cancelado` | `#94392D` | Já passou do prazo. Alguém está esperando agora. | Check-in atrasado, cancelamento, atraso |
| `atencao` | `status-aberto` | `#79520A` | Espera uma decisão sua, e ainda dá tempo. | Fila de aprovação do quadro, candidaturas, convite sem resposta |
| `informacao` | `accent` | `#175260` | Contexto. Nada quebra se ficar para amanhã. | Rascunho não publicado, aviso `severity: "info"`, nova mensagem |
| `sucesso` | `status-confirmado` | `#346B45` | Resolvido. Não há o que fazer. | "Nada pendente", confirmação |

**Sobre o azul.** O nível `informacao` é o azul do produto, e ele é o `--accent`: um teal profundo
que, num ponto de 5px, lê como azul-petróleo. Não existe `blue` nesta paleta e não deve existir —
o ambiente é teal, e um azul genérico ao lado dele leria como erro de token, não como decisão.

#### Três vocabulários de cor, e eles não se misturam

| Vocabulário | Responde | Onde mora |
|---|---|---|
| Estado do atendimento | *em que situação está este registro?* | `<StatusAtendimento>` ([3.1](#31-o-marcador-de-estado--forma-antes-de-cor-)) — forma antes de cor |
| **Nível de sinalização** | *quanta urgência esta linha carrega para quem lê?* | `<PontoNivel>`, `<Aviso>` |
| Tom da linha do tempo | *onde no tempo isto aconteceu?* | `<LinhaDoTempo>` ([9.1](#91-linha-do-tempo-de-atividade-operacional---linhadotempo)) |

Um "Confirmado" na coluna de estado e um ponto verde de nível dizem coisas diferentes, e é por
isso que os dois nunca aparecem na mesma linha.

#### As regras

1. **Um nível por linha.** Dois pontos na mesma linha é enfeite, não informação.
2. **O nível vem do dado** — `severity`, tipo da notificação, estado do atendimento —, nunca
   escrito à mão no JSX. Onde o dado tem gravidade, a tela traduz; onde não tem, o nível é uma
   constante da própria lista.
3. **A ordem acompanha a cor.** Toda lista com nível ordena por `NIVEL_ORDEM` antes de renderizar.
   É isso que faz o vermelho significar alguma coisa: ele está no topo porque é vermelho.
4. **Cor não é a única portadora** ([regra 3](#0-as-cinco-regras)): a ordenação carrega o nível na
   tela, e o `<PontoNivel>` carrega `NIVEL_ROTULO` em `sr-only` para quem ouve.

#### O tamanho

**5px, e é ponto final.** O ponto é um índice, não o elemento principal da linha: ao lado de um
texto de 14px, o antigo ponto de 6px lia como marcador de lista e virava a primeira coisa que o
olho encontrava, quando o trabalho dele é ser a segunda. Não existe variante grande — onde o
nível precisa ser a manchete de uma tela, quem responde é o `<Aviso>`, que tem ícone e frase.

```tsx
<PontoNivel nivel="critico" className="mt-2" />   // alinhado à primeira linha do texto ao lado
<Aviso tom="atencao" acao={<ButtonLink …/>}>…</Aviso>
```

Os tons do `<Aviso>` são os mesmos quatro níveis, com os nomes que a caixa já tinha:
`erro` = crítico, `atencao` = atenção, `info` = informação, `sucesso` = sucesso.

As cores moram em [`constants/nivel.ts`](../src/constants/nivel.ts) — `NIVEL_PONTO`,
`NIVEL_TINTA`, `NIVEL_ROTULO`, `NIVEL_ORDEM`. Nunca escreva a tinta do nível na tela.

**Não faça:** criar uma matiz nova para um nível; usar nível em lista que não tem urgência
nenhuma (nome de paciente não tem nível); aumentar o ponto para "dar destaque" — o destaque é a
posição; misturar nível com estado de atendimento na mesma linha.

---

### Categoria do cuidador (a credencial)

É o elemento que mais aparece na jornada e o que diferencia a plataforma (R2/R3). A escala corre
pelo **próprio eixo da marca** e repete a torção de matiz que o símbolo desenha ([seção
1](#a-matiz-gira-e-é-isso-que-segura-a-escala)): **quanto mais alta a credencial, mais fundo e
mais azul o teal** — 199° → 211° → 225°. Credencial é exatamente a grandeza que a marca já
desenha como profundidade.

| Categoria | Token | Base | Soft | H |
|---|---|---|---|---|
| Informal | `cat-informal` | `#1C7376` | `#DFF3F4` | 199° |
| Técnico | `cat-tecnico` | `#005F6C` | `#DDF1F5` | 211° |
| Superior | `cat-superior` | `#004559` | `#DBEFF6` | 225° |

### Regra de contraste

Todo par base/`-soft` acima fecha **4,5:1 ou mais** do texto base sobre o próprio fundo soft —
o mais apertado é `cat-informal`, em 4,85:1. Se você criar um par novo, confira antes: não é
opcional. É por isso que os tons base são mais escuros do que "a cor pura": `#79520A` é o âmbar
que sobrevive a essa conta, `#E8A33D` não era.

### Onde as cores de estado moram

Nunca escreva a classe do crachá na tela. Elas vivem em dois arquivos:

- [`constants/attendance.ts`](../src/constants/attendance.ts) → `ATTENDANCE_STATUS_CLASS`
- [`constants/caregiver.ts`](../src/constants/caregiver.ts) → `CATEGORY_CLASS`, `APPROVAL_STATUS_CLASS`

Cada entrada é o trio `bg-<x>-soft text-<x> border-<x>/25`, consumido pelo `<Cracha>`.

---

## 4. Tipografia

**Uma família só: DM Sans**, servida do próprio projeto (`public/fonts/`, `@font-face` com
`unicode-range`). Não é preferência — é a marca. O símbolo do logo é feito de círculos e cápsulas, e
"ACALENTO" é uma capitular geométrica de bojos redondos; a DM Sans é uma geométrica de baixo
contraste com bojo praticamente circular, o mesmo esqueleto do símbolo na mesma temperatura calma.
Foi comparada lado a lado com Plus Jakarta Sans e Manrope sobre o mesmo conteúdo real do produto
(card de atendimento, tabela de horas, texto curto): a Jakarta comprimia "R$ 180" e os carimbos de
hora, a Manrope alargava demais o texto denso. A DM Sans ficou melhor nos dois pontos que este
produto mais usa.

A Inter saiu. Excelente legibilidade, mas neo-grotesca de bojo oval e desenho de sistema
operacional — nenhuma relação com um logo circular, e a face que a maioria das interfaces geradas
por IA usa, o que trabalha contra um produto que precisa parecer específico numa reunião comercial.

A IBM Plex Mono saiu junto. O papel dela nunca foi tipográfico de verdade — era **alinhar coluna**,
e isso é `font-variant-numeric: tabular-nums`, não uma família inteira. O que sobrava era timbre:
uma slab-grotesca da IBM em horário, valor, data e contador, ou seja, em quase toda a interface
deste produto. Esse papel virou o utilitário `.numero` (tabular, tracking -0.006em, peso 500) —
prova sem sotaque de terminal, dentro da mesma família do texto.

Três pesos, nenhum acima de 600: **400** corpo, **500** rótulo e ênfase, **600** título.
`font-bold` não existe neste produto.

Escala por **papel**, não por pixel — e responsiva nos dois sentidos. `text-display` cresce com a
tela, como se espera. Já `text-note` e `text-meta` fazem o oposto: são **maiores no celular** e
apertam a partir de `md` (768px), porque a leitura em deslocamento pede corpo maior e a tela densa
do desktop comporta mais por linha. É o inverso de "encolher tudo proporcionalmente".

| Utilidade | Celular | `md` e acima | Papel |
|---|---|---|---|
| `text-dado` | 12px | 12px | Rótulo de dado: bloco de número, cabeçalho de tabela. Caixa alta, tracking aberto, peso 600. |
| `text-meta` | 13px | 12px | Carimbo de data/hora, contagem, apoio terciário. |
| `text-label` | 13px | 13px | Rótulo de campo e botão pequeno. Peso 500. |
| `text-note` | 15px | 14px | Texto denso dentro de card e lista, botão. |
| `text-body` | 16px | 16px | Leitura corrente e **todo campo de formulário**. |
| `text-heading` | 15px | 15px | Título de seção, em caixa normal. Peso 600. |
| `text-title` | 19px | 19px | Nome de paciente/cuidador, título de card e de modal. Peso 600. |
| `text-display` | 28px | 34px fluido | Título da página. Uma única voz grande por tela. Peso 600. |

Cada papel já carrega o próprio peso — `text-heading`, `text-title` e `text-display` não precisam
de `font-semibold` no `className`; escrever os dois é redundância que pode divergir.

### `.numero` — o papel que a mono ocupava

Entra em horário de check-in/check-out, horas fechadas, valor, data, documento, contador — número
que o produto precisa **provar** (princípio 3 do `PRODUCT.md`). `tabular-nums` alinha coluna,
o tracking negativo (-0.006em) compensa a largura do algarismo tabular, o peso 500 separa o dado do
texto ao redor sem precisar de outra cor. A regra completa mora em `src/index.css`.

Não é global no `body`: em prosa, algarismo tabular abre buracos ("8 anos de experiência"), e texto
corrido quer figura proporcional. Alinhamento é característica de tabela, não de parágrafo.

### Hierarquia de textos — quem pode aparecer, e quantas vezes

| Nível | Utilidade | Regra de frequência |
|---|---|---|
| Título da página (`h1`) | `text-display` | **Um por tela.** Nunca dois. |
| Título de seção (`h2`) | `text-heading text-ink` | Quantos a tela pedir. Caixa normal — não é mais caixa alta tracked. |
| Rótulo de dado | `text-dado text-ink-subtle uppercase` | Cabeçalho de bloco numérico e de tabela. Caixa alta, é o único papel que ainda carrega esse traço. |
| Título de bloco (`h3`) | `text-heading text-ink` | Nomeia um bloco em tela de detalhe ou formulário. |
| Nome / título de card | `text-title` | Um por card. |
| Corpo | `text-body` ou `text-note` | `note` dentro de card e lista; `body` em leitura corrida. |
| Apoio / carimbo | `text-meta text-ink-subtle` | Data, autoria, contagem. |

`text-display` é o único tamanho fluido (`clamp()`: 28px no celular, 34px a partir de ~1180px) —
teto deliberadamente baixo: título de produto não é título de landing page.

Texto corrido (bio, observação, estado vazio) recebe a classe `.prosa`, que trava a medida em 62
caracteres.

### Por que "caixa alta tracked" quase sumiu

Os títulos de seção (`h2`) eram `text-label uppercase tracking-wide` — a fórmula-padrão de SaaS
genérico. Ficou só onde o conteúdo é de fato um rótulo de dado (cabeçalho de tabela, legenda de
métrica): ali a caixa alta separa rótulo de valor. Em título de seção ela competia com o próprio
peso 600 do `text-heading` para dizer a mesma coisa duas vezes.

---

## 5. Forma — espaçamento, grid, raio, borda, elevação

### Espaçamento

Escala do Tailwind, sem valores arbitrários. Os degraus que o produto usa:

| Uso | Valor | Pixels |
|---|---|---|
| Dentro de um chip / entre ícone e rótulo | `gap-1.5` `gap-2` | 6 · 8 |
| Entre linhas de metadado dentro de card | `mt-0.5` `gap-y-1` | 2 · 4 |
| Padding de card | `p-3.5` | 14 |
| Entre cards de uma lista | `gap-2.5` | 10 |
| Entre título de seção e o conteúdo | `mb-2.5` | 10 |
| Entre seções de uma página | `mt-7` | 28 |
| Margem da página | `px-6` · `py-7` | 24 · 28 |
| Largura de leitura da página | `mx-auto max-w-2xl` | 672 |

O ritmo é **2 → 4 → 8 → 14 → 28**: dobra a cada degrau importante. Em dúvida entre dois valores,
use o menor — a densidade é intencional, a coordenadora quer ver oito plantões sem rolar.

### Grid e organização de layout

O produto **não tem grid de colunas**. Tem uma coluna de leitura (`max-w-2xl`) e três arranjos
dentro dela:

| Arranjo | Como | Onde |
|---|---|---|
| Pilha | `flex flex-col gap-2.5` | Lista de cards — o arranjo padrão, e o único em celular. |
| Grade de campos | `grid grid-cols-2 gap-2 sm:grid-cols-3` | Sinais vitais, pares de campo curto. Começa em 2 colunas, vai a 3 a partir de `sm`. |
| Faixa de números | `grid grid-cols-N gap-px bg-linha` | Painéis. Os divisores são o fundo aparecendo entre as células. |

**Regra:** em celular, nada além de campo curto vai para duas colunas. Card em duas colunas a
390px produz nome de paciente truncado — e o nome do paciente é a informação que a tela existe
para mostrar.

### Raio — quatro, por papel

| Utilidade | Valor | Uso |
|---|---|---|
| `rounded-marker` | 3px | Crachá de estado, marcador, pastilha de contagem. |
| `rounded-control` | 6px | Botão, campo, chip, item de lista. |
| `rounded-card` | 9px | Card, painel, moldura de lista. |
| `rounded-panel` | 12px | Modal e folha do celular. |
| `rounded-full` | — | **Só** avatar, crachá de credencial e ponto. Nada mais. |

Raio nunca é decorativo: ele diz o tamanho do papel. Um bloco com `rounded-panel` dentro de um card
com `rounded-card` inverte a hierarquia e sempre parece errado, mesmo quando ninguém sabe dizer
por quê.

**Os valores caíram na revisão 13** (10 / 14 / 18 → 6 / 9 / 12). Não é ajuste de gosto: quinze
plantões numa lista, cada um em 14px de canto, param de parecer registros e passam a parecer
cartões. Canto muito arredondado é a assinatura visual de template — e custa densidade, porque
raio grande exige padding grande para o conteúdo não encostar na curva.

**`rounded-full` deixou de ser padrão.** Era a forma de crachá de estado, de chip de filtro, de
pastilha de contagem e de etiqueta de foto. Pílula em toda parte é o que mais fazia o produto
parecer um painel genérico; hoje a cápsula está reservada ao que é **redondo por natureza** —
avatar, ponto, e o crachá de credencial, que imita um crachá de verdade.

### Borda

Sempre `border-linha`. Campo de formulário usa `border-[1.5px]` (a borda de 1px some no celular);
todo o resto usa 1px. `hover` de card ou item clicável: `hover:border-accent/45` — nunca a cor
cheia, que faz a lista inteira piscar quando o mouse passa.

Borda **tracejada** (`border-dashed`) não existe mais neste produto. Era a moldura do estado
vazio, e saiu junto com ela na revisão 13: ver seção 8.2.

### Elevação — sombra significa **uma** coisa

| Utilidade | Uso |
|---|---|
| `shadow-raised` | Barra de ação flutuante do celular, barra inferior de navegação. |
| `shadow-overlay` | Modal e folha do celular. |
| `shadow-card` | Token que sobrou para casos futuros. **Não use em card nem em item de lista.** |

As três usam a tinta fria do ambiente (`rgb(29 33 34 / …)`), nunca preta: sombra preta sobre este
fundo produz aquele cinza sujo que faz a tela parecer template.

**A regra mudou na revisão 13, e é curta:**

> Sombra é **elevação de verdade** — o que está por cima de outra coisa e pode ser fechado ou
> rolado por baixo. Modal, folha, barra flutuante. Nada mais.

Antes, `shadow-card` estava em todo card, em todo item de lista, no botão primário e no chip
aceso. O efeito somado não era profundidade: era uma tela inteira de objetos flutuando a 1px de
altura, que é exatamente a textura de um template moderno. O que separa conteúdo agora é **borda
de 1px e espaço**, e a hierarquia vem de posição e densidade.

Card em `hover` também perdeu a sombra: onde existe `hover`, quem responde é a cor de fundo
(`hover:bg-surface-sunken/60`) ou a borda, não a altura.

---

## 6. Movimento — duração, curva, microinteração, transição

Movimento aqui tem uma função só: **confirmar que o toque foi recebido e mostrar de onde a coisa
veio.** Não há animação de entrada decorativa, não há elemento que flutua sozinho, não há
`transition-all`. Este é um produto que alguém opera em pé, com pressa, no corredor de um
hospital — animação que atrasa a resposta é um defeito, não um acabamento.

### As duas durações e a única curva

| Token de uso | Valor | Onde |
|---|---|---|
| `duration-150` | 150ms | **Padrão.** Toda mudança de cor, borda, sombra e escala em resposta a toque, `hover` ou foco. |
| `duration-200` | 200ms | Só onde o elemento muda de **tamanho**, não de cor: marcador do `<Stepper>` ao avançar de etapa. |
| `ease-out` | — | A única curva. Sai rápido, chega devagar: a resposta parece imediata e o fim parece assentar. |

Nada no produto passa de 200ms. Se um movimento precisa de mais tempo para ser entendido, o
movimento está errado — ou o que mudou na tela é grande demais e devia ser uma tela nova.

### Transicione propriedades nomeadas, nunca `all`

`transition-all` anima também o que você não viu: `width` durante o cálculo de layout, `opacity`
durante a montagem, `box-shadow` que você nem sabia que existia. Em lista longa isso é o que
produz aquele arrasto no celular. Escreva as propriedades:

| Padrão em uso | Onde | ✅ |
|---|---|---|
| `transition-colors` | Item de navegação, botão de fechar, campo, chip | ✅ |
| `transition-[border-color,box-shadow]` | Card clicável (`hover` sobe a borda e a sombra) | ✅ |
| `transition-[background-color,transform]` | Botão-que-é-link (ver `<Button>`, seção 7) | ✅ |
| `transition-[background-color,border-color,color,transform,filter]` | `<Button>` — cobre as quatro variantes com uma string só | ✅ |

### Microinterações — o catálogo completo

| Microinteração | Gatilho | O que acontece | Onde |
|---|---|---|---|
| **Afundar no toque** | `:active` | `scale-[0.97]`, 150ms | `<Button>` e botão-que-é-link. É o principal retorno tátil do produto no celular, onde não existe `hover`. |
| **Card acorda** | `:hover` | Borda vai a `accent/45`, sombra sobe de `card` para `raised` | Card clicável, `CaregiverCard`. **Só desktop** — em toque não dispara. |
| **Item de nav aquece** | `:hover` | Fundo vai a `surface-raised` | Barra lateral. O branco sobre o cinza da barra é o que torna o `hover` visível. |
| **Campo foca** | `:focus` | Borda vai a `accent` (150ms) + anel global de `:focus-visible` | `<Input>` `<Select>` `<Textarea>` |
| **Botão destrutivo recua** | `:hover` | `brightness-95` | `<Button variant="destructive">` |
| **Etapa avança** | Mudança de `currentIndex` | Marcador cresce de `size-2.5` para `size-3.5` e ganha anel, 200ms | `<Stepper>` |
| **Anel de foco** | `:focus-visible` | Aparece sem transição, instantâneo | Global, `index.css` |

O anel de foco é o único que **não** tem transição, de propósito: quem navega por teclado precisa
saber onde está no mesmo quadro em que aperta Tab.

### Transições entre telas

**Não existem, e é uma decisão.** A navegação é `react-router` trocando a árvore sem animação.
Motivo: as duas navegações mais frequentes do produto — trocar de aba na barra inferior e abrir o
detalhe de um atendimento — acontecem dezenas de vezes por turno. Um deslize de 250ms em cada uma
soma um atraso perceptível ao longo do dia e não informa nada que a barra de abas já não diga.

O que fica no lugar da animação, e é obrigatório:

1. **A aba ativa muda no mesmo quadro** — cor da marca + traço de 2px no topo.
2. **O título da página (`h1`) é a primeira coisa que o olho encontra**, sempre no mesmo lugar.
3. **A rolagem volta ao topo** ao entrar em tela nova.

O único deslocamento animado previsto no produto é a entrada do **bottom sheet** (seção 7), que
sobe da borda inferior — e ali o movimento é a informação: diz de onde a folha veio e para onde
ela volta ao ser fechada.

### Movimento reduzido ✅

Quem liga `prefers-reduced-motion` no sistema não está pedindo uma tela mais sóbria: está pedindo
que deslocamento e mudança de escala parem, porque disparam sintoma vestibular. A regra vive em
[`index.css`](../src/index.css) e zera durações globalmente.

**Mudança de cor continua acontecendo.** A regra zera a duração em vez de remover a transição:
cor não desloca nada, e desligá-la tiraria o retorno de `hover` e de foco sem devolver nada. O que
some por inteiro é o `transform`, e ele some por um gancho explícito:

| Atributo | Onde | Efeito sob movimento reduzido |
|---|---|---|
| `data-movimento="afunda"` | `<Button>`, `<ButtonLink>` | O `active:scale-[0.97]` não acontece. |
| `data-movimento="sobe"` | `<Modal>`, `<Toast>` | A folha e o aviso aparecem sem deslocar. |
| `.esqueleto` | `<Skeleton>` | Pulsação desligada, opacidade fixa em 0,75. |
| `.girando` | Botão carregando | **Exceção deliberada:** continua girando, mais lento. Um giro congelado seria pior do que nenhum — ele é a única prova de que a ação está em andamento. |

Componente novo que desloca ou muda de escala **precisa** declarar `data-movimento`, senão a
preferência não o alcança.

---

## 7. Componentes base

Tudo abaixo vem de `src/components/ui/` e é exportado pelo barril
[`src/components/ui/index.ts`](../src/components/ui/index.ts).

---

### `<Button>` ✅

**Objetivo.** Carregar toda decisão clicável do produto com um peso visual proporcional ao peso da
decisão.

**Onde.** Todas as telas. É o componente mais usado do sistema.

**Estrutura visual.** `inline-flex` com `gap-1.5` entre ícone e rótulo, `rounded-control`,
`font-semibold`, ícone opcional à esquerda (`lucide-react`, 13–15px).

**Variações — quatro, uma por peso de decisão.**

| Variante | Visual | Quando |
|---|---|---|
| `primary` | `bg-accent`, texto `accent-ink`, sem sombra | A ação da tela. **Uma por tela.** |
| `secondary` | `bg-ink`, texto `surface` | Alternativa de mesmo peso. |
| `ghost` | Branco com `border-linha` | Ação de apoio que precisa existir sem disputar atenção. |
| `destructive` | `bg-status-cancelado`, texto branco | O que não dá para desfazer. |

**Tamanhos — dois.**

| Tamanho | Classes | Altura em celular | Altura em desktop | Uso |
|---|---|---|---|---|
| `md` (padrão) | `min-h-11 px-4 py-2.5 text-note` | **44px** | 44px | Tudo em celular, e a ação principal em desktop. |
| `sm` | `min-h-11 px-3 py-1.5 text-label md:min-h-9 md:px-2.5` | **44px** | 36px | Ação secundária dentro de card. |

O `sm` **cresce para 44px no celular e volta a encolher a partir de `md`**: o polegar precisa do
alvo, o ponteiro não, e uma fila de botões gordos no desktop desperdiça a densidade que a
coordenadora quer. É o mesmo raciocínio do `<Chip>`.

`block` ocupa a largura toda. Em celular, a ação primária de um formulário é sempre `block`.

As classes moram em [`button-classes.ts`](../src/components/ui/button-classes.ts), fora do
componente, porque `<Button>` e `<ButtonLink>` são elementos diferentes com o mesmo visual — e a
única forma de não divergirem é não haver duas cópias.

**Estados.**

| Estado | Visual |
|---|---|
| Normal | Conforme a variante. |
| `hover` | `primary` → `accent-strong`; `ghost` → borda `accent/45` e texto `ink`; `destructive` → `brightness-95`; `secondary` → `ink/90`. |
| `active` | `scale-[0.97]` — o retorno tátil do celular. |
| `focus-visible` | Anel global de 2px em `accent`, offset 2px. Não escreva foco no componente. |
| `disabled` | `opacity-45`, sem sombra, `cursor-not-allowed`. |
| `loading` ✅ | Giro à esquerda do rótulo, botão desabilitado, `aria-busy`. O rótulo vai para o gerúndio ("Publicando…"): o retorno fica onde o dedo está, não no topo da tela. |

**Movimento.** `transition-[background-color,border-color,color,transform,filter] duration-150
ease-out`, e `data-movimento="afunda"` para que o `active:scale` respeite movimento reduzido.

**Mobile.** Nunca use `size="sm"` como única forma de disparar uma ação em celular. Dois botões
lado a lado numa largura de 390px só cabem com `size="sm"` — se for esse o caso, empilhe com
`flex-col gap-2` e mantenha `md`.

**Exemplo.**

```tsx
<Button block>Publicar atendimento</Button>
<Button block loading>Publicando…</Button>
<Button variant="ghost" size="sm"><Camera size={13} /> Anexar foto</Button>
<Button variant="destructive" size="sm" onClick={() => setResetting(true)}>Restaurar dados</Button>
```

**Restrições.**

- Nunca duas `primary` na mesma tela.
- Nunca `<button>` solto com classes copiadas.
- Ícone sozinho, sem rótulo, exige `aria-label`.
- Se a ação **navega**, é `<ButtonLink>`, não `<Button>`.

---

### `<ButtonLink>` ✅

**Objetivo.** A mesma ação, quando ela navega.

**Onde.** "Novo atendimento" no painel e na lista de atendimentos; "Ver convites" no painel do
cuidador.

**Por que existe.** `<Button>` renderiza `<button>`, e um destino precisa de `<a>` — para abrir em
nova aba, aparecer no menu de contexto e ser anunciado como link. Antes disso, a string de classes
da variante `primary` estava **copiada em três telas**, e era questão de tempo até divergirem.

**API.** Idêntica à do `<Button>` (`variant`, `size`, `block`) mais as props do `<Link>`. As
classes vêm de `buttonClass()`, a mesma fonte.

```tsx
<ButtonLink to="/empresa/atendimentos/novo"><Plus size={15} /> Novo atendimento</ButtonLink>
```

**Restrição.** Se a ação não navega, é `<Button>`. Link que executa em vez de navegar quebra o
clique do meio, o "abrir em nova aba" e a leitura por leitor de tela.

---

### `<Chip>` ✅

**Objetivo.** Filtro e seleção em fila — abas de lista, período, categoria, dias, turnos.

**Onde.** Atendimentos (filtro de status), Cuidadores (abas do quadro, categoria, favoritos),
Escala (hoje/semana), Novo atendimento (tipo), Perfil do cuidador (dias e turnos).

**Estrutura visual.** `rounded-full`, `text-note font-semibold`, `px-3.5 py-1.5`, ícone opcional à
esquerda.

**Variações — duas, e a diferença importa.**

| Modo | Selecionado | Quando |
|---|---|---|
| `unico` (padrão) | `bg-accent text-accent-ink` | Só um item aceso por vez. Para **abas de lista**, use `<Tabs>`. |
| `multiplo` | `border-accent/35 bg-accent-soft text-accent` | Vários acesos juntos: dias da semana, turnos. |

Sete pastilhas azuis sólidas lado a lado — os dias da semana, todos marcados — pesam mais que o
formulário inteiro. Por isso o chip cheio fica reservado ao filtro de escolha única.

**Estados.** Inativo (`border-linha bg-surface-raised text-ink/60`) · `hover` (borda `accent/45`,
texto `ink`) · selecionado · foco (anel global).

**Movimento.** `transition-colors duration-150 ease-out`. **Não** 200ms: chip só muda de cor, e
200ms é a duração reservada ao que muda de tamanho (seção 6). As oito cópias anteriores usavam
`duration-200` — foi o que a extração corrigiu.

**Mobile.** `min-h-11` (44px) em celular, `md:min-h-8` no desktop. Uma fila que não cabe **quebra
em duas linhas** (`flex-wrap gap-1.5`); nunca vira faixa de rolagem horizontal, que esconde opções
sem nenhuma affordance.

**Exemplo.**

```tsx
<Chip selecionado={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>
<Chip selecionado={dias.includes(d)} modo="multiplo" onClick={() => alterna(d)}>{rotulo}</Chip>
```

**Restrições.** `aria-pressed` já vem de dentro — não declare de novo. Grupo de chips vai em
`fieldset`/`legend`. Chip não navega: para isso existe `<ButtonLink>`.

---

### `<Painel>` ✅ — o contêiner de conteúdo

**Objetivo.** Delimitar uma região de conteúdo com cabeçalho, sem fingir altura. É o contêiner que
substituiu a maior parte dos `<Card>` do módulo de Atendimentos.

**A diferença é de papel, não de estilo:**

| | O que é | Forma |
|---|---|---|
| `<Card>` | uma **superfície solta no fluxo** — caixa de entrada, resumo lateral | borda 1px, `rounded-card`, `p-3.5` |
| `<Painel>` | um **bloco do documento** com cabeçalho e conteúdo estruturado | borda 1px, cabeçalho em faixa rebaixada, sem sombra |
| `<Secao>` | uma **região nomeada** cujo conteúdo já se delimita sozinho | nenhuma moldura: rótulo + conteúdo, com uma de duas tintas |
| nenhum dos três | listas de registro | usam a moldura do próprio `<AttendanceList>` |

**Estrutura.** Cabeçalho opcional (`title` + `count` + `actions`) numa faixa `bg-surface-sunken/60`
com `border-b`; conteúdo com `p-3.5`, ou colado à borda com `flush` quando o filho é uma lista.

```tsx
<Painel title="Em aberto" count={4} flush actions={<Link …>Ver todos</Link>}>
  <ul className="divide-y divide-linha">{/* linhas */}</ul>
</Painel>
```

**Duas variantes, e a diferença é de peso:**

| | `padrao` | `quieto` |
|---|---|---|
| Superfície | `bg-surface-raised` — o bloco branco | `bg-transparent` — só a moldura de 1px |
| Cabeçalho | faixa `bg-surface-sunken/60` + `border-b` | sem faixa e sem borda; `px-3 pt-2.5 pb-1.5` |
| Contagem | pastilha `<Contador>` | número puro, `numero text-meta text-ink-subtle` |

`quieto` é **ainda um card** — a moldura fica —, mas sobre o fundo `--surface` ele deixa de flutuar
e passa a delimitar, que é a definição de painel. É a forma do bloco de **apoio**, que precisa
estar sempre à vista sem competir com o conteúdo principal ao lado: Pendências, no Início da
empresa. Um painel quieto costuma vir sem `divide-y` na lista interna — o divisor é o que faz dez
linhas parecerem dez caixas empilhadas.

**Restrições.** Painel dentro de painel é erro, como card dentro de card. Um painel contém listas,
tabelas e linhas de dado — nunca outro contêiner com moldura. Para separar blocos **dentro** de um
painel, use um fio (`border-t border-linha pt-3.5`) e um rótulo `text-dado uppercase`, nunca uma
segunda caixa.

---

### `<Secao>` ✅ — a região sem moldura

**Objetivo.** Nomear uma região da página **sem desenhar uma caixa em volta dela**.

É o terceiro degrau da escada de contêineres, e ele faltava:

| | O que é | Forma |
|---|---|---|
| `<Card>` | superfície **elevada** — flutua sobre a página | borda, raio, às vezes sombra |
| `<Painel>` | bloco **delimitado** | borda de 1px, cabeçalho em faixa |
| `<Secao>` | região **nomeada** | nenhuma moldura: rótulo + conteúdo |

**Por que ele nasceu.** O Início da empresa tinha cinco painéis empilhados numa tela só. Cada um
anunciava "aqui começa uma caixa" antes de deixar ler o que interessa, e somados eram cinco
bordas, cinco faixas de cabeçalho e cinco fundos brancos sobre o fundo cinza — mais peso visual do
que o conteúdo que separavam. É esse acúmulo que faz uma tela de trabalho parecer painel genérico
de dashboard.

A seção inverte a pergunta: uma **lista de plantões já parece uma lista**. Os fios entre as linhas
e o alinhamento das colunas fazem esse trabalho sozinhos. O que ela precisa é de um nome, não de
uma parede.

**Estrutura.**

```
ATENDIMENTOS DE HOJE · 3                                    Ver todos
[conteúdo, colado logo abaixo]
```

| Peça | Valor |
|---|---|
| Rótulo | `text-dado` (12px / 600 / `0.045em`) `uppercase`, tinta `--ink-muted` |
| Contagem | `numero`, `--ink-subtle`, precedida de `· ` — **número puro, nunca `<Contador>`** |
| Ações | à direita, `SECAO_LINK_CLASS` — `text-meta font-semibold text-accent`, sublinhado no hover |
| Folga | `pb-1.5` entre o cabeçalho e o conteúdo. Nada mais. |

A pastilha do `<Contador>` serve dentro de uma faixa de cabeçalho, onde precisa se destacar de um
fundo. Solta sobre a página ela vira mais uma caixinha — exatamente o que a seção existe para não
ter. O ponto médio é `aria-hidden`: quem ouve a tela recebe "Atendimentos de hoje 3".

```tsx
<Secao title="Atendimentos de hoje" count={3} variant="destaque">
  <AttendanceList variant="fluxo">{/* linhas */}</AttendanceList>
</Secao>
```

#### As duas tintas — `padrao` e `destaque`

| | `padrao` | `destaque` |
|---|---|---|
| Rótulo | `--ink-muted` | **`--ink`** |
| Contagem | `--ink-subtle` | `--ink-muted` |
| Contêiner, fundo, borda, raio, espaço | — | **idênticos**. Nada além da tinta muda. |

`destaque` é a **única** diferença permitida entre duas seções da mesma coluna, e é assim de
propósito. Numa tela sem molduras, onde todas as regiões estão no mesmo plano, subir o rótulo um
degrau de tinta é um contraste que se vê de relance e não custa um pixel de altura nem uma linha
a mais de desenho.

Use em uma ou duas regiões por tela — as que a pessoa abriu a tela para ver. No Início da empresa
são "Atendimentos de hoje" e "Em aberto"; "Próximos" e "Atividade recente" ficam no `padrao`,
porque são contexto e histórico. Se todo rótulo é `--ink`, nenhum é.

**Não existe variante com superfície, e a tentativa está registrada.** A revisão 18 experimentou
dar à seção inteira um fundo branco com moldura de 1px e `rounded-card` — sem sombra, uma caixa
por região e não por registro. Não passou: **borda + raio + fundo é a assinatura do card**,
qualquer que seja o conteúdo, e duas dessas empilhadas no topo do Início reconstroem exatamente a
pilha de painéis que a revisão 15 desmontou. Vale a regra da seção 5 até o fim — o que separa
conteúdo é borda de 1px e espaço, e a hierarquia vem de posição, densidade e tinta. Se uma região
precisa mesmo de moldura, ela não era uma seção: era um `<Painel>`.

**A ação do cabeçalho é um alvo de 44px.** "Ver todos" e "Ver escala" eram texto de 13px solto num
cabeçalho: ~18px de altura clicável, abaixo do piso da seção 11, num link que a coordenadora usa de
pé com o telefone numa mão. `SECAO_LINK_CLASS` traz `min-h-11`, e o contêiner de ações devolve a
altura extra ao layout com `-my-2.5` — **aumenta a área, não o desenho**. No ponteiro o alvo
encolhe sozinho (`pointer-fine:min-h-0`) e a margem negativa se desliga junto, então o cabeçalho de
desktop não muda um pixel.

Por isso o `<header>` alinha por `items-center` e não por `items-baseline`: uma caixa de 44px
alinhada pela linha de base empurraria o texto do link ~12px abaixo do rótulo da seção.

**Quando usar cada um.** Se o conteúdo é uma lista ou tabela que **já se delimita sozinha**, use
`<Secao>`. Se é conteúdo solto que precisa ser recortado do resto da página — um resumo, um
formulário curto, um bloco de dados —, use `<Painel>`.

**Estado vazio.** Dentro de uma seção o vazio usa `<Vazio porte="solto">`: mesma altura do
`porte="linha"`, **sem** o recuo horizontal. Não existe borda de painel da qual afastar o texto, e
o recuo só desalinharia a frase em relação às linhas da lista.

---

### `<ListaDeDados>` · `<Dado>` ✅

**Objetivo.** Par termo/valor alinhado — o jeito de mostrar dados operacionais de um registro:
data, horário, endereço, perfil exigido, cuidador, valor.

**Onde.** Ficha do atendimento, próximo atendimento do cuidador, proposta de convite, resumo do
novo atendimento.

**Estrutura.** `<dl>` de verdade, com `divide-y` entre as linhas: termo à esquerda em
`text-ink-subtle`, valor à direita em `text-ink`. A coluna de valores alinha sozinha, que é o que
faz um bloco de dados parecer registro e não texto corrido — e quem usa leitor de tela ouve o par
em vez de duas frases soltas.

```tsx
<ListaDeDados>
  <Dado termo="Quando"><span className="numero">Ter, 25/08 · 07:00</span></Dado>
  <Dado termo="Valor"><span className="numero">R$ 180</span></Dado>
</ListaDeDados>
```

**Substituiu** os blocos `grid grid-cols-2` que existiam para mostrar duas informações dentro de um
card. Todo número vai com `.numero`, senão a coluna da direita não alinha.

---

### `<Tabs>` ✅ — escolher **um** recorte

**Objetivo.** Alternar entre recortes de uma mesma lista, com a contagem de cada um à vista.

**Onde.** Atendimentos (Todos / Em aberto / Agendados / Encerrados / Rascunhos), Escala (Hoje /
7 dias).

**Estrutura.** Aba sublinhada: o item aceso é dito por **posição e traço** (`border-b-2`), não por
um bloco de cor. A linha de base corre por baixo de todas e amarra a fila ao conteúdo abaixo. A
aba inativa carrega a mesma borda em transparente — assim não muda de altura ao acender, que é o
pulo que mais denuncia componente montado às pressas.

```tsx
<Tabs abas={abas} atual={filter} onChange={setFilter} label="Recorte dos atendimentos" />
```

**Por que não `<Chip>`.** O filtro era uma fila de pastilhas de 999px com a selecionada pintada de
teal cheio. Cinco pastilhas coloridas no topo de uma lista competem com a lista. `<Chip>` continua
sendo o certo para **seleção** — dia, turno, atividade, vários acesos ao mesmo tempo.

**Contagem.** Vem de `<Contador>` (retângulo de 3px, tabular), e é calculada **dentro do recorte
corrente** de busca e período — senão a aba promete dez e entrega dois. `0` aparece: é informação.

**Mobile.** Rola na horizontal, sangrando até a borda (`-mx-6 px-6`), pelo mesmo motivo do
`<FilterRow>`.

---

### `<Card>` ✅

**Objetivo.** A superfície padrão de todo conteúdo. Separa um item do fundo sem virar caixa pesada.

**Onde.** Listas de atendimento, cuidador, convite, candidatura; blocos de detalhe e formulário.

**Estrutura visual.** `rounded-card border border-linha bg-surface-raised p-3.5` — **sem sombra**
desde a revisão 13. Para conteúdo com cabeçalho e estrutura interna, use `<Painel>`.

**Variações.** Uma só. O que muda é o conteúdo, não a moldura. Card clicável acrescenta
`transition-[border-color,box-shadow] duration-150 ease-out hover:border-accent/45
hover:shadow-raised`.

**Estados.** Normal · `hover` (só clicável, só desktop) · `focus-visible` (anel global, quando o
card é `<Link>`).

**Espaçamento.** Padding interno `p-3.5`. Entre cards da mesma lista, `gap-2.5`. Entre o título da
seção e o primeiro card, `mb-2.5`. Dentro do card, o ritmo vertical é `mt-2.5` entre blocos e
`mt-0.5` entre a linha principal e seu subtítulo.

**Mobile.** Card é sempre **largura total, empilhado**. Nunca em grade. O layout interno usa
`flex-wrap` para que a faixa de metadados quebre em duas linhas a 390px em vez de truncar. O
nome do paciente fica em `min-w-0` com o crachá em `shrink-0`: quando falta espaço, o crachá
sobrevive inteiro e o nome trunca — nessa ordem, porque o status é o que decide se a coordenadora
precisa abrir o card.

**Exemplo.**

```tsx
<Card>
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">…</div>
    <Cracha label={…} className={ATTENDANCE_STATUS_CLASS[a.status]} />
  </div>
</Card>
```

**Restrições.** Nada de card dentro de card. Se um bloco precisa de moldura dentro de um card,
ele é `rounded-control border border-linha`, sem sombra.

---

### `<Input>` · `<Select>` · `<Textarea>` ✅

**Objetivo.** Entrada de dados com uma moldura só para o produto inteiro.

**Onde.** Novo atendimento, cadastro, entrada, sinais vitais, observações, filtros de busca.

**Estrutura visual.** Os três compartilham a mesma moldura, definida uma única vez em
[`src/components/ui/field.ts`](../src/components/ui/field.ts):

```ts
FIELD_LABEL_CLASS = "mb-1.5 block text-label font-medium text-ink/65"
FIELD_CLASS = "w-full rounded-control border-[1.5px] border-linha bg-surface-raised px-3 py-2
               text-body text-ink outline-none transition-colors duration-150 …"
```

Antes cada um repetia a string e o `focus` já tinha divergido entre eles. Se precisar de um campo
novo (data, moeda, busca), **importe essas constantes** em vez de recriar a moldura.

**Estados.**

| Estado | Visual |
|---|---|
| Normal | Borda `linha` de 1,5px sobre branco. |
| `placeholder` | `text-ink/35`. |
| `focus` | Borda `accent` + anel global de `:focus-visible`. |
| `disabled` | `bg-surface-sunken`, texto `ink/40`, `cursor-not-allowed`. |
| `error` ✅ | Borda `status-cancelado` + mensagem em `text-meta` logo abaixo, ligada por `aria-describedby`, com `aria-invalid` no controle. A cor nunca vai sozinha — a frase é que diz o que fazer. |

```tsx
<Input label="Valor oferecido (R$)" value={value} error="Informe o valor oferecido." />
```

**Espaçamento.** Rótulo a 6px (`mb-1.5`) do campo. Entre campos de um formulário, `gap-3`. Entre
grupos, `mt-4`.

**Mobile — a regra que não se negocia.** Campo é sempre `text-body` (16px). **Abaixo de 16px o
Safari do iPhone dá zoom sozinho ao focar o campo**, o formulário sai do enquadramento e o usuário
precisa fechar o zoom com dois dedos a cada campo. A altura resultante do campo é ~44px, o que
resolve o alvo de toque no mesmo movimento.

A borda usa `--linha-strong` (`#838D8E`) e não `--linha`, e tem 1,5px. As duas coisas resolvem
problemas diferentes: a espessura é para a tela do celular sob luz ambiente forte; o token é para
a WCAG 1.4.11, que cobra 3:1 de qualquer coisa que delimite um controle. Num campo vazio a borda
é a única coisa que diz onde o campo começa — com `--linha` ela ficava em 1,27:1, e engrossar
não muda contraste.

O `<Select>` substitui a seta nativa — que muda de desenho em cada navegador — pelo chevron do
produto.

**Restrições.** Todo campo tem `<label>` associado, sempre visível. `placeholder` não substitui
rótulo: ele some quando o usuário começa a digitar, e quem foi interrompido no meio do formulário
perde a referência.

---

### `<Cracha>` — elemento de assinatura ✅

**Objetivo.** Dizer o estado de uma coisa (atendimento, cadastro) ou a credencial de uma pessoa,
em um chip que se lê de relance numa lista de quinze itens.

**Onde.** Card de atendimento, card e perfil de cuidador, fila de aprovação, convites,
candidaturas, selo de verificado, registro no conselho de classe.

**Estrutura visual.** Chip `rounded-full`, `text-meta font-semibold`, `py-[3px] pr-2.5 pl-3`, com
um **furo de lanyard** na borda esquerda — um ponto de 6px em `bg-current opacity-65`, posicionado
absolutamente. É o furo que faz o elemento ser um crachá e não mais um chip genérico.

**Variações.** Não tem variação de forma — só de cor, e a cor **sempre** vem de um mapa em
`constants/` (seção 3). O `icon` opcional entra antes do rótulo.

**Estados.** Estático. Crachá não é clicável, não tem `hover`, não tem foco.

**Mobile.** `shrink-0` — o crachá nunca encolhe nem quebra linha. Numa lista apertada, quem trunca
é o nome ao lado. O texto está no piso de 12px e não desce mais.

**Exemplo.**

```tsx
<Cracha label={ATTENDANCE_STATUS_LABEL[a.status]} className={ATTENDANCE_STATUS_CLASS[a.status]} />
<Cracha label={CATEGORY_LABEL[c.category]} className={CATEGORY_CLASS[c.category]} />
<Cracha label="Verificado" icon={<BadgeCheck size={12} />} />
```

**Restrições.** **É tinta sobre fundo claro, não cor cheia com texto branco.** Duas razões: num
ambiente verde e branco, seis pastilhas saturadas na mesma lista viram ruído e escondem o que a
coordenadora precisa ler — o nome do paciente, o horário; e texto branco sobre âmbar ficava em
~2,2:1 de contraste, abaixo do mínimo legível. Nunca escreva o trio de classes na tela.

---

### `<Stepper>` ✅

**Objetivo.** Mostrar em que ponto do ciclo um atendimento está, sem depender de cor.

**Onde.** Tela de detalhe do atendimento.

**Estrutura visual.** Marcadores redondos ligados por uma linha de 2px, com os rótulos das etapas
embaixo em `text-meta`.

**Estados dos marcadores.**

| Etapa | Marcador | Linha à esquerda | Rótulo |
|---|---|---|---|
| Concluída | `size-2.5 bg-accent` | `bg-accent/45` | `text-ink/45` |
| Atual | `size-3.5 bg-accent ring-4 ring-accent/20` | — | `font-semibold text-accent` |
| Futura | `size-2.5 bg-linha` | `bg-linha` | `text-ink/45` |

A etapa atual é dita por **posição + peso do texto + tamanho do marcador + anel**, e só depois
pelo tom — cor é reforço, não a informação (regra 3).

**Movimento.** `transition-colors duration-200` no marcador.

**Mobile.** Os rótulos dividem a largura em partes iguais (`flex-1`) e ficam centralizados. Com
quatro etapas a 390px, cada rótulo tem ~90px: cabem duas palavras curtas. **Rótulo de etapa tem
no máximo duas palavras** — se precisar de mais, o nome da etapa está errado.

---

### `<Modal>` ✅ — uma implementação, duas formas

**Objetivo.** Pedir uma confirmação ou uma decisão curta sem tirar a pessoa da tela onde ela está.

**Onde.** Confirmação de recusa de cadastro, restauração dos dados da demonstração, decisões sobre
candidatura.

**Estrutura visual.** Em **celular** é uma folha que sobe da borda inferior, onde o polegar já
está; a partir de `md` é a caixa centralizada de sempre. **Quem chama não escolhe** — a tela não
sabe a diferença, e não existe um `<BottomSheet>` separado para lembrar de usar.

```
Celular (< md)                         Desktop (≥ md)
┌─────────────────────────────┐        ┌──────────────────────┐
│            ▂▂▂▂             │ alça   │  Título        [ ✕ ] │
│  Título              [ ✕ ]  │        │ ──────────────────── │
│ ─────────────────────────── │        │  conteúdo            │
│  conteúdo (rola aqui)       │        │  [Cancelar][Confirmar]│
│  [Cancelar]    [Confirmar]  │        └──────────────────────┘
└─────────────────────────────┘         centralizada, 420px
   colada embaixo, largura total
```

| Propriedade | Celular (< `md`) | Desktop (≥ `md`) |
|---|---|---|
| Ancoragem | Borda inferior, largura total | Centralizada |
| Raio | `rounded-t-panel` (só em cima) | `rounded-panel` |
| Largura | 100% | `max-w-[420px]` |
| Altura máxima | `85dvh` | `80dvh` |
| Entrada | Sobe da borda, 200ms `ease-out` | Só o véu esmaece |
| Alça de arraste | Presente | Ausente |
| Safe area | `pb-[max(1.25rem,env(safe-area-inset-bottom))]` | `pb-5` |

**Estados.** Fechado · abrindo (200ms) · aberto · arrastando · fechando (200ms).

**Como fecha — cinco caminhos, todos passando pela mesma saída animada:**

1. Botão ✕ (alvo de 44px).
2. Toque no véu.
3. **Tecla Esc.**
4. **Arraste para baixo** além de 25% da altura da folha.
5. Chamada de `onClose` pelo conteúdo.

**Acessibilidade — o que o componente garante sozinho.** Era a maior dívida do produto e agora
está fechada:

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` apontando para o título.
- O foco **entra** no painel ao abrir e **volta para o elemento que o abriu** ao fechar.
- O foco fica **preso** dentro da folha: Tab no último elemento volta ao primeiro, Shift+Tab no
  primeiro vai ao último.
- Esc fecha.
- A rolagem do fundo trava, com o padding que compensa a barra de rolagem — senão a página inteira
  dá um salto lateral ao abrir.

**Movimento.** `translate-y-full → translate-y-0` em 200ms `ease-out`, e o véu em `opacity`. É a
**única transição de posição do produto**, e ela informa: diz de onde a folha veio e para onde
volta. Durante o arraste a transição é desligada, para o painel seguir o dedo sem atraso. Sob
`prefers-reduced-motion`, aparece sem deslocar (`data-movimento="sobe"`).

**Mobile.** A alça (36×4px) é a affordance de "isto se puxa" — e puxa de verdade. O cabeçalho e a
alça ficam presos; quem rola é o conteúdo. Em desktop a alça some, porque não há o que arrastar.

**Exemplo.**

```tsx
{rejecting && (
  <Modal title="Recusar cadastro?" onClose={() => setRejecting(null)}>
    <Textarea label="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} />
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="ghost" size="sm" onClick={() => setRejecting(null)}>Cancelar</Button>
      <Button variant="destructive" size="sm" onClick={confirmReject}>Recusar cadastro</Button>
    </div>
  </Modal>
)}
```

**Restrições.** Uma folha por vez, nunca empilhadas. Modal é para decisão curta: formulário de
mais de três campos vira tela. Se o conteúdo rola mais do que uma tela, era para ser uma tela.

---

### `<Avatar>` ✅

**Objetivo.** Identificar uma pessoa em lista e em cabeçalho de perfil, sem foto (a demo não tem
fotos reais).

**Onde.** Card de cuidador, perfil, fila de aprovação, candidaturas.

**Estrutura visual.** Círculo com até duas iniciais, `bg-accent-soft`, texto `accent`
`font-semibold`, `ring-1 ring-accent/10`. Tamanho controlado por `size` (padrão 40px); a fonte é
36% do diâmetro.

**Estados.** Estático.

**Mobile.** 40px em lista é o padrão e coincide com a altura de linha confortável. Não desça de
32px — abaixo disso duas iniciais ficam ilegíveis.

**Restrições.** **Sem cor aleatória por pessoa.** Um avatar colorido por hash competiria
diretamente com o crachá de categoria, que é a informação que importa naquela lista. É
`aria-hidden` porque o nome sempre aparece escrito ao lado — o leitor de tela não deve ouvir as
iniciais duas vezes.

---

### `<Logo>` · `<LogoMark>` ✅

Ver [seção 1](#1-marca). Regra curta: **nunca com fundo próprio, nome sempre em caixa normal.**

---

## 8. Estados de tela — carregando, vazio, erro, sucesso

Toda tela que depende de dado tem **quatro** estados, e os quatro são de responsabilidade de quem
escreve a tela: carregando, vazio, erro e o estado normal. O quinto — sucesso — aparece depois de
toda ação que muda alguma coisa.

### 8.1 Carregando ✅

**A regra de escolha**, antes do componente:

| Espera | O que mostrar | Por quê |
|---|---|---|
| < 300ms | **Nada.** | Um indicador que aparece e some em 200ms pisca, e o pisca cansa mais do que a espera que ele queria disfarçar. |
| 300ms – 1s, tela inteira | `<TelaCarregando>` | Não há forma a prometer. |
| 300ms – 1s, **estrutura conhecida** (lista de cards) | `<SkeletonLista>` | A pessoa já começa a ler o layout; quando o dado chega, nada se move. |
| Ação dentro de um botão | `<Button loading>` com o rótulo no gerúndio | O retorno fica onde o dedo está, não no topo da tela. |

#### `<TelaCarregando>` ✅

Substituiu a string `"Carregando…"` que estava **copiada em dezessete telas** — cada cópia sem
`role`, então a espera não era anunciada para leitor de tela em nenhuma delas.

```tsx
if (!state) return <TelaCarregando />;              // dentro do layout do app
if (!state) return <TelaCarregando alturaTotal />;  // entrada, cadastro, perfil
```

- `role="status" aria-live="polite"`.
- O texto só entra depois de **300ms** (`useAtrasoVisivel`), mas **o contêiner ocupa a altura
  desde o primeiro quadro** — assim nada salta quando o dado chega dentro da janela. Antes dos
  300ms o rótulo existe em `sr-only`, para o leitor de tela não ficar em silêncio.
- `min-h-[60dvh]`, ou `100dvh` com `alturaTotal`. **`dvh`, não `vh`**: `100vh` no Safari do iPhone
  é a altura sem a barra de endereço, que só existe depois de rolar, e a tela nasce alta demais
  com uma rolagem fantasma.

#### `<Skeleton>` · `<SkeletonCard>` · `<SkeletonLista>` ✅

Duas regras mandam aqui:

1. **Reproduz a forma real**, não retângulos genéricos. O `<SkeletonCard>` tem barra larga (nome),
   barra estreita (subtítulo), chip à direita (crachá) e a faixa de metadados — com larguras
   desiguais, porque barra toda do mesmo tamanho lê como tabela, não como card.
2. **Ocupa exatamente a altura do conteúdo real.** Layout que salta quando o dado chega é pior do
   que tela em branco, e no celular derruba o toque da pessoa no botão errado.

`<SkeletonLista>` mostra **três** itens por padrão, nunca a lista inteira: prometer dez e entregar
dois é pior do que não prometer. Os blocos são `aria-hidden`; quem anuncia é o `role="status"` do
contêiner.

A pulsação (`.esqueleto`) é por **opacidade**, 1,6s `ease-in-out` — **nunca brilho varrendo.** O
*shimmer* atravessando a tela chama mais atenção que o conteúdo e é justamente o efeito que
`prefers-reduced-motion` existe para desligar. Sob a preferência, fica estático.

> **Estado de adoção.** `<TelaCarregando>` está nas 17 telas. `<SkeletonLista>` está pronto e
> documentado, mas **ainda sem call site**: a demo carrega todo o estado de uma vez, então não
> existe hoje uma lista que carregue sozinha dentro de uma página já renderizada. É o componente a
> usar quando essa situação aparecer — não crie outro.

### 8.2 Vazio ✅ — `<Vazio>`

```tsx
<Vazio acao={<ButtonLink to="/empresa/atendimentos/novo" size="sm">Novo atendimento</ButtonLink>}>
  Nenhum atendimento cadastrado ainda.
</Vazio>

<Vazio porte="linha">Nada pendente no momento.</Vazio>
```

**Estrutura.** Texto **alinhado à esquerda**, na medida do conteúdo que substituiria, com a ação à
direita. Sem moldura, sem centralização, sem borda tracejada.

**A borda tracejada saiu na revisão 13.** Ela estava copiada em oito telas com quatro paddings
diferentes, e é o clichê de estado vazio: desenha um buraco no lugar do conteúdo e chama atenção
justamente para o que não existe. O vazio deste produto é **quieto** — uma anotação onde o
registro estaria.

**Três portes:** `bloco` (`px-3.5 py-6`) para uma lista inteira vazia; `linha` (`px-3.5 py-3`)
para uma seção pequena dentro de um painel; `solto` (`py-3`, **sem recuo horizontal**) para dentro
de um `<Secao>`, onde não existe borda de painel da qual afastar o texto — ali o recuo só
desalinharia a frase em relação às linhas da lista.

**Duas naturezas, e elas não são a mesma coisa** — a frase precisa dizer qual é:

| Natureza | O que aconteceu | A saída |
|---|---|---|
| Vazio de verdade | não existe registro nenhum ainda | criar o primeiro |
| Vazio de filtro | existe registro, o recorte não achou | afrouxar o filtro |

"Nenhum atendimento neste recorte. Os outros continuam na lista — é o filtro que está estreito."
Sem essa distinção, a pessoa acha que perdeu os dados.

**Regras de texto.** Diz o que falta, nunca só "vazio". Sem "Ops!", sem exclamação. Quando existe
uma saída, ela vem junto: estado vazio sem porta de saída é um beco.

**Painel vazio que repete o que a tela já disse não deve existir.** No Início, "Atendimentos de
hoje" some quando não há nenhum — a frase de abertura já disse "Nenhum atendimento hoje", e o
painel vazio custava ~110px do topo da tela mais usada do produto.

**Mobile.** Uma frase, no máximo duas linhas a 390px. Estado vazio com ilustração não existe neste
produto: come meia tela do celular para dizer o que uma frase já disse.

### 8.3 Erro ✅ — `<Aviso>`

**Estrutura.** Bloco `rounded-control` com ícone à esquerda, `px-3 py-2`, `text-note`.

| Tom | Visual | `role` |
|---|---|---|
| `erro` (padrão) | `border-status-cancelado/40 bg-status-cancelado-soft text-status-cancelado` | `alert` — interrompe |
| `sucesso` | `border-status-confirmado/40 bg-status-confirmado-soft text-status-confirmado` | `status` — espera a brecha |
| `info` | `border-linha bg-surface-sunken text-ink/70` | `status` |

**Posição — a parte que mais erra.** O bloco fica **imediatamente acima da ação que falhou**, não
no topo da página: em formulário longo no celular, uma mensagem no topo já saiu da tela quando o
dedo aperta o botão lá embaixo.

**O `role` é o que faltava.** Sem ele, quem usa leitor de tela aperta "Publicar", nada acontece e
nada é anunciado — a ação falha em silêncio.

**Erro de sistema** (falha ao salvar, dado que não veio) leva o mesmo bloco mais a prop `acao`,
com um `<Button variant="ghost" size="sm">Tentar de novo</Button>`.

```tsx
{error && <Aviso>{error}</Aviso>}
<Aviso tom="info">O check-out só é liberado depois do check-in.</Aviso>
```

**Erro por campo** vive no próprio campo (seção 7, `<Input>`), com `aria-invalid` e
`aria-describedby`. Use os dois juntos: o campo diz **onde**, o bloco diz **o quê**.

**Regras de texto.** A mensagem diz **o que fazer**, não o que a máquina achou: "Escolha ao menos
um dia da semana", nunca "Validação falhou". Sem ponto de exclamação. Sem culpar a pessoa.

### 8.4 Sucesso ✅

O produto não confirmava nada: aprovar um cuidador, publicar um atendimento, fazer check-in — a
tela mudava de estado e pronto. Em desktop a mudança é visível; **no celular, com o polegar
cobrindo metade da tela no momento do toque, a pessoa não via o que tinha mudado e tocava de
novo.**

**Duas formas, e a primeira é a preferida:**

| Forma | Quando | Como |
|---|---|---|
| **Confirmação no lugar** | A mudança é visível na própria tela: o crachá vira "Confirmado", o botão vira "Convidado ✓" | O próprio elemento é a confirmação. **Não acrescente nada** — o aviso flutuante aqui vira ruído. |
| **`<Toast>`** | A mudança **não** é visível: a ação navegou para outra tela, ou o item sumiu de uma lista sem dizer para onde foi | `avisar("Atendimento publicado.")` |

#### `<Toast>` ✅

`ToastProvider` fica em `App.tsx`, **acima do roteador**, para que o aviso sobreviva à troca de
tela — quem publica um atendimento e é levado de volta para o painel só vê a confirmação se ela
não morrer na navegação. As telas consomem por `useToast()`.

```tsx
const { avisar } = useToast();
avisar("Atendimento publicado. Já aparece para os cuidadores compatíveis.");
avisar("Não foi possível salvar. Tente de novo.", "erro");
```

| Propriedade | Celular | Desktop |
|---|---|---|
| Posição | **Acima da barra de abas** (`bottom-[calc(4.5rem+env(safe-area-inset-bottom))]`), largura da coluna menos `px-5` | Canto inferior direito, `max-w-[420px]` |

**Nunca no topo do celular:** o topo é onde fica a mão que não está tocando na tela, e um aviso lá
sai do campo de visão.

- Sucesso some em **4s**; erro **fica** até ser dispensado.
- **Um por vez** — aviso novo substitui o anterior, nunca empilha.
- Entrada: sobe 8px com `opacity` em 150ms. Sob movimento reduzido, só `opacity`.
- `role="status"`/`aria-live="polite"` para sucesso; `role="alert"`/`assertive` para erro.
- Botão de dispensar com alvo de 44px.

**Restrição dura.** O `<Toast>` **nunca** carrega a única forma de desfazer uma ação destrutiva.
"Desfazer" que expira em 4s não é uma opção de desfazer; ação destrutiva pede confirmação
**antes**, no `<Modal>`.

**Onde já está ligado:** publicar atendimento e salvar rascunho (navegam para outra tela); aprovar
e recusar cadastro de cuidador (o card some da fila, e um card que some não diz qual das duas
coisas aconteceu).

### 8.5 Resumo — o que toda tela precisa ter

| Estado | Componente | Situação |
|---|---|---|
| Carregando, tela inteira | `<TelaCarregando>` | ✅ nas 17 telas |
| Carregando, lista | `<SkeletonLista>` | ✅ pronto, sem call site ainda |
| Carregando, ação | `<Button loading>` | ✅ disponível |
| Vazio | bloco tracejado inline | ✅ |
| Erro de formulário | `<Aviso>` | ✅ |
| Erro por campo | prop `error` de `<Input>`/`<Select>`/`<Textarea>` | ✅ disponível |
| Sucesso | confirmação no lugar, ou `<Toast>` | ✅ |

---

## 9. Padrões compostos

Padrões que não são um componente único, mas uma combinação fixa que já se repete no produto e
**não pode ser reinventada a cada tela**.

### 9.0 O registro de atendimentos ✅ — `<AttendanceRow>` · `<AttendanceList>`

**Objetivo.** Mostrar muitos atendimentos de uma vez, de forma que a coordenadora **varra** em vez
de ler. É o padrão mais importante do produto: aparece em Atendimentos, Início, Escala e na agenda
do cuidador.

**Substituiu o `<AttendanceCard>` na revisão 13**, e a troca é estrutural. O card punha cada
plantão numa caixa com borda, raio de 14px e sombra: quinze plantões viravam quinze objetos
flutuando, ~150px cada, e nenhum dado ficava na mesma posição de uma caixa para a outra.

#### As cinco camadas de um registro

Um plantão confirmado é só um dado: quando, quem, quanto. Um plantão **em aberto** é um dado mais
um pedaço de operação — o que se está esperando, o que já se sabe sobre a busca, o que dá para
fazer a respeito. É por isso que a linha tem camadas, e não campos.

A revisão 17 separou as três últimas, que chegavam embaralhadas. O recado ("1 compatível no
quadro") e as ações ("Buscar cuidadores", "Candidaturas") dividiam **uma linha só**, separados por
12px de `gap`: a informação parecia um link que não clicava, e os links pareciam continuação da
frase. Na coluna de estado, no mesmo registro, "Candidaturas" aparecia mais uma vez — agora como
rótulo de status.

| # | Camada | Responde | Conteúdo | Recurso tipográfico |
|---|---|---|---|---|
| 1 | **Principal** | *o que é, em que pé está* | hora (+ data), paciente, estado | `text-note` 600 `--ink`; `.numero`; marcador de forma |
| 2 | **Contexto** | *que trabalho é, quanto vale* | tipo · duração · bairro, valor | `text-meta` `--ink-subtle`; `.numero` à direita |
| 3 | **Situação operacional** | *de quem se está esperando* | "Aguardando cuidador"; ou o cuidador que assumiu | `text-note` **500**, tinta do estado |
| 4 | **Complementar** | *o que já se sabe* | "1 cuidador compatível no quadro" | `text-meta` `--ink-subtle` — **neutra** |
| 5 | **Ação** | *o que dá para fazer daqui* | Buscar cuidadores · Candidaturas (1) | `ROW_ACTION_CLASS` — `text-accent` 600 |

**Cada camada tem a sua linha.** Empilhadas, elas param de disputar a mesma faixa horizontal e o
olho desce em degraus em vez de varrer uma sopa de textos curtos. As camadas 3, 4 e 5 só existem
quando há o que dizer: um plantão confirmado tem 1, 2 e 3; um rascunho tem 1 e 2.

**A separação que mais importava é a 3 → 5.** Situação é **estado do mundo**; ação é **coisa que se
clica**. As duas moravam na mesma faixa, com pesos parecidos, e a diferença entre elas é a
diferença entre ler e decidir.

**A camada 4 é neutra de propósito.** Ela informa a decisão que a camada 5 executa; se ganhasse
tinta de marca ou sublinhado, competiria com as ações logo abaixo e a linha voltaria a ter dois
níveis de "clicável". A única exceção é quando o próprio dado **é** o problema — "Nenhum cuidador
compatível no quadro" sai em `--status-cancelado`, porque ali buscar cuidadores não resolve:
aprovar alguém para o quadro resolve.

#### Estado, situação e contagem — três coisas, três lugares

O erro que a revisão 17 corrigiu foi de vocabulário antes de ser de layout: **três conceitos
diferentes se revezavam na mesma posição**, e por isso a coluna de estado ora dizia em que pé o
plantão estava, ora dizia o que tinha chegado nele.

| Conceito | Pergunta | Onde mora | Exemplo |
|---|---|---|---|
| **Estado** | Em que ponto do ciclo o registro está? | camada 1, coluna fixa à direita | ● Em busca |
| **Situação operacional** | De quem a operação está esperando? | camada 3, linha própria | Aguardando cuidador |
| **Contagem** | Quantos? | camada 4, ou entre parênteses no rótulo da ação | 1 cuidador compatível · Candidaturas (2) |

A regra da situação é sempre a mesma — **nomear a parte que precisa agir**:

| Estado | Situação operacional | De quem se espera |
|---|---|---|
| ● Em busca | Aguardando cuidador | ninguém se apresentou ainda |
| ● Convidado | Aguardando resposta do cuidador | de quem foi convidado |
| ● Em confirmação | Aguardando sua confirmação | da coordenadora |
| ● Confirmado em diante | *(o nome do cuidador)* | de ninguém — a espera acabou |
| ● Rascunho, Cancelado | `—` | não há espera |

Situação e nome do cuidador dividem a **mesma linha** porque são a mesma pergunta em dois tempos:
enquanto o plantão espera, ela diz *o que* se espera; depois de confirmado, diz *quem* assumiu.

O âmbar de `--status-aberto` só acende **enquanto alguém é esperado** (`ATTENDANCE_SITUATION` cobre
exatamente os três estados abertos). Num rascunho ou num cancelado ele prometia trabalho que não
existe, e a coluna inteira acendia sem motivo.

#### Duas disposições, uma hierarquia

O mesmo componente, o mesmo DOM e a mesma hierarquia servem dois trabalhos, e o que os separa é
**quantos registros a pessoa vai varrer de uma vez**:

| `layout` | Onde | O problema que resolve |
|---|---|---|
| `denso` (padrão) | Atendimentos, Escala, agenda do cuidador | trinta plantões numa tela — o que importa é caber |
| `empilhado` | Início da empresa (Hoje, Em aberto, Próximos) | três ou quatro registros — o que importa é ler de relance |

**Não são dois componentes porque não são duas hierarquias.** Paciente continua sendo o dado
principal, hora continua sendo a âncora, valor e estado continuam encostados à direita. O que muda
é só **em que célula da grade cada um cai** — `col-start` / `row-start` por breakpoint, nunca uma
segunda cópia escondida com `lg:hidden`.

#### A anatomia — `denso`

```
celular (3 col x 3 linhas)            desktop lg (5 col x 2 linhas)
+------+-----------------+-------+   +------+-----------+---------+-------+--------+
|14/03 | Marli Gonçalves | R$180 |   |14/03 | Marli G.  | Sandra  | R$180 | o Em   |
|07:00 | Plantão 12h ... | o Em  |   |07:00 | Plantão.. | Oliveira|       | andam. |
|      | Sandra Oliveira | andam.|   +------+-----------+---------+-------+--------+
+------+-----------------+-------+
```

Grade: `[3.25rem_1fr_auto]` no celular, `[3.5rem_1.7fr_1fr_5.5rem_8.5rem]` em `lg`. Preenchimento
`px-3.5 py-2.5`.

As duas colunas de texto são **fracionárias** (1,7fr e 1fr), não uma elástica e outra fixa: com
`10rem` fixos, toda a folga de um monitor de 1440px se acumulava num vão entre o nome do paciente
e o nome do cuidador, e os dois pareciam de linhas diferentes.

#### A anatomia — `empilhado` (mobile-first)

O celular é o ponto de partida, e a leitura **desce** em vez de atravessar. Cada linha responde
uma pergunta:

```
celular (2 col x 6 linhas)               desktop sm (3 col x 5 linhas)
+---------------------+-----------+     +------+----------------------+-----------+
| 26/08 15:00         | o Em busca|     |26/08 | Marli Souza          | o Em busca|
| Marli Souza         |     R$ 120|     |15:00 | Avulsa · 1h · Centro |           |
| Avulsa · 1h · Centro            |     |      | Aguardando cuidador  |     R$ 120|
| Aguardando cuidador             |     |      | 1 cuidador compatível no quadro  |
| 1 cuidador compatível no quadro |     |      | Buscar cuidadores · Candidaturas |
| Buscar cuidadores · Candidat... |     +------+----------------------+-----------+
+---------------------------------+
```

| Linha (celular) | Camada | Responde | Conteúdo |
|---|---|---|---|
| 1 | 1 | *quando · como está* | hora (+ data) à esquerda, estado à direita |
| 2 | 1 · 2 | *quem · quanto* | paciente à esquerda, valor à direita |
| 3 | 2 | *que trabalho é* | tipo · duração · bairro |
| 4 | 3 | *de quem se espera* | situação operacional, ou o cuidador |
| 5 | 4 | *o que já se sabe* | recado neutro — só quando existe |
| 6 | 5 | *o que dá para fazer* | ações — só quando existem |

As linhas 5 e 6 são o que o Início ganhou na revisão 17. Um plantão de hoje, já confirmado, para na
linha 4 e continua com quatro linhas — **não se força os dois tipos de registro à mesma altura**.
Numa lista, a exceção deve se destacar da regra, não ser nivelada com ela.

**A data, quando existe, fica ao lado da hora no celular** (`27/08  07:00`) e volta a empilhar
sobre ela no desktop. A primeira linha do registro é larga e sobra espaço: empilhar ali gastaria
uma linha inteira para dois dados curtos, e o estado passaria a flutuar ao lado de um bloco de
duas alturas. Na calha de 3.5rem do desktop o empilhamento volta a ser o único arranjo que cabe.

**Por que a hora sobe para a primeira linha no celular.** No `denso` ela tem uma calha própria à
esquerda, porque numa escala **quando** é a primeira pergunta. Em 390px não há largura para calha
e coluna de texto ao mesmo tempo: a hora sobe, e leva o estado a reboque. A primeira linha do
registro passa a responder *quando* e *como está*, que é exatamente a leitura de um turno.

**No desktop a calha volta.** A hora ocupa a coluna 1 inteira (`row-span-3`) e a leitura recupera
a varredura vertical de horários. A estrutura continua sendo uma **lista flexível**, não uma
tabela rígida: a coluna do meio é `minmax(0,1fr)` e a da direita é `auto`.

A régua é `sm` (640px), não `lg`: a partir daí já existe largura para as três colunas, inclusive
dentro da coluna de conteúdo de 588px que o Início tem em `lg`.

#### As nove informações do briefing, e onde cada uma cai

| # | Informação | Camada | `denso` | `empilhado` | Peso |
|---|---|---|---|---|---|
| 1 | Paciente | 1 | col. 2, linha 1 | linha 2 esq. / col. 2 linha 1 | `text-note` 600, `--ink` — **principal** |
| 2 | Quando (data + hora) | 1 | col. 1, calha | linha 1 esq. / col. 1 calha | `.numero` 600 — **operacional** |
| 3 | Status | 1 | col. 5, à direita | linha 1 dir. / col. 3 linha 1 | `<StatusAtendimento>` |
| 4 | Tipo e duração | 2 | col. 2, linha 2 | linha 3 / col. 2 linha 2 | `text-meta`, `--ink-subtle` — **contextual** |
| 5 | Onde (bairro) | 2 | col. 2, linha 2 | idem | idem |
| 6 | Valor | 2 | col. 4, à direita | linha 2 dir. / col. 3 linha 3 | `.numero`, `--ink-muted` |
| 7 | Situação / Cuidador | 3 | col. 3 (desktop), linha 3 (celular) | linha 4 / col. 2 linha 3 | `text-note`, 500 na situação · `--ink-muted` no nome |
| 8 | Recado | 4 | linha própria, quando existe | idem | `text-meta`, `--ink-subtle` |
| 9 | Próxima ação | 5 | linha própria, quando existe | idem | `ROW_ACTION_CLASS` |

**Cinco pesos, e nenhum é só cor** — tamanho, peso, posição e agrupamento fazem a hierarquia.

**A camada 3 é coluna no `denso`, linha no `empilhado`.** Não é inconsistência: com trinta
registros, uma linha a mais em cada plantão aberto custaria uma tela inteira de rolagem, e no
desktop denso há uma coluna sobrando para ela — a do cuidador, que é a mesma pergunta. Abaixo de
`lg`, onde não há largura, ela desce para a terceira linha do bloco de texto.

**O valor não compete com o nome.** No `empilhado` ele fica na mesma linha do paciente, então cai
para `--ink-muted` e peso 500 contra o `--ink` peso 600 do nome. Continua tabular e alinhado à
direita: destaque moderado, não segunda manchete.

#### Nenhum ícone

A versão anterior abria cada dado com um ícone de 12px, na sequência
`📅 data ◷ hora 📍 local 👤 cuidador`. Nenhum acelerava reconhecimento: data já se reconhece por
ser data, e quatro ícones cinzas na mesma linha viram textura. O que separa os dados agora é
**posição de coluna**.

Ícone só entra onde carrega significado que o texto não dá — o cadeado do endereço trancado
("isto abre quando você aceitar") — ou onde representa uma ação.

#### A moldura — `<AttendanceList variant>`

| Variante | Forma | Quando |
|---|---|---|
| `moldura` (padrão) | `border border-linha rounded-card bg-surface-raised` + `divide-y` | a lista **é** o conteúdo da tela |
| `fluxo` | só `divide-y`, mais `-mx-2` | a lista mora sob um `<Secao>`, sem caixa em volta |

`moldura` é **uma** borda para o conjunto e um fio de 1px entre as linhas, em vez de borda e
sombra em cada item. É a diferença entre uma planilha e uma pilha de post-its.

`fluxo` tira até essa borda. No Início, onde vários recortes curtos se seguem, cada moldura extra
é uma parede a mais entre a coordenadora e a operação do dia. O `-mx-2` compensa exatamente o
`px-2` da linha empilhada: o texto volta a nascer na margem da página, e o fundo de hover/toque
sobra 8px para cada lado em vez de encostar nas letras. Os fios ficam 8px mais largos que o texto,
que é o que uma lista impressa sempre fez.

`moldura` usa `overflow-clip`, **não** `overflow-hidden`: `hidden` cria um contêiner de rolagem e
o cabeçalho de grupo `sticky` pararia de grudar no topo da janela.

#### Separadores

Um fio `divide-linha` de 1px entre registros, e nada mais. Ele existe para três coisas: organizar
a varredura, marcar onde termina uma área clicável e começa a próxima, e substituir a borda que
cada card tinha. Nunca uma caixa por item, nunca borda em todos os lados, nunca sombra.

#### Ritmo vertical

O espaço entre as camadas **é** a hierarquia: sem degraus, as seis linhas de um plantão em aberto
leem como seis frases da mesma altura. A escada tem um degrau grande e o resto pequeno.

```
Linha principal            hora · paciente · estado
  ↓ 4px                    (mt-1)
Informações do atendimento tipo · duração · bairro · valor
  ↓ 8px                    (mt-2)  ← o único respiro grande
Situação operacional       Aguardando cuidador
  ↓ 6px                    (mt-1.5)
Informação complementar    1 cuidador compatível no quadro
  ↓ 4px                    (mt-1)
Ações                      Buscar cuidadores · Candidaturas (1)
  ↓ 12px                   (py-3 da linha)
Separador                  ────────────────────────────
```

**O `mt-2` é a articulação do registro.** Ele separa o **bloco de dados** (camadas 1 e 2) do
**bloco de operação** (3, 4 e 5). Sem esse degrau, "Aguardando cuidador" lia como uma quarta linha
de contexto do plantão em vez de como a situação dele.

O ritmo vem de `mt-*` em cada célula, **não** do `gap-y` da grade (que é `0` no `empilhado` e
`0.5` no `denso`). É deliberado: as camadas 3, 4 e 5 aparecem e somem conforme o plantão, e um vão
uniforme deixaria buraco onde a camada não existe. Com `mt-*`, a linha que não tem recado
simplesmente não abre espaço para ele — **nenhuma lacuna artificial**.

#### Densidade, altura e alvo de toque

| | Altura | Antes (card) |
|---|---|---|
| `denso`, desktop, linha simples | ~56px | ~150px |
| `denso`, celular, linha simples | ~74px | ~150px |
| `empilhado`, desktop, sem operação | ~66px | — |
| `empilhado`, celular, sem operação | ~117px (4 linhas) | — |
| `empilhado`, celular, em aberto | ~190px (6 linhas) | — |
| `denso`, linha com ação | +30px | — |

O `empilhado` tem `min-h-20` (80px) como **piso** de alvo de toque, para o registro mais curto
(sem data, sem cuidador) não encolher abaixo do confortável, e `pointer-fine:min-h-0` para devolvê-lo
à altura do conteúdo onde existe mouse. A régua é o **método de entrada**, não a largura da tela:
um tablet em paisagem tem largura de desktop e dedo de celular.

**Só a linha que pede trabalho fica mais alta.** A ação rápida aparece apenas onde existe ação —
o plantão que ainda espera cuidador. Numa lista, a exceção deve se destacar da regra, não ser
nivelada com ela.

#### Grupos

`<AttendanceGroupHeader>` é o cabeçalho de dia da escala: faixa `bg-surface-sunken`, rótulo
`text-dado uppercase`, contagem à direita, e `sticky top-0`. Em escala longa, saber de que dia é a
linha que se está lendo não pode depender de rolar de volta. Os grupos entram como `<Fragment>`
dentro da mesma `<ul>` — um nível a mais de lista tiraria as linhas de baixo do `divide-y`.

#### A área clicável

**A linha inteira é o botão.** Hora, estado, paciente, valor, contexto e cuidador — todos abrem a
ficha do atendimento. Nunca um botão "Ver atendimento" separado: se o registro inteiro já faz
aquilo, o botão é uma segunda porta para a mesma sala, ocupando espaço e uma parada a mais de
tabulação.

A técnica é o **link esticado**: o nome do paciente é o `<a>` real e ganha
`after:absolute after:inset-0` sobre a `<li>` `relative`. Isso dá três coisas de uma vez — a área
de clique cobre a linha, existe **um** nó focalizável por registro (não seis), e o leitor de tela
anuncia o nome do paciente como destino, que é o rótulo certo.

Links de dentro (o nome do cuidador, as ações rápidas) sobem com `relative z-10` para ficar por
cima do pseudo-elemento e continuar clicáveis.

**As ações da camada 5 são links de texto separados por ponto médio**, nunca botões nem pílulas:

```
Buscar cuidadores · Candidaturas (1)
```

O ponto médio é o que faz duas ações lerem como **uma barra de ações**, e não como duas frases
soltas que por acaso caíram perto. Ele é `aria-hidden` e `select-none`, e o componente que monta a
lista (`<AttendanceOpenActions>`) só o emite **entre** itens — com um `&&` no meio do JSX, o
plantão já convidado abria a linha com um ponto médio órfão.

Botão de verdade só entra quando **uma** ação é prioritária a ponto de merecer peso de decisão de
tela — e numa lista isso quase nunca é verdade: quinze plantões × dois botões são trinta molduras
dentro de uma lista que a moldura externa já delimita.

**Espaçamento entre alvos:** `gap-x-3` no toque (12px de cada lado do ponto médio, ~28px entre os
dois alvos de 44px), `pointer-fine:gap-x-2.5` no ponteiro. Dois links colados, mesmo com 44px cada,
produzem toque errado na borda (seção 11).

#### Estados

| Estado | Comportamento |
|---|---|
| normal | nenhum. Sem borda, sem sombra, sem elevação, sem fundo próprio. |
| `hover` | `bg-surface-sunken/60` na linha inteira, `transition-colors duration-150 ease-out`, `cursor-pointer` do link. |
| `active` (toque) | `bg-surface-sunken` — um degrau mais forte que o hover. No toque o dedo cobre o ponto tocado; sem mudança imediata de fundo a pessoa não sabe se pegou. |
| foco de teclado | anel `:focus-visible` global no nome do paciente **mais** `has-[a:focus-visible]:bg-surface-sunken/60` na `<li>`. Sem o segundo, o anel aparece só em volta do nome e não fica claro que a **linha** é o destino. |
| sem cuidador | situação da camada 3 em `text-status-aberto`, peso 500, **só** enquanto o plantão espera alguém; em rascunho ou cancelado, `—`. |
| carregando | `<SkeletonLista>` — a mesma grade, as mesmas colunas. |

**Os estados da ação (camada 5)**, que são os de `ROW_ACTION_CLASS`:

| Estado | Comportamento |
|---|---|
| normal | `text-accent`, peso 600, `decoration-transparent` — a cor e o peso já dizem "clicável" sem hover nenhum, que é o que uma pessoa no celular tem. |
| `hover` | o sublinhado aparece (`decoration-accent/50`). |
| `active` (pressed) | `text-accent-strong` + `decoration-accent-strong/60`. |
| foco de teclado | anel `:focus-visible` global. |

O `active:` **não é opcional aqui**. A linha inteira já escurece no toque, e `:active` sobe para os
ancestrais: sem uma resposta do próprio link, tocar "Buscar cuidadores" acendia a linha toda e
parecia que o dedo tinha aberto a ficha do plantão em vez da busca. A tinta mais escura do accent é
o que diz qual dos dois alvos pegou.

**O que nunca entra no hover:** sombra, elevação, `translateY`, borda aparecendo, mudança de raio.
Qualquer um deles devolve ao registro a aparência de card flutuante que o padrão existe para
eliminar. Só a tinta do fundo muda.

#### Acessibilidade

- `<ul>` / `<li>` de verdade: o leitor de tela anuncia "lista, 3 itens" e permite pular de item em
  item. Uma pilha de `<div>` clicáveis não dá nenhuma das duas coisas.
- **Um** nó focalizável por registro, na ordem visual. Os links internos vêm depois dele.
- O estado nunca é só cor: `<StatusAtendimento>` carrega **forma + cor + palavra**, e a forma é a
  primária. A palavra é uma só, visível e anunciada — o `sr-only` com uma segunda redação saiu na
  revisão 17 junto com o mapa curto: dois textos para o mesmo estado é uma divergência esperando
  acontecer, e o `sr-only` é onde ela demoraria mais a ser notada.
- "Aguardando cuidador" é **texto**, não um âmbar sozinho. A cor reforça; a palavra informa. O que
  a distingue da camada acima é peso (500 contra 400) além da tinta — regra 3.
- A hierarquia entre as camadas 4 e 5 não depende de cor: a complementar é `<p>` de texto corrido, a
  ação é `<a>`. Quem navega por teclado ou leitor de tela pula direto para os links; quem lê a tela
  vê texto neutro seguido de texto de marca.
- **A ordem do DOM é a ordem das camadas** (1 → 5), e não a da grade: `quando · paciente · estado ·
  contexto · valor · situação · recado · ações`. Quem ouve a tela recebe *quando, quem, em que pé
  está* antes de qualquer detalhe — que é a leitura de um turno. A grade reposiciona as células com
  `col-start`/`row-start` sem tocar nessa sequência, então o estado pode aparecer à direita da
  primeira linha sem ser anunciado por último.
- O contexto (`Plantão · 12h · Centro`) é um `<p>` único com separadores textuais, não três spans
  com bullets decorativos.
- Alvo de toque de 80px no `empilhado`, bem acima dos 44px mínimos, porque um registro errado
  aberto no celular custa uma navegação de volta.

#### Comportamento responsivo — resumo

| | `denso` | `empilhado` |
|---|---|---|
| < 640px | 3 col × 3 linhas (+2 quando há recado/ação), calha de data/hora | 2 col × 4 linhas (+2 quando há recado/ação), hora no topo |
| 640–1023px | idem | 3 col × 3 linhas (+2), calha de hora |
| ≥ 1024px | 5 col × 2 linhas (+2): a camada 3 vira coluna | idem `sm` |
| toque | `py-2.5`, ações com `min-h-11` e `gap-x-3` | `min-h-20`, `py-3`, idem ações |
| mouse | idem, ações `pointer-fine:min-h-7` | `pointer-fine:min-h-0`, `py-2.5` |

Uma quantidade só de registros não muda nada: com um atendimento ou com nove, a seção é a mesma
lista. Não existe tratamento especial para "só um" — criar um card para preencher espaço é
justamente o que o padrão substituiu.

---

### 9.1 Linha do tempo de atividade operacional ✅ — `<LinhaDoTempo>`

**Objetivo.** Mostrar o que aconteceu na operação, em ordem, de forma que a coordenadora **varra**
a coluna de cima para baixo em vez de ler evento por evento. É requisito de rastreabilidade (R12)
e é a última leitura do Início: hoje → em aberto → à frente → o que acabou de acontecer.

**Onde.** "Atividade recente" no Início da empresa e "Histórico" na ficha do atendimento. (O
"Registro de atividade" de Configurações ainda usa a forma antiga descrita no fim desta seção — é
o último lugar que sobrou com ela.)

**A revisão 16 tirou a moldura e empilhou o carimbo.** Eram duas coisas erradas ao mesmo tempo:

- a seção inteira morava num `<Painel>` com borda e faixa de cabeçalho, e um card de seis eventos
  no fim de uma coluna de listas soltas lê como *widget de notificações de dashboard*, não como o
  histórico da operação;
- o carimbo ficava encostado à direita, na mesma linha do evento. Ele comprimia a frase no que
  sobrasse de largura, abria um vão no meio de toda entrada curta e — pior — trocava de altura de
  item para item: quando o evento tinha contexto a data ficava acima dele, quando não tinha ficava
  sozinha.

Hoje a linha do tempo é **conteúdo do documento**: vive sob um `<Secao>` (seção 7), sem moldura, e
toda entrada tem exatamente a mesma silhueta — evento, contexto, carimbo, um embaixo do outro.

```
●  Atendimento de Marli Souza cancelado
│  Paciente foi internada
│  23/08 às 22:44
│
●  Check-in registrado em Antônio Ferreira
│  Jardim das Flores (simulado)
│  23/08 às 06:58
│
●  Atendimento de Iracema Bezerra criado
   22/08 às 16:05
```

#### A entrada — três degraus, sempre nesta ordem

| Campo | Papel | Forma |
|---|---|---|
| `evento` | o que aconteceu | `text-note` peso 500, `--ink`. Verbo no particípio, **sem ponto final**. |
| `contexto` | a informação complementar | `text-meta`, `--ink-muted`, linha própria, `.prosa`. Motivo, local, responsável. |
| `quando` | o carimbo | `.numero text-meta`, `--ink-subtle`, sempre a última linha. |
| `tom` | a natureza do evento | pinta **só o marcador** — ver a tabela abaixo. |

**Evento e motivo nunca se juntam numa frase.** `Atendimento de Marli Souza cancelado: Paciente
foi internada.` obriga a ler a sentença inteira para saber o que aconteceu; separados, o evento é
escaneável e o motivo fica um degrau abaixo, para quem quiser.

**O carimbo tem uma forma só no produto inteiro:** `23/08 às 22:44`, de `utils/date.ts` →
`carimbo()`. Nunca à direita em uns eventos e embaixo em outros; nunca "ontem, 18:22" ao lado de
"14/03 07:04". O "às" existe porque, como última linha de um evento, `14/03 07:04` vira uma
sequência de quatro números que o olho lê como um bloco só.

#### Marcadores

Ponto de 8px, `rounded-full`. Pequeno e discreto: é o índice da linha, não o elemento principal
dela — e **nenhum evento vira crachá, pílula ou ícone**.

| `tom` | Marcador | Quando |
|---|---|---|
| `neutro` | `bg-linha-strong` | Rotina sem nada a sinalizar — "atendimento criado", o evento mais comum da lista. |
| `feito` (padrão) | `bg-accent` | A operação andou: check-in, check-out, confirmação, conclusão. |
| `agora` | `bg-status-andamento` + `ring-[3px] ring-status-andamento/20` | O estado corrente. No máximo um por lista. |
| `previsto` | `border-[1.5px] border-linha-strong bg-surface-raised` | Ainda não aconteceu (a régua do ciclo). |
| `caiu` | `bg-status-cancelado` | Cancelamento e recusa. |

**A cor semântica fica no marcador e só nele.** O texto do evento continua em `--ink` mesmo num
cancelamento: título inteiro pintado é o começo de uma linha do tempo colorida, e a palavra
"cancelado" já carrega o significado sem tinta nenhuma (regra 3). Nada de fundo colorido por
evento, nada de faixa de alerta dentro do histórico — a aparência é sóbria e operacional.

**Três tons por lista, no máximo.** Em "Atividade recente" são `neutro` (criado), `feito`
(check-in, concluído) e `caiu` (cancelado). Se cada tipo de evento ganhasse a sua cor, a coluna
viraria uma escala cromática que ninguém lê de cor — e a única coisa que precisa saltar ali é o
que deu errado.

#### O fio

Um traço de 1px em `--linha` **atrás** dos marcadores — nunca uma borda embaixo de cada item. Fio
contínuo é o que faz uma sequência parecer uma sequência; borda por item faz seis eventos
parecerem seis registros sem relação entre si. Ele nasce no centro do primeiro marcador e morre no
centro do último: nada de fio saindo pelo topo ou pingando abaixo do último evento.

A geometria é fixa e está declarada no componente, porque é o que mantém o fio centrado quando o
espaçamento mudar:

| Medida | Valor | De onde vem |
|---|---|---|
| Centro do marcador | 15px do topo da entrada | `py-1` (4px) + `mt-[7px]` + metade do ponto (4px) |
| Eixo do fio | `left-[11.5px]` | `px-2` (8px) + metade do ponto (4px) − meio pixel de fio |
| Travessia do respiro | `-bottom-3` | atravessa os 12px de `pb-3` que separam dois eventos |

Os 15px servem aos dois tamanhos de `text-note` (15px no celular, 14px no desktop): o centro da
primeira linha de texto cai em 15,25px e em 14,5px, e meio pixel não se vê.

#### Espaçamento

| Entre | Valor |
|---|---|
| Evento → contexto | `mt-0.5` (2px) |
| Contexto → carimbo | `mt-0.5` (2px) |
| Evento → próximo evento | `pb-3` (12px) no `<li>`; o último não tem |
| Marcador → texto | `gap-3` (12px) |

Compacto e confortável: sem card por evento, sem separador horizontal entre eventos, sem respiro
grande sobrando. **O fio já é a estrutura de separação** — qualquer divisor além dele é ruído.

#### Estados clicáveis

Quando o evento tem uma entidade atrás (o atendimento que foi criado, o plantão em que o check-in
caiu), a prop `para` transforma **a entrada inteira** em link: marcador, evento, contexto e
carimbo. Só o nome do paciente clicável seria um alvo de ~90px dentro de uma entrada de 300px — no
celular, um convite a errar o toque. Evento sem destino continua sendo só registro: nenhum cursor,
nenhum hover, nenhuma borda.

| Estado | Visual |
|---|---|
| Repouso | Nada. Sem fundo, sem borda, sem sombra. |
| Hover | `hover:bg-surface-sunken/60` em `rounded-control`, com `transition-colors duration-150 ease-out`. |
| Pressionado / toque | `active:bg-surface-sunken` — o dedo cobre o ponto tocado, e sem mudança imediata de fundo a pessoa não sabe se o toque pegou. |
| Foco de teclado | O anel global de `:focus-visible` (2px `--accent`, offset 2px), que acompanha o `rounded-control` da entrada. |
| Não clicável | Idêntico ao repouso, num `<div>`. Mesmo recuo, para as duas naturezas alinharem na mesma lista. |

**Nunca:** sombra, elevação, `translate`, borda no hover, ou qualquer coisa que transforme a
entrada num card ao passar o mouse. O retorno é uma mudança de fundo e nada mais.

**Alvo de toque.** A entrada mais curta possível — evento de uma linha mais o carimbo — mede ~49px
no celular (4 + 22,5 + 2 + 18,2 + 4), acima do piso de 44px da seção 11 sem precisar de `min-h`.
Se algum dia existir entrada sem carimbo, ela passa a precisar de `min-h-11 pointer-fine:min-h-0`.

**A sangria.** A entrada usa `-mx-2 px-2`: o marcador nasce na margem do texto da página e o fundo
de hover sobra 8px de cada lado em vez de encostar nas letras. É o mesmo recuo do
`<AttendanceList variant="fluxo">`, e é o que faz as seções do Início alinharem entre si. Dentro
de um `<Painel>`, quem dá o recuo é a moldura — ali a linha do tempo devolve a sangria com
`className="mx-2"`.

#### Estados da seção

| Estado | Visual |
|---|---|
| Com eventos | A linha do tempo acima, sob um `<Secao title="Atividade recente">`. |
| Vazia | `<Vazio porte="solto">Sem movimentação registrada.</Vazio>` — sem moldura tracejada. |
| Entrada com ressalva | Sufixo em texto no contexto: `· acrescentada após o check-out`. Nunca só uma cor. |

#### Mobile e desktop

**A disposição é uma só, e é a do celular.** Largura total, marcador à esquerda, três linhas
empilhadas à direita dele. No desktop **nada muda de estrutura**: a coluna fica mais larga, o
contexto quebra menos e o `.prosa` segura a linha em 62ch para o texto não atravessar um monitor
inteiro. A linha do tempo **não vira tabela, card, grade de colunas nem painel de eventos** — em
nenhuma largura.

Data à direita é proibida em qualquer tamanho de tela: foi exatamente o que a revisão 16 desfez.

#### Acessibilidade

- `<ol>` de `<li>`: é uma sequência ordenada, e o leitor de tela anuncia "lista, 6 itens".
- Marcador e fio são `aria-hidden` — cor e traço não carregam informação que o texto já não diga.
- Na entrada clicável, o nome acessível do link é o texto inteiro da entrada ("Atendimento de
  Marli Souza cancelado, Paciente foi internada, 23/08 às 22:44"), nunca "ver mais".
- Contraste: `--ink` no evento, `--ink-muted` no contexto e `--ink-subtle` no carimbo passam de
  4,5:1 em todas as superfícies claras (seção 2). O marcador não responde por contraste de texto
  porque não carrega informação sozinho.
- Ordem: mais recente primeiro em "Atividade recente" — histórico que começa no evento mais antigo
  obriga a rolar até o fim para ver o que acabou de acontecer; cronológica crescente na ficha do
  atendimento, onde o que se lê é o ciclo do plantão.
- **A ordenação usa o ISO de origem**, nunca o carimbo já formatado — "02/01" vem depois de
  "28/12" no calendário e antes dele em ordem alfabética.

```tsx
<Secao title="Atividade recente">
  <LinhaDoTempo
    eventos={[
      {
        id: "at3-cancel",
        evento: "Atendimento de Marli Souza cancelado",
        contexto: "Paciente foi internada",
        quando: carimbo(cancellation.at), // "23/08 às 22:44"
        tom: "caiu",
        para: "/empresa/atendimentos/at3",
      },
    ]}
  />
</Secao>
```

**A forma antiga**, ainda em uso no "Registro de atividade" de Configurações, onde as entradas são
de auditoria (ação · autor · detalhe) e não eventos de uma operação:

```tsx
<ul>
  {log.map((entry) => (
    <li key={entry.id} className="border-b border-linha py-2.5 text-note last:border-0">
      <span className="font-semibold">{entry.action}</span> — {entry.detail}
      <div className="mt-0.5 numero text-meta text-ink-subtle">
        {entry.actor} · {new Date(entry.createdAt).toLocaleString("pt-BR")}
      </div>
    </li>
  ))}
</ul>
```

| Parte | Estilo | Regra |
|---|---|---|
| Ação | `font-semibold` | Verbo no passado, curto: "Aprovou", "Bloqueou", "Cancelou". |
| Detalhe | `text-note` normal, após `—` | Sobre quem ou o quê. |
| Carimbo | `numero text-meta text-ink-subtle`, linha própria | **Sempre `.numero`**: é registro, e registro não usa o corpo do texto (seção 4). |

**Restrições.**

- **Evento de histórico nunca ganha caixa própria**, e a linha do tempo inteira também não: nada
  de `<Painel>` em volta de "Atividade recente" no Início.
- **Sem ícone por tipo de evento** — vinte ícones diferentes numa coluna estreita viram textura, e
  o verbo já diz o que aconteceu.
- **Sem badge, pílula ou crachá dentro da entrada.** O único elemento gráfico é o ponto de 8px.
- **Sem separador horizontal** entre eventos. O fio faz esse trabalho.
- Se a linha do tempo passar de ~20 entradas visíveis, ela ganha "Ver mais" em
  `Button variant="ghost"` — nunca rolagem interna própria, que em celular briga com a rolagem da
  página.

### 9.2 Faixa de números ✅

Este padrão virou componente: **`<StatStrip>`** (`src/components/shared/StatStrip.tsx`). Não
escreva a faixa de números à mão.

**Objetivo.** Os indicadores do painel, lidos de relance.

**Estrutura — duas formas, um conteúdo.** A partir de `sm`, faixa emendada: grade com `gap-px`
sobre `bg-linha`, os divisores são o próprio fundo aparecendo entre as células. Rótulo
`text-dado text-ink-subtle uppercase`; valor `numero text-title text-accent`.

**Mobile.** Abaixo de `sm` a faixa vira uma **fila que rola na horizontal**, com `snap-x`. Não é
"duas ou três colunas": cinco indicadores em grade quebravam em três linhas e empurravam o
conteúdo que pede ação para baixo da dobra. Em fila, a mesma informação cabe numa única linha
curta e nada é escondido — é a mesma lógica do `<FilterRow>` (seção 9.3).

### 9.3 Filtros e seleção ✅

Este padrão virou componente: **`<Chip>`** (seção 7). Não escreva a fila de filtros à mão — era
assim que existiam oito cópias divergentes.

```tsx
<div className="flex flex-wrap gap-1.5">
  {FILTERS.map((f) => (
    <Chip key={f.key} selecionado={filter === f.key} onClick={() => setFilter(f.key)}>
      {f.label}
    </Chip>
  ))}
</div>
```

O contêiner é sempre `flex flex-wrap gap-1.5`: uma fila que não cabe a 390px **quebra em duas
linhas**, nunca vira faixa de rolagem horizontal. Rolagem horizontal esconde opções sem nenhuma
affordance e é a origem mais comum de "não achei o filtro" em teste com usuário.

**Semântica.** Grupo de chips vai em `fieldset`/`legend`. O `aria-pressed` já vem de dentro do
`<Chip>`.

---

## 10. Padrões de tela — layout e navegação

### Estrutura

```
Desktop                                  Celular
┌──────────┬──────────────────────┐      ┌─────────────────────┐
│ ▣ marca  │  Título da página    │      │ ▣ marca · nome  [⏻] │ ← cabeçalho fixo
│ entidade │  subtítulo           │      ├─────────────────────┤
│          │  ┌────────────────┐  │      │  Título da página   │
│  nav     │  │ faixa de números│ │      │  ...                │
│  ...     │  └────────────────┘  │      │                     │
│          │  SEÇÃO               │      ├─────────────────────┤
│          │  ┌────────────────┐  │      │ ▔                   │ ← traço da aba ativa
│  [Sair]  │  │ card            │ │      │ 🏠  📅  👥  🔔  👤 │
└──────────┴──────────────────────┘      └─────────────────────┘
```

Barra lateral `w-60`, `bg-surface-nav`, presa com `sticky top-0 h-screen` **dentro** de um
invólucro que estica — o cinza acompanha a altura da página, sem degrau no meio da coluna em
página longa. Conteúdo em `mx-auto max-w-2xl px-6 py-7`.

**O cromo é mais escuro que o conteúdo, não mais claro.** Barra lateral, cabeçalho do celular e
barra inferior usam `--surface-nav` (`#EDF2F3`); o conteúdo fica em `--surface` e os cards em
branco. A navegação recua, o conteúdo avança.

O cabeçalho do celular e a barra inferior são translúcidos (`/90`, `/95`) com `backdrop-blur-md`:
o conteúdo que passa por baixo continua sugerido, o que diz que a página rola sob eles.

### Navegação

Classes compartilhadas pelos dois layouts em
[`src/components/layout/nav.ts`](../src/components/layout/nav.ts).

- **Item ativo da barra lateral:** `bg-accent-soft text-accent font-semibold`. Não é bloco de tinta
  escura: numa barra que fica o dia inteiro na tela, o retângulo cheio puxa mais atenção do que o
  conteúdo que ele deveria ajudar a encontrar. O `hover` do item inativo é `bg-surface-raised` —
  branco sobre o cinza da barra, porque um cinza sobre cinza não apareceria.
- **Aba ativa do celular:** tinta da marca + traço de 2px no topo da aba + `strokeWidth` do ícone
  de 1.75 para 2.2. Três sinais além da cor.
- **Contador de não lidos:** pastilha `bg-accent` na lateral; ponto `bg-status-cancelado` com anel
  da superfície no ícone da barra inferior.

**A barra de abas tem no máximo cinco itens.** Não é preferência: com seis, cada aba fica com
65px a 390px e o rótulo quebra. O que não cabe sai da barra e ganha entrada em outro lugar —
Relatórios entra por um link no painel, Configurações pelo ícone no cabeçalho. Cada item de
navegação declara `mobile: true | false`, e essa decisão fica no array de navegação do layout,
onde se lê de uma vez.

### Cabeçalho de página

```tsx
<h1 className="text-display">Início</h1>
<p className="prosa mt-1 text-body text-ink-subtle">{subtítulo}</p>
```

Quando a tela tem ação primária, ela fica **à direita do título em desktop** e **abaixo do
subtítulo, `block`, em celular** — nunca no cabeçalho fixo, que é território de navegação.

### Títulos internos — dois papéis, não misture

| Papel | Estilo | Onde |
|---|---|---|
| **Divisor de lista** (`h2`) | `text-heading text-ink`, com contador em pastilha `bg-surface-sunken` | Painéis e listas: separa grupos de cards. É estrutura, não conteúdo — caixa normal, não mais caixa alta tracked (seção 4). |
| **Título de bloco** (`h3`) | `text-body font-semibold text-ink` | Telas de detalhe e formulário: nomeia um bloco de conteúdo. |

---

## 11. Mobile first — regras transversais

O produto é decidido no celular. A coordenadora remaneja plantão em pé, no corredor, com uma mão;
o cuidador faz check-in na porta da casa do paciente, muitas vezes sob sol. **Toda decisão visual
começa em 390px e só depois ganha o que sobra em tela grande.**

Mobile first não é mobile só. A coordenação também trabalha sentada, num monitor, e a apresentação
comercial acontece numa tela grande do outro lado de uma sala — o `PRODUCT.md` (princípio 5) trata
os dois contextos como simultâneos. O que o desktop ganha está em [Largura de página](#largura-de-página);
o que ele **não** ganha é alvo de toque menor por ser largo (ver [Alvo de toque](#alvo-de-toque--44px)).

### Breakpoints — dois, e só

| Prefixo | A partir de | O que muda |
|---|---|---|
| *(sem prefixo)* | 0 | **O padrão.** É a versão celular. Escreva esta primeiro, sempre. |
| `sm:` | 640px | Grade de campo curto passa de 2 para 3 colunas. Nada além disso. |
| `md:` | 768px | A troca de cromo: barra lateral aparece, cabeçalho e barra de abas do celular somem. |
| `lg:` | 1024px | A troca de layout: as telas de trabalho ganham a segunda coluna. |
| `xl:` | 1280px | Densidade: lista de registro passa a duas colunas. |

### Largura de página

Não existe uma largura para tudo. Existe uma por trabalho, e as três moram em
[`src/components/layout/page.ts`](../src/components/layout/page.ts). **Nenhuma tela escreve
`max-w-*` própria.**

| Constante | Celular | `lg` | `xl` | Para quê |
|---|---|---|---|---|
| `PAGE_FORM` | 672px | 672px | 672px | Entrada, cadastro, configurações, perfil. Não estica: linha longa atrapalha formulário. |
| `PAGE_LIST` | 672px | 896px | 1152px | Lista de registro. Com `LIST_GRID`, vira duas colunas em `xl`. |
| `PAGE_WORK` | 672px | 1152px | 1152px | Painel e detalhe longo — as telas que ganham coluna de apoio. |

**A segunda coluna é conteúdo, não sobra.** Onde ela existe, ela responde a uma pergunta que a
coluna principal não responde:

| Tela | Coluna larga | Coluna de apoio |
|---|---|---|
| Início (empresa) | a fila de plantões | **Pendências**, fixa na rolagem — o que espera decisão |
| Novo atendimento | o formulário | **Resumo** com o perfil exigido, que muda enquanto se marcam atividades |
| Detalhe do atendimento | o registro | avaliação e conversa |
| Perfil do cuidador | quem a pessoa é | o que ela já fez com esta empresa |

**Formulário não se parte em duas colunas.** O caminho de preenchimento é linear; o que vai ao lado
dele é conteúdo derivado (um resumo), nunca metade dos campos.

**A ordem escrita é a ordem do celular.** Onde o desktop precisa de outra ordem, a peça é colocada
por `col-start`/`row-start` — nunca reescrevendo o documento e consertando o celular depois.

**Nunca escreva o caso desktop primeiro e conserte depois com `max-md:`.** A ordem da declaração
é a ordem da prioridade, e ela precisa ser legível no `className`.

### O celular não recebe a mesma tela, recebe a mesma tarefa

Encolher o desktop não é adaptar. Cada uma destas peças existe porque o padrão do desktop estava
errado em tela pequena — e nenhuma delas remove função.

| Peça | Celular | `md` e acima | Por quê |
|---|---|---|---|
| **Navegação** | 4 abas + sino + folha "Mais" | barra lateral com os 7 destinos | Sete destinos não cabem numa barra de abas; a versão anterior escondia dois deles em lugares sem nome |
| `<FilterRow>` | fila que rola na horizontal | quebra em linhas | Três abas + cinco categorias viravam quatro linhas de controle antes do primeiro registro |
| `<StatStrip>` | fila de cartões que rola | faixa emendada | Cinco números em duas colunas comiam ~190px do topo do painel |
| `MOBILE_ACTION_BAR` | barra fixa acima das abas | linha de botões no fluxo | A ação decisiva não pode morar no fim de uma tela longa |
| Relatório de horas | um cartão por registro | tabela de 6 colunas | Rolar na horizontal escondia justamente a coluna que responde à pergunta da tela |
| Filtros do relatório | recolhidos atrás de "Filtros" | sempre abertos | Quatro campos empilhados empurravam o relatório para fora da tela |

**A navegação do celular é uma escolha editorial, não um recorte.** A barra leva as telas abertas
durante a operação. Notificação vira **sino no cabeçalho com contagem** — é onde a pessoa procura,
e o número também vai no rótulo acessível, porque um ponto colorido não diz quantos nem diz nada a
quem não distingue a cor. O que sobra vai para a folha **"Mais"**, que é o mesmo `<Modal>` (já é
folha inferior no celular). "Sair" mora lá: usar área nobre de todas as telas para uma ação de uma
vez por sessão é troca ruim.

**Nada é escondido por ser secundário — é reposicionado por ser secundário.** Relatórios e
Configurações não estavam na barra antes desta revisão; estavam numa engrenagem sem rótulo e num
link no pé do painel. A folha "Mais" é mais descoberta do que os dois.

### Alvo de toque — 44px

**Mínimo de 44×44px** para tudo que se toca. O número vem do menor alvo que um polegar acerta com
confiabilidade e é o piso das diretrizes de iOS; a versão anterior desta página dizia 40px, o que
era otimismo.

| Elemento | Celular | Desktop | |
|---|---|---|---|
| `<Button size="md">` | 44px | 44px | ✅ `min-h-11` |
| `<Button size="sm">` | 44px | 36px | ✅ `min-h-11 pointer-fine:min-h-9` |
| `<Chip>` | 44px | 32px | ✅ `min-h-11 pointer-fine:min-h-8` |
| `<Check>` (linha inteira) | 44px | 25px | ✅ `min-h-11 pointer-fine:min-h-0` |
| Estrela de avaliação | 44px | 28px | ✅ `size-11 pointer-fine:size-7` |
| `<VoltarLink>` | 44px | justo | ✅ `min-h-11 px-2 -ml-2 pointer-fine:*` |
| Ação da linha de registro (`ROW_ACTION_CLASS`) | 44px | 28px | ✅ `min-h-11 pointer-fine:min-h-7` |
| Link de cabeçalho de `<Secao>` (`SECAO_LINK_CLASS`) | 44px | justo | ✅ `min-h-11` + `-my-2.5` no contêiner, `pointer-fine:min-h-0` |
| Ação secundária de card (`ACTION_LINK_CLASS`) | 44px | 32px | ✅ `min-h-11 pointer-fine:min-h-8` |
| Campo (`field.ts`) | 44px | 44px | ✅ `min-h-11` — media 43px por arredondamento |
| Sino / "Mais" do cabeçalho | 44px | — | ✅ `size-11` |
| Linha da folha "Mais" | 48px | — | ✅ `min-h-12` |
| Campo (`Input`/`Select`/`Textarea`) | ~44px | ~44px | ✅ vem do `text-body` |
| Aba da barra inferior | ~59px | — | ✅ |
| Fechar do `<Modal>` | 44px | 44px | ✅ `size-11 -m-2.5` |
| Dispensar do `<Toast>` | 44px | 44px | ✅ `size-11 -m-2` |
| Item da barra lateral | — | ~37px | ✅ desktop, ponteiro |

**A régua é o ponteiro, não a largura.** Os elementos que encolhem usam `pointer-fine:`, e isso é
uma correção: com `md:`, um tablet em paisagem e um notebook com tela sensível passam de 768px e
recebiam alvo de 32–36px, sendo que continuam sendo dedo. Largura de tela nunca disse método de
entrada.

Não é inconsistência que o alvo mude: o polegar precisa dele, o ponteiro não, e uma fila de
controles gordos no desktop desperdiça a densidade que a coordenadora quer numa tela de quinze
plantões. Medido: 1440px com mouse → linha de 25px, chip de 35px; 390px e **1024px** com toque →
44px nos dois.

**Medição completa.** Varredura de todo elemento focalizável em 16 rotas a 390px com toque: de
**37 alvos abaixo de 44px para 1**. O que sobra é o link "Criar cadastro" dentro da frase "Ainda
não tem conta?" — a WCAG 2.5.8 isenta explicitamente link embutido em bloco de texto, e aumentá-lo
quebraria a linha.

O "Ver todos" do cabeçalho de `<Secao>` nasceu **depois** dessa varredura (revisão 15) e entrou com
~18px; foi corrigido na revisão 17. É o padrão do buraco: componente novo não herda a régua de
alvo, herda o CSS de quem foi copiado. Componente que introduz um elemento clicável precisa entrar
nesta tabela no mesmo PR.

**A saída quando o visual não pode crescer:** aumente a área, não o desenho. Margem negativa
(`size-11 -m-2.5`) expande o alvo sem engordar o ícone — é o que o ✕ do modal e do toast fazem.

**Espaçamento entre alvos:** mínimo de 8px. Dois botões colados, mesmo com 44px cada, produzem
toque errado na borda.

### Safe area ✅

A meta viewport declara `viewport-fit=cover` — **sem isso `env(safe-area-inset-*)` vale zero no
iOS**, e a barra de abas, apesar do padding declarado, ficava por baixo do indicador de início do
iPhone.

Com o inset valendo, tudo que é fixo na borda inferior o respeita:

| Elemento | Como |
|---|---|
| Barra de abas | `pb-[env(safe-area-inset-bottom)]` |
| `<Modal>` (folha) | `pb-[max(1.25rem,env(safe-area-inset-bottom))]` |
| `<Toast>` | `bottom-[calc(4.5rem+env(safe-area-inset-bottom))]` — acima da barra de abas |

Componente novo que se prende na borda inferior **precisa** entrar nessa lista.

### Altura de tela: `dvh`, não `vh` ✅

`100vh` no Safari do iPhone é a altura **sem** a barra de endereço, que só existe depois de rolar:
a tela nasce alta demais na primeira pintura e produz uma rolagem fantasma. O produto usa `dvh` em
todos os casos — `min-h-[60dvh]` e `min-h-[100dvh]` no `<TelaCarregando>`, `max-h-[85dvh]` /
`md:max-h-[80dvh]` no `<Modal>`. **Não escreva `vh` em código novo.**

### Regras de conteúdo em tela pequena

1. **Nada essencial só em `hover`.** Não existe `hover` em toque. Ação que só aparece ao passar o
   mouse não existe para metade dos usuários deste produto.
2. **Uma coluna.** Card, lista e histórico ocupam a largura toda. Só campo curto vai para duas
   colunas.
3. **Truncar na ordem certa.** Quando falta largura, quem sobrevive é o que decide a próxima ação:
   o crachá de status fica (`shrink-0`), o nome trunca (`min-w-0 truncate`). Nunca o contrário.
4. **Quebrar em vez de rolar na horizontal.** Fila de chips usa `flex-wrap`. A página **nunca**
   rola na horizontal — se rolar, alguma coisa tem largura fixa que não devia ter.
5. **Ação primária ao alcance do polegar.** Em formulário, a ação principal é `block` e fica no
   fim do fluxo. Em tela de decisão, ela vai para o bottom sheet, que já nasce embaixo.
6. **Piso de 12px de texto**, e campo sempre em 16px (seção 7, `<Input>`).
7. **A barra de abas some do fluxo, não do espaço:** o contêiner de conteúdo leva `pb-20` em
   celular (`md:pb-0`), senão o último card fica embaixo da barra.
8. **Modal vira bottom sheet** abaixo de `md`. Ver seção 7.

### Como testar, antes de abrir PR

- 390px de largura (iPhone 14/15) — é a medida de referência do projeto.
- 320px (iPhone SE) — nada pode quebrar layout nem rolar na horizontal.
- Com o teclado do celular aberto sobre um formulário longo: a ação primária ainda é alcançável.
- Toque, não clique: passe o dedo pela tela e confirme que toda ação responde com o afundar de
  `active:scale-[0.97]`.

---

## 12. Acessibilidade

- **Foco:** um único anel para o produto inteiro, aplicado por `:focus-visible` em `index.css`
  (`outline: 2px solid var(--color-accent)`, offset 2px). Não escreva `focus-visible:` em
  componente — e nunca `outline: none` sem substituto.
- **Contraste:** texto normal ≥ 4,5:1, texto grande ≥ 3:1. Todos os pares base/`-soft` da seção 3
  já passam; `--accent` sobre branco fecha 6,4:1.
- **Cor nunca sozinha:** todo crachá tem rótulo escrito; o stepper marca a etapa por posição e
  peso; a aba ativa tem traço e ícone mais grosso.
- **Alvo de toque:** mínimo 44px no celular (seção 11).
- **Semântica:** grupo de chips vai em `fieldset`/`legend`; chip de alternância usa `aria-pressed`;
  ícone decorativo leva `aria-hidden`; ícone que é o único conteúdo de um botão leva `aria-label`.
  O `<img>` da marca é decorativo (`alt=""`) — o nome do produto já está no texto ao lado.
- **`accent-color`** está definido em `:root`, então checkbox, radio e range nativos já saem na cor
  da marca — não estilize esses controles à mão.
- **Movimento:** `prefers-reduced-motion` ✅ é respeitado, com os ganchos `data-movimento` para o
  que desloca (seção 6). Componente novo que desloca precisa declarar o gancho.
- **Anúncio de mudança** ✅: carregando (`role="status"`), erro (`role="alert"`), sucesso
  (`role="status"`, ou `alert` quando é erro flutuante). Ver seção 8.
- **Diálogo** ✅: `<Modal>` tem `role="dialog"`, `aria-modal`, `aria-labelledby`, prisão de foco,
  retorno de foco ao elemento que abriu, Esc e trava de rolagem do fundo.
- **Campo inválido** ✅: `aria-invalid` no controle e `aria-describedby` apontando para a mensagem.
- **Rolagem ao trocar de tela** ✅: `RolagemAoTopo` leva ao topo a cada rota, para que quem entra
  numa tela nova comece a ler pelo título (seção 6).

---

## 13. Checklist antes de abrir PR de front

**Tokens e reúso**

- [ ] Nenhum hex, `rgb()`, `rounded-[…]` ou cor do Tailwind (`slate-`, `blue-`…) no `className`.
- [ ] Reusei o que existe: `Button` · `ButtonLink` · `Card` · `Chip` · `Input` · `Select` ·
      `Textarea` · `Cracha` · `Modal` · `Aviso` · `Toast` · `TelaCarregando` · `Skeleton` ·
      `Stepper` · `Avatar` · `Logo`.
- [ ] Ação que **navega** é `<ButtonLink>`; ação que **executa** é `<Button>`.
- [ ] Fila de filtros usa `<Chip>`, não `<button>` com classes escritas à mão.
- [ ] Classe de estado veio de `constants/`, não escrita na tela.
- [ ] Nenhuma string de classes repetida em dois lugares da mesma página.

**Hierarquia**

- [ ] Um `h1` (`text-display`) por tela; uma única ação `primary`.
- [ ] Todo `.numero` é registro, data, hora, valor ou documento — nada de texto corrido.
- [ ] A marca aparece via `<Logo>`/`<LogoMark>`, sem fundo próprio e com o nome em caixa normal.
- [ ] Numa linha de registro, cada camada está no seu lugar (seção 9.0): **estado** na coluna fixa
      (sempre um estado, nunca contagem nem substantivo de coisa), **situação** em linha própria,
      **informação complementar** neutra, **ação** em `text-accent`. Informação e ação nunca
      dividem a mesma faixa.
- [ ] Texto de dado é frase inteira: "1 cuidador compatível no quadro", não "1 compatível".

**Estados**

- [ ] Estado vazio, carregando, erro **e confirmação de sucesso** existem e dizem o que fazer.
- [ ] O esqueleto de carregamento ocupa a mesma altura do conteúdo real.
- [ ] Mensagem de erro diz o que fazer e tem `role="alert"`.

**Movimento**

- [ ] Nenhum `transition-all`; as propriedades estão nomeadas — e são as que realmente mudam
      (`transition-colors` não anima largura).
- [ ] Nada passa de 200ms; a curva é `ease-out`.
- [ ] Se o elemento **desloca ou muda de escala**, ele declara `data-movimento`.

**Mobile**

- [ ] Testei em 390px **e** em 320px. Sem rolagem horizontal.
- [ ] Todo alvo de toque tem 44px; entre alvos, ao menos 8px.
- [ ] Nada essencial só em `hover`.
- [ ] Nenhum `vh` — só `dvh`.
- [ ] Se prende na borda inferior, respeita `env(safe-area-inset-bottom)`.
- [ ] Campo em `text-body` (16px) — sem zoom automático no iOS.

**Documentação**

- [ ] **Componente novo, variação nova ou padrão novo está documentado nesta página**, no formato
      da seção "Como ler esta página".
- [ ] Se a mudança resolveu uma pendência, a entrada saiu da seção 15 e o marcador virou ✅.

**Build**

- [ ] `npx tsc -b` e `npx oxlint src` limpos.

---

## 14. Histórico de decisões

### Revisão 18 — a coluna do Início recuperou hierarquia (sem recuperar a caixa) (agosto/2026)

**O problema.** A revisão 15 tirou as molduras do Início e a 16 tirou a última. O acúmulo de
caixas acabou — e apareceu o defeito oposto: com quatro regiões seguidas sem contêiner **e com os
quatro rótulos no mesmo cinza `--ink-muted`**, a coluna ficou num plano só. "Atendimentos de hoje"
e "Em aberto" chegavam com o mesmo peso de "Atividade recente", que é histórico, e o começo de
cada região dependia exclusivamente do espaço em branco entre elas.

**A tentativa que não passou.** A primeira correção foi dar às duas seções operacionais uma
superfície própria: `bg-surface-raised`, `border border-linha`, `rounded-card`, **sem sombra**,
uma caixa por região e não por registro. No papel obedecia todas as regras — a regra da revisão 13
(sombra é só elevação de verdade), a proibição de card por atendimento, o teto de duas por tela.

Na tela, leu como card. E o motivo é o que fica desta revisão:

> **Borda + raio + fundo é a assinatura do card, qualquer que seja o conteúdo da caixa.** Tirar a
> sombra não desfaz a assinatura, e "é uma caixa por região, não por registro" é uma distinção que
> existe no código, não no olho de quem abre a tela.

Duas dessas no topo do Início reconstroem a pilha de painéis que a revisão 15 desmontou — com o
agravante de serem só duas, o que faz as outras duas seções parecerem inacabadas em vez de
calmas.

**O que ficou.** A hierarquia veio da tinta, e só dela: `<Secao variant="destaque">` em
"Atendimentos de hoje" e "Em aberto" — rótulo em `--ink` no lugar de `--ink-muted`, contagem em
`--ink-muted` no lugar de `--ink-subtle`. Contêiner, fundo, borda, raio e espaço ficaram
**idênticos** aos do `padrao`. "Próximos" e "Atividade recente" não mudaram.

| | Antes | Depois |
|---|---|---|
| Rótulo das seções operacionais | `--ink-muted`, igual às outras | **`--ink`** |
| Contagem delas | `--ink-subtle` | `--ink-muted` |
| Moldura, fundo, raio, altura | nenhum | **nenhum** — o CSS do build não ganhou uma classe |

**A regra que isto vira.** Numa coluna sem molduras, hierarquia se faz com tinta, posição e
densidade — nessa ordem —, nunca reintroduzindo contêiner. Se uma região precisa mesmo de
moldura, ela não era uma seção: era um `<Painel>`.

**Onde bateu.** `Secao` (a variante de tinta e a nota da superfície reprovada), Início da empresa
(as duas seções e a nota de arquitetura da coluna). Nenhum outro call site mudou — a variante
nasce opt-in e o padrão continua sendo a região sem moldura em `--ink-muted`.

---

### Revisão 17 — o plantão em aberto ganhou camadas (agosto/2026)

**O problema.** A seção "Em aberto" do Início já era lista e não card — isso a revisão 15 tinha
resolvido. O que sobrou foi de **hierarquia dentro do registro**: um plantão sem cuidador carrega
quatro informações a mais que um confirmado, e as quatro chegavam achatadas no mesmo plano.

Três defeitos concretos, e nenhum deles era de cor ou de espaçamento:

1. **A coluna de estado misturava conceitos.** Ela dizia "Em busca" numa linha, "Convidado" na
   seguinte e "Candidaturas" na terceira. As duas primeiras são estados; a terceira é um
   substantivo de coisa. Ler uma coluna em que a posição ora responde *em que pé está* e ora
   responde *o que chegou* obriga a parar e reinterpretar a posição a cada linha.
2. **Informação e ação dividiam a mesma faixa.** "1 compatível no quadro" ficava a 12px de "Buscar
   cuidadores" e "Candidaturas (1)", com pesos parecidos. A informação parecia um link que não
   clicava; os links pareciam continuação da frase.
3. **A situação operacional não tinha degrau.** "Aguardando cuidador" era mais uma linha de texto
   secundário, do mesmo tamanho e no mesmo cinza do bairro e da duração — quando é exatamente a
   frase que diz por que aquele registro está naquela seção.

Havia ainda uma redundância de vocabulário atrás do defeito 1: dois mapas de rótulo
(`ATTENDANCE_STATUS_LABEL` e `ATTENDANCE_STATUS_SHORT`) que divergiam em dois estados, e a palavra
"Candidaturas" aparecendo três vezes no mesmo registro — como estado, como situação e como ação.

**O que mudou.**

| | Antes | Depois |
|---|---|---|
| Vocabulário de estado | dois mapas, divergentes em 2 estados | **um** mapa; `sr-only` da variante `linha` removido |
| `applications_received` | "Candidaturas" / "Candidaturas recebidas" | **"Em confirmação"** — estado, não contagem |
| `invited` | "Convidado" / "Convite enviado" | **"Convidado"**, nos dois lugares |
| Situação operacional | "Aguardando cuidador" para os três estados abertos, `text-meta` 400 | frase por estado (`ATTENDANCE_SITUATION`), `text-note` **500**, degrau `mt-2` |
| Recado + ações | uma linha, `gap-x-3` entre eles | **duas camadas**, uma linha cada |
| Ações | dois links com `gap` | links separados por **ponto médio**, com `active:` próprio |
| Recado | "1 compatível no quadro" | "1 cuidador compatível no quadro" |
| "Ver todos" do `<Secao>` | ~18px de alvo | 44px no toque, sem engordar o cabeçalho |

O registro passou a ter **cinco camadas nomeadas** (seção 9.0), e a regra da camada 3 é a que
organiza o resto: a situação **nomeia a parte que precisa agir** — o cuidador que não apareceu, o
cuidador que não respondeu, a coordenadora que não confirmou. Estado responde *em que ponto do
ciclo*; situação responde *de quem se está esperando*; contagem responde *quantos* e mora na
camada 4 ou entre parênteses no rótulo da ação. Três perguntas, três lugares fixos.

**O que não mudou, e é o ponto.** Nenhum card voltou. Nenhuma borda em volta de registro, nenhuma
sombra, nenhuma pílula, nenhum badge grande. Os separadores continuam sendo um fio de 1px, a linha
inteira continua sendo a área clicável, e o `denso` continua cabendo em ~56px porque lá a camada 3
é coluna, não linha. A seção "Em aberto" continua falando a mesma língua de "Atendimentos de hoje"
— só que com duas camadas a mais, porque tem duas perguntas a mais a responder.

**Onde bateu.** `constants/attendance.ts` (vocabulário), `StatusAtendimento` (um rótulo só),
`AttendanceRow` (as cinco camadas e o ritmo), `AttendanceOpenActions` (ponto médio),
`button-classes.ts` (`SECAO_LINK_CLASS`, `active:` nas ações), `Secao` (alvo de toque do
cabeçalho), Início da empresa (texto do recado).

---

### Revisão 16 — "Atividade recente" virou histórico (agosto/2026)

A revisão 15 tirou três seções do Início da moldura e deixou uma de fora: "Atividade recente"
continuou num `<Painel>` com borda e faixa de cabeçalho, no fim da coluna. O argumento da época
era que ela não é uma lista de registros, é outro padrão. Só que o efeito na tela era o contrário
do pretendido — no fim de três listas soltas, a única caixa restante não lia como "esta é
diferente", lia como **um card genérico de dashboard com uma lista de notificações dentro**, que é
exatamente a aparência que o produto evita.

O que mudou:

- **A moldura caiu.** A seção passou a `<Secao title="Atividade recente">`, como as três de cima:
  rótulo em versalete, cronologia embaixo, nada em volta. O fio da linha do tempo delimita a
  região melhor do que uma borda faria.
- **O carimbo desceu para baixo do evento.** Encostado à direita, ele comprimia a frase, abria um
  vão no meio de toda entrada curta e trocava de altura de item para item. Empilhado, todo evento
  tem a mesma silhueta e a coluna vira uma varredura de cima para baixo.
- **Evento e motivo se separaram.** `recentActivity()` passou a devolver `text` e `detail`: era
  uma frase só — "Atendimento de Marli Souza cancelado: Paciente foi internada." — e virou título
  em peso 500 mais uma linha secundária.
- **O marcador ganhou o tom `neutro`** (`--linha-strong`), para a rotina não gastar a tinta da
  marca: hoje a coluna tem três tons — neutro para "criado", accent para "check-in" e "concluído",
  vermelho queimado para "cancelado".
- **A cor semântica saiu do texto.** O evento cancelado deixou de sair em vermelho: a tinta fica
  no ponto de 8px, e a palavra "cancelado" faz o resto (regra 3).
- **A entrada inteira virou o alvo de clique** (prop `para`) — marcador, evento, contexto e
  carimbo levam à ficha do atendimento que gerou o evento, com `hover:bg-surface-sunken/60` e
  `active:bg-surface-sunken`. Antes a atividade era texto morto: lia-se "Check-in registrado em
  Antônio Ferreira" e era preciso procurar o plantão na mão, na tela ao lado.
- **`carimbo()` passou a escrever `23/08 às 22:44`.** Como última linha de um evento, `23/08 22:44`
  vira uma sequência de quatro números que o olho lê como um bloco só. Vale para o produto inteiro
  — carimbo de observação e de mensagem incluídos.

**Nada de dado ou de regra mudou**: são os mesmos seis eventos, derivados dos mesmos atendimentos
da empresa (nunca do `auditLog` global, que quebraria o isolamento de dados). O que mudou é que
agora eles se leem como o histórico de uma operação.

### Revisão 15 — o Início saiu da moldura (agosto/2026)

"Atendimentos de hoje" era um `<Painel>` com borda, faixa de cabeçalho e pastilha de contagem,
contendo três linhas. O resultado lia como *um card grande com um atendimento dentro*, e não como
*a lista operacional do dia* — que é o que a coordenadora abre a tela para ver. Empilhado com "Em
aberto", "Próximos" e "Atividade recente", o Início somava quatro molduras entre ela e cinco
plantões: exatamente o acúmulo que faz uma tela de trabalho parecer dashboard genérico.

O que mudou:

- Nasceu o **`<Secao>`** ([seção 7](#secao--a-região-sem-moldura)), o terceiro degrau da escada de
  contêineres: uma região **nomeada**, sem moldura nenhuma. Rótulo `text-dado` versalete e
  contagem como número puro depois de um ponto médio — `ATENDIMENTOS DE HOJE · 3`.
- O **`<AttendanceRow>` ganhou a disposição `empilhado`** ([9.0](#90-o-registro-de-atendimentos----attendancerow--attendancelist)),
  mobile-first: hora e estado na primeira linha, paciente e valor na segunda, contexto na terceira,
  cuidador na quarta. No desktop a calha de hora volta e o registro cai para três linhas. Mesmo
  componente, mesmo DOM, mesma hierarquia — só muda em que célula cada dado cai.
- O **`<AttendanceList>` ganhou a variante `fluxo`**: os fios entre as linhas, sem borda, fundo
  nem raio, com `-mx-2` para o fundo de hover sobrar 8px de cada lado do texto.
- **O feedback de toque passou a existir.** Havia `hover:` e nada para o dedo. Entraram
  `active:bg-surface-sunken` e `has-[a:focus-visible]` na linha inteira — sem o segundo, o anel de
  foco cercava só o nome do paciente e não dizia que a **linha** era o destino.
- O piso de toque do `empilhado` é `min-h-20` com `pointer-fine:min-h-0`. A régua é o método de
  entrada, não a largura da tela.
- O **`<Vazio>` ganhou o porte `solto`** (sem recuo horizontal), para o vazio dentro de uma seção
  alinhar com as linhas da lista em vez de recuar 14px de uma borda que não existe.
- **"Sem cuidador" virou "Aguardando cuidador"**, na linha e na ficha. Dois rótulos para o mesmo
  estado é o começo de um vocabulário que ninguém consegue manter.

**As três leituras da escala mudaram juntas** — Hoje, Em aberto e Próximos: o que acontece agora,
o que falta resolver, o que vem à frente. Sem moldura, o que separa uma seção da outra é o rótulo
em versalete e o espaço; uma caixa sobrando no meio de listas soltas não lê como "esta é
diferente", lê como sobra. "Atividade recente" ficou de fora desta revisão por ser
uma linha do tempo e não uma lista de registros — exceção que a revisão 16 desfez: no fim de três
listas soltas, a última moldura restante lia como um card de dashboard esquecido ali.

### Revisão 14 — a cor de sinalização ganhou uma escala (agosto/2026)

O painel de Pendências tinha ponto âmbar e ponto vermelho decididos por um booleano `urgente`.
Ninguém conseguia dizer o que separava um do outro, a lista não ordenava por gravidade, e o campo
`DashboardAlert.severity` existia no tipo e nos mocks sendo **ignorado** pela tela.

O que mudou:

- Nasceram os **quatro níveis** ([3.2](#32-níveis-de-sinalização---pontonivel)) sobre tokens que
  já existiam — nenhuma matiz nova, e o azul de "informação" é o próprio `--accent`.
- **A ordem passou a acompanhar a cor.** É o que faz o vermelho significar alguma coisa.
- O ponto caiu de 6px para **5px**: índice da linha, não o elemento principal dela.
- O `<Painel>` ganhou a variante **`quieto`** — menos cara de card, ainda um card — e o painel de
  Pendências passou a cortar em cinco linhas com "mais N".
- O `<Aviso>` ganhou o 4º tom (`atencao`), e a faixa de convites do cuidador, que era uma caixa
  âmbar montada à mão, passou a usá-lo.
- Em Notificações, o sino repetido em vinte linhas deu lugar ao ponto de nível.

**Componentes que nasceram:** `<PontoNivel>` e `constants/nivel.ts`.

### Revisão 13 — o módulo de Atendimentos virou registro (agosto/2026)

O módulo inteiro — lista, ficha, escala, matching, candidaturas, convites e os dois painéis de
Início — foi redesenhado para parecer o que é: **software de operação, usado todo dia para
preencher escala**, e não um painel bonito de apresentação.

Cinco padrões se somavam para produzir a estética de template, e todos saíram:

- **Todo atendimento era um card.** Virou `<AttendanceRow>`: linha de registro com coluna fixa
  para cada dado, dentro de **uma** moldura (`<AttendanceList>`). A altura caiu de ~150px para
  ~56px no desktop e ~74px no celular, **com mais informação dentro** — e a leitura virou
  varredura vertical, porque a coluna de horários, a de valores e a de estados alinham. Seção 9.0.
- **Estado era sempre uma pastilha de 999px.** Nasceu o `<StatusAtendimento>`, com cinco **formas**
  para nove estados — anel vazado espera decisão, ponto está firmado, ponto com halo acontece
  agora, quadrado cheio encerrou, quadrado vazado caiu. O `<Cracha>` continua, e ficou com o que
  sempre foi dele: **credencial de pessoa**. Seção 3.1.
- **Um ícone antes de cada dado.** A fila `📅 data ◷ hora 📍 local 👤 cuidador` sumiu inteira. O que
  separa dado de dado agora é posição de coluna. Ícone só onde carrega significado (o cadeado do
  endereço trancado) ou representa ação.
- **Sombra em tudo.** `shadow-card` estava em card, item de lista, botão primário e chip aceso.
  Sombra passou a significar **uma** coisa: elevação de verdade — modal, folha, barra flutuante.
  O que separa conteúdo é borda de 1px e espaço. Seção 5.
- **Canto muito arredondado.** Os raios caíram de 10/14/18px para 6/9/12px, e nasceu o
  `--radius-marker` de 3px. `rounded-full` deixou de ser padrão e ficou só no que é redondo por
  natureza: avatar, ponto, crachá de credencial. Seção 5.

**Componentes que nasceram:** `<Painel>`, `<ListaDeDados>`/`<Dado>`, `<StatusAtendimento>`,
`<Tabs>`, `<LinhaDoTempo>`, `<Vazio>`, `<Contador>`, `<AttendanceRow>`/`<AttendanceList>`/
`<AttendanceGroupHeader>`, e os formatadores de data em `utils/date.ts`.

**Componentes que morreram:** `<AttendanceCard>` (virou linha) e `<StatStrip>` (nunca foi usado por
tela nenhuma, e era a fila de cartões de métrica que esta revisão existe para eliminar).

**Dívidas que a revisão fechou de passagem:**

- **`<Stepper>` estava documentado e não era chamado por tela nenhuma.** Virou a régua do ciclo no
  cabeçalho da ficha — publicado → cuidador → confirmado → check-in → check-out → avaliado — que é
  o lugar para o qual ele sempre foi escrito. Ganhou forma de celular: abaixo de `sm`, os seis
  rótulos viram a frase "Etapa 3 de 6 · Confirmado", porque seis rótulos em colunas de 48px
  quebravam no meio da palavra.
- **`<SkeletonLista>` também nunca era chamado.** As listas de atendimento passaram a carregar com
  a moldura já desenhada e as linhas chegando — antes a tela inteira sumia atrás de "Carregando…"
  e voltava com outro layout.
- **`startDate.split("-").reverse().join("/")` estava escrito à mão em onze telas**, cada uma com
  um formato. Virou `utils/date.ts` — `diaMes`, `dataCompleta`, `rotuloDoDia` ("Hoje"/"Amanhã"),
  `carimbo`. O `rotuloDoDia` usa data **local**, não `toISOString()`: às 22h em Brasília o UTC já
  virou o dia seguinte e "Hoje" apareceria em cima do plantão de amanhã.
- **A ficha do atendimento não tinha saída no estado de erro.** "Atendimento não encontrado" era
  uma frase centralizada no vazio, sem link nenhum.
- **A pendência do Início não levava a lugar nenhum.** Lia-se "Candidaturas aguardando decisão" e
  era preciso procurar o atendimento na mão; agora cada pendência é uma linha clicável que leva ao
  lugar onde a decisão é tomada.
- **A contagem das abas não respeitava o filtro corrente**, então a aba prometia dez e entregava
  dois.
- **`overflow-hidden` na moldura da lista** teria matado o `sticky` do cabeçalho de dia da escala —
  `hidden` cria contêiner de rolagem. Trocado por `overflow-clip`, que recorta o canto sem criar o
  contêiner.

**Verificação:** três rodadas de captura em Chrome headless sobre o produto rodando, em 1440px e
390px, cobrindo Início (empresa e cuidador), Atendimentos, Escala, ficha, matching, candidaturas,
convites e o estado de "não encontrado" — **0 erro de console**. Cada rodada devolveu defeitos
que a rodada seguinte corrigiu: a ação rápida em toda linha (a lista do celular caiu de 1760px
para 1556px), o âmbar de "Sem cuidador" aceso em rascunho e cancelado, a folga acumulada entre as
colunas de nome e cuidador, o painel "Atendimentos de hoje" vazio no topo do Início, o fio de
separação cortado pelo `prosa` e as quatro linhas por candidato no matching (a tela caiu de 1315px
para 1141px).

### Revisão 12 — a marca virou teal, e o logo ganhou paleta própria (agosto/2026)

Chegou uma arte nova da marca: **mesmo símbolo, mesma geometria, repintado**. Saiu o par verde
sálvia + verde petróleo, entrou uma escala de teal em três degraus. O produto inteiro estava
montado sobre o verde.

- **A paleta saiu do verde e foi para o teal.** `--brand`/`--accent` foi de `#025658` para
  `#175260`; `--accent-soft` de `#E2EDE9` para `#DFF1F3`. Os três valores da marca foram
  amostrados pixel a pixel de `public/logo_new.jpeg` — mediana por região, não estimativa a olho.
- **A arte tem três tintas agora, não duas.** `--brand-sage` e `--brand-sage-ink` morreram. No
  lugar entraram `--brand-mid` (o núcleo do símbolo, que antes era da mesma tinta dos elos
  escuros), `--brand-aqua` (os elos claros) e `--brand-aqua-ink` (o aqua rebaixado até virar
  letra).
- **A marca e a interface passaram a ter paletas separadas, e é a decisão de fundo desta
  revisão.** A marca fica com os três degraus; a interface, só com o mais fundo. O aqua é o
  degrau que mais nada no produto tem — 1,96:1 sobre branco, claro demais para qualquer papel de
  interface —, e é exatamente por isso que o logo se destaca de tudo em volta. Custou zero token
  extra: é separação por **uso**, não por criar uma segunda versão de cada cor.
- **A escala neutra virou fria.** Era um cinza esverdeado, porque a marca era verde; agora é um
  grafite azul-esverdeado em H ≈ 208° (`#1D2122` / `#F4F6F7`), pela mesma razão de sempre — o
  neutro puxa para a matiz da marca para que ela pareça da família e não um adesivo colado.
  A sombra acompanhou: `rgb(29 33 34)`, que é o próprio `--ink`.
- **A escala de credencial passou a repetir a torção de matiz do símbolo.** No arquivo, a matiz
  anda 217° → 208° → 204° conforme o tom clareia. A credencial faz o caminho inverso e explícito
  — 199° → 211° → 225° —, então quanto mais alta a formação, mais fundo **e mais azul** o teal.
- **Um arquivo de marca só.** `logo-mark.png`, `logo-lockup.png` e o `apple-touch-icon` deixaram
  de ser usados: interface, favicon e ícone de app apontam todos para `public/logo_new.jpeg`.
  Versão derivada é o que sai do lugar quando a arte muda, e foi o que aconteceu nesta revisão.
- **O fundo opaco do JPEG é resolvido em CSS, não em arquivo.** `mix-blend-darken` no
  `<LogoMark>`: como toda superfície onde a marca aparece é mais escura que `#F7F7F7` nos três
  canais, o fundo do arquivo é substituído pela superfície **exatamente** (1,000:1 de diferença,
  por cálculo). `multiply` deixaria um quadrado de 1,07:1 em toda superfície.
- **O lockup ficou inteiro na tinta da marca.** "Acalento" em `--brand`, "Gestão" em
  `--brand-aqua-ink` — a mesma escala do símbolo, na mesma ordem. Antes a primeira palavra saía
  em `--ink`, cor de interface, o que fazia o lockup se ler como título de tela.
- **`--rating` foi de `#B4801E` para `#B1812C`** (3,5:1, mesmo piso). Contra um ambiente todo em
  teal frio, o âmbar deixou de ser só a cor da estrela e passou a ser o complementar do sistema.
- **Verificação:** os quatro contratos de contraste recalculados sobre a paleta inteira — os três
  degraus de texto contra a **pior** superfície do produto, todo par base/`-soft`, os não-texto
  (`--linha-strong`, `--rating`) contra os 3:1 da 1.4.11, e a ação primária. **0 falhas.** O par
  mais apertado é `cat-informal` sobre o próprio soft, em 4,85:1.

### Revisão 11 — passagem final: os buracos que sobraram (agosto/2026)

Revisão de acabamento sobre o caminho inteiro, não sobre uma tela. Nada de conceito novo — o que
foi encontrado eram furos, e eles foram fechados.

- **`<main>` e atalho de teclado nasceram.** Nenhuma tela tinha marco de conteúdo, e quem navega
  por teclado atravessava a barra lateral inteira — sete destinos — a cada troca de tela. O
  atalho é o primeiro focalizável do documento e leva direto ao `<main id="conteudo">`.
  Escrito como utilitário próprio (`pular-para-conteudo` em `index.css`) porque no Tailwind v4
  `not-sr-only` **não é gerado sob a variante `focus:`** — verificado no CSS compilado, não
  suposto; com `sr-only focus:not-sr-only` o atalho ficava preso em 1×1px mesmo focado.
- **O estado de "selecionado" do cadastro era só cor.** Os três alternadores (Cuidador/Empresa e
  as categorias) mudavam de variante sem `aria-pressed` — para leitor de tela, nenhum deles
  estava marcado. Regra 3 desta página, quebrada no lugar mais fácil de não olhar.
- **Entrada e cadastro não tinham `<h1>`.** O lockup é o título visual; agora existe um cabeçalho
  real, invisível, para quem navega por estrutura.
- **"Convidado" era um botão desabilitado.** Convite enviado é uma coisa que **aconteceu**, não
  uma ação indisponível — a 45% de opacidade lia como falha. Virou crachá de confirmação, o mesmo
  vocabulário de estado do resto do produto (seção 3).
- **`ACTION_LINK_CLASS` nasceu.** A mesma string de ação secundária estava escrita à mão em três
  telas; duas ficaram para trás na revisão de alvo de toque e continuavam com 32px no dedo. A
  varredura anterior não as pegou porque as rotas de matching e candidaturas **não estavam no
  conjunto medido** — o furo era da verificação, não só do código.
- **`AppHeader.tsx` foi removido:** componente completo, nunca importado por ninguém.
- **O portão de lint ficou verde.** Ver "Avisos de lint conhecidos" acima.
- **Verificação:** 40 telas percorridas em celular e desktop com console capturado — **0 erros e
  0 avisos**; contraste computado sobre o DOM — 0 falhas; 16 rotas × 5 larguras — 0 estouros
  horizontais; alvos de toque em 18 rotas — 1 exceção, o link dentro de frase que a WCAG 2.5.8
  isenta; `<main>`, ordem de tabulação e o atalho conferidos por medição em cinco rotas.

### Revisão 10 — a tipografia virou sistema, e a família trocou pela marca (agosto/2026)

- **Inter saiu, DM Sans entrou.** Não foi troca por gosto: o símbolo do logo é feito de círculos e
  cápsulas, "ACALENTO" é uma capitular geométrica de bojos redondos, e a Inter é uma neo-grotesca
  de bojo oval — sem relação com a marca, e a face que a maioria das interfaces geradas por IA usa.
  A DM Sans é geométrica de bojo circular, foi comparada lado a lado com Plus Jakarta Sans e
  Manrope sobre conteúdo real do produto (card de atendimento, tabela de horas), e ganhou nos dois
  pontos onde este produto mais aparece: número curto e texto denso de card.
- **A fonte passou a ser servida do projeto** (`public/fonts/`, `@font-face` com
  `unicode-range`), não do Google Fonts. O `PRODUCT.md` diz que a demo roda "sem rede"; com a
  fonte em CDN, wi-fi ruim numa reunião comercial derrubava a tipografia inteira para o fallback
  do sistema — no momento em que o produto mais precisa parecer acabado. Só os dois pesos da
  primeira tela são pré-carregados (`rel="preload"` no `index.html`).
- **A IBM Plex Mono saiu.** O papel real dela nunca foi tipográfico — era alinhar coluna, e isso é
  `tabular-nums`, não uma família inteira. O que sobrava era timbre: uma slab-grotesca da IBM em
  horário, valor, data e contador, ou seja, em quase toda a interface. Virou o utilitário
  `.numero` (tabular, tracking -0.006em, peso 500), dentro da mesma família do texto — prova sem
  sotaque de terminal.
- **Dois papéis novos nasceram**, porque a escala anterior não distinguia rótulo de dado (cabeçalho
  de tabela, legenda de métrica) de título de seção: `--text-dado` (12px, caixa alta, peso 600) e
  `--text-heading` (15px, caixa normal, peso 600).
- **"Caixa alta tracked" deixou de ser o padrão de título de seção.** Era `text-label uppercase
  tracking-wide` em todo `<h2>` do produto — a fórmula-padrão de SaaS genérico. Ficou só onde o
  conteúdo é de fato rótulo de dado; título de seção agora é `text-heading`, caixa normal, peso 600
  fazendo o trabalho de hierarquia sozinho.
- **`--text-note` e `--text-meta` viraram responsivos ao contrário do resto:** maiores no celular
  (15px / 13px), apertam a partir de `md` (14px / 12px). É o inverso de "encolher tudo
  proporcionalmente" — leitura em deslocamento pede corpo maior, tela densa de desktop comporta
  mais por linha.
- **`text-display` ganhou teto mais alto e tracking mais fechado** (28px→34px, antes 26px→32px) e
  os papéis com peso próprio (`heading`, `title`, `display`) deixaram de precisar de
  `font-semibold` redundante no `className` — 20 arquivos tinham as duas coisas escritas juntas.
- **Pesos redundantes removidos em 20 arquivos**, e um separador de dois níveis
  (`{empresa}` / `{empresa}` no cabeçalho e no subtítulo da página) passou a se esconder quando o
  nome da conta é igual ao nome do produto — a DM Sans deixou a repetição mais visível do que a
  Inter deixava.
- **`<StatStrip>` e o registro de atividade tiveram a documentação sincronizada** com o código: a
  seção 9.2 ainda descrevia grade de duas ou três colunas, de antes da extração do componente
  (revisão 9), e o carimbo do registro de atividade ainda citava `font-mono`.
- **Verificação:** contraste computado sobre o DOM em 15 rotas — 0 falhas; 16 rotas × 5 larguras —
  0 estouros horizontais; alvos de toque — inalterados desde a revisão 9 (1 exceção documentada,
  link dentro de frase); as três famílias candidatas renderizadas lado a lado sobre conteúdo real
  antes da escolha, não por preferência a olho.

### Revisão 9 — e o celular deixou de ser o desktop encolhido (agosto/2026)

A revisão 8 deu layout ao desktop. Esta faz o caminho oposto: cada tela foi analisada em 390px e
adaptada ao gesto, não reduzida. Nenhuma regra de negócio mudou e nenhuma função saiu.

- **A barra de abas passou a ser editorial.** Levava cinco itens, e dois destinos ficavam fora da
  navegação — Configurações era uma engrenagem sem rótulo e Relatórios um link no pé do painel.
  Agora são **quatro abas** (as telas da operação), **sino com contagem** no cabeçalho e uma folha
  **"Mais"** com o resto. Alvo por aba subiu de 20% para 25% da largura, e "Sair" desocupou o
  cabeçalho de todas as telas.
- **O contador de avisos virou número nos dois perfis.** A empresa não tinha nenhum; o cuidador
  tinha um ponto vermelho que não dizia quantos e sumia para quem não distingue a cor. O número
  entra também no `aria-label`.
- **`<FilterRow>` nasceu.** No celular a fila de filtros rola na horizontal e sangra até a borda;
  a partir de `md` volta a quebrar em linhas. Em Cuidadores isso devolveu duas linhas de altura
  antes do primeiro registro.
- **`<StatStrip>` nasceu.** Cinco números em duas colunas ocupavam três linhas no topo do painel e
  empurravam "Pendências" — o que pede ação — para baixo da dobra. Viraram uma fila que rola, com
  `snap`, e nada foi escondido.
- **`MOBILE_ACTION_BAR` nasceu.** "Fazer check-in" ficava depois do endereço, do paciente e do
  cuidador; "Publicar atendimento" depois de onze atividades. Agora flutuam acima da barra de
  abas. É **um elemento só**, não uma cópia: `md:static` desfaz o estado flutuante.
- **O relatório de horas tem duas formas.** No celular, um cartão por registro, com
  previsto/realizado como par — que é a leitura da tela; a tabela de seis colunas obrigava a
  arrastar na horizontal justamente até a coluna que responde à pergunta. A partir de `md`,
  tabela, que é mais rápida de varrer quando há largura.
- **Os filtros do relatório recolhem no celular** atrás de um botão que diz quantos estão ativos.
  Quem abre a tela quer primeiro ver as horas.
- **`<VoltarLink>` e `<Check>` nasceram** de código copiado em seis e três telas. Os dois estavam
  abaixo do alvo mínimo em todas as cópias.
- **O atalho de Relatórios no pé do painel saiu**: existia porque Relatórios não tinha casa na
  navegação do celular. Agora tem.
- **Medição, não impressão:** varredura de todo elemento focalizável em 16 rotas a 390px com
  toque — de **37 alvos abaixo de 44px para 1**, e esse 1 é o link dentro de frase que a WCAG
  2.5.8 isenta. Somado a: 16 rotas × 5 larguras sem estouro horizontal, e contraste computado
  sobre o DOM com 0 falhas.

### Revisão 8 — o desktop deixou de ser o celular esticado (agosto/2026)

- **A regra "não use `lg:` nem `xl:`" caiu, e ela era desta página.** A intenção — não deixar a
  linha de leitura crescer sem limite — continua certa, mas a conclusão era grande demais: as 19
  telas travavam em 672px e **não existia uma única utilidade `lg:` no código**. Acima de 768px o
  produto não mudava, então um monitor de 27" recebia a coluna do celular com o resto vazio, e a
  apresentação comercial acontece justamente numa tela grande.
- **Três larguras por trabalho** (`PAGE_FORM`, `PAGE_LIST`, `PAGE_WORK`) em
  `src/components/layout/page.ts`, no mesmo espírito de `field.ts` e `button-classes.ts`: nenhuma
  tela escreve `max-w-*` própria. Formulário continua sem esticar — isso não mudou.
- **Quatro telas ganharam segunda coluna**, e em todas ela responde a uma pergunta que a coluna
  principal não responde: Pendências fixa ao lado da fila no Início; Resumo com o perfil exigido ao
  lado do formulário de novo atendimento; avaliação e conversa ao lado do registro; histórico ao
  lado da credencial no perfil do cuidador.
- **O resumo do novo atendimento é a mudança que mais vale na apresentação.** O perfil exigido pela
  regra de formação mudava dentro do fluxo do formulário e saía do enquadramento; agora ele fica
  fixo ao lado enquanto as atividades são marcadas — a regra agindo à vista de quem assiste.
- **Formulário não foi partido em duas colunas.** O que vai ao lado é conteúdo derivado. Partir os
  campos quebraria o caminho de preenchimento, que é linear de propósito.
- **A ordem do celular ficou intacta.** Onde o desktop precisa de outra ordem — Pendências à
  direita mas primeiro no telefone — a peça é colocada por `col-start`/`row-start`, e o documento
  continua escrito na ordem do celular.
- **Alvo de toque passou a ser por ponteiro, não por largura** (`pointer-fine:` no lugar de `md:`).
  Era um erro silencioso: tablet em paisagem e notebook com tela sensível passam de 768px, e
  recebiam alvo de 32–36px sendo dedo. Medido depois: 1440px com mouse → 25px de linha e 35px de
  chip; 390px **e 1024px** com toque → 44px nos dois.
- **`<Check>` nasceu** (`ui/Check.tsx`), unificando a caixa de marcação que estava copiada em três
  telas sempre como `size-4` numa linha de ~24px. Marcar tarefa concluída na casa do paciente é a
  interação mais repetida do cuidador no celular e estava com metade do alvo mínimo.
- **A estrela de avaliação virou alvo de verdade** (era o menor da aplicação: 16px, sem `className`
  nenhum) e ganhou semântica de `radiogroup`; em leitura, a nota agora também sai em texto para
  leitor de tela.
- **A tabela do relatório cabe inteira a partir de `lg`** e, onde ainda rola, virou região
  alcançável por teclado — quem navega por teclado não chegava às colunas de horas e valor.
- **Verificação:** 16 rotas × 5 larguras (320, 390, 820, 1180, 1728) — **nenhum estouro
  horizontal**; contraste computado sobre o DOM renderizado — **0 falhas**; a coluna fixa do Início
  confirmada grudando em 24px e permanecendo através da rolagem.

### Revisão 7 — de volta ao verde da marca, e o degrau de texto virou token (agosto/2026)

Duas mudanças, e a segunda é a que muda mais tela.

- **A paleta voltou para o verde da marca.** O produto inteiro estava montado sobre o azul de
  `docs/Logo/Logo 4.png`. O arquivo corrente da marca é `public/logo-mark.png`, e ele é
  verde petróleo + sálvia — que é, palavra por palavra, o que o `CLAUDE.md` §5–6 sempre pediu
  ("verde sálvia ou verde petróleo suave"). O azul era a divergência, não o contrário.
  `--brand`/`--accent` foi de `#0050E0` para `#025658`, `--accent-soft` para `#E2EDE9`, e toda a
  escala neutra saiu do azul-marinho para o verde-grafite do `CLAUDE.md` (`#202321` / `#F7F7F5`).
  Os dois valores da marca foram amostrados pixel a pixel do arquivo, como sempre.
- **`--brand-mid` e `--brand-pale` morreram.** A arte nova tem duas tintas, não três. No lugar
  entrou `--brand-sage` (a sálvia, que só preenche forma) e `--brand-sage-ink` (a sálvia
  rebaixada, que é quem pode virar letra).
- **A marca voltou a aparecer.** `Logo.tsx` apontava para `public/logo.png`, que não existe mais
  no diretório: como o dev server de SPA devolve `index.html` com **200** para caminho não
  encontrado, o navegador recebia HTML no lugar de PNG e desenhava imagem quebrada — sem 404 na
  aba de rede, o que é exatamente por que ninguém viu. O mesmo valia para os três favicons.
  Agora tudo aponta para os arquivos que existem, e o `apple-touch-icon` foi regerado a partir do
  símbolo (é o único que leva fundo branco: o iOS pinta preto atrás de transparência).
- **O degrau de texto deixou de ser opacidade.** `text-ink/45`, `/50`, `/60` em 154 lugares
  rendiam de 2,4:1 a 4,1:1 — todo o texto secundário e terciário do produto abaixo da WCAG AA,
  incluindo os carimbos do registro de atividade (a prova de R12), a frase que explica a regra de
  formação e o "Sem média pública" que demonstra R10. Entraram `--ink-muted` e `--ink-subtle`,
  medidos contra a **pior** superfície do produto e não contra branco.
- **`--linha-strong` nasceu.** A borda de campo estava em `--linha`, 1,27:1. Num campo vazio a
  borda é a única coisa que diz onde o campo começa, e a WCAG 1.4.11 cobra 3:1. O diagnóstico
  antigo já estava certo — a borda sumia no celular sob sol — mas a resposta tinha sido engrossar
  para 1,5px, que é o eixo errado. Os 1,5px ficam, agora sobre uma linha que se enxerga.
- **`--rating` escureceu** de `#D9A036` (2,3:1) para `#B4801E` (3,5:1). Estrela cheia é
  informação, então responde pelos 3:1 da 1.4.11.
- **O botão `secondary` virou tonal.** Era `bg-ink` quase preto, que funcionava enquanto a ação
  primária era azul; com a primária virando petróleo escuro, "Fazer check-in" e "Fazer check-out"
  passaram a ser dois retângulos escuros sem hierarquia entre si.
- **Verificação:** varredura de contraste computado sobre o DOM renderizado, nas 15 rotas do
  produto, resolvendo o fundo real de cada nó de texto — **0 falhas**. Antes desta revisão, os
  mesmos degraus falhavam por construção em 154 pontos de chamada.

### Revisão 6 — as pendências da revisão 5, implementadas (agosto/2026)

A revisão 5 documentou; esta implementou. O que mudou no produto:

**Acessibilidade**

- **`<Modal>` virou um diálogo de verdade:** `role="dialog"`, `aria-modal`, `aria-labelledby`,
  foco que entra ao abrir e **volta para quem abriu** ao fechar, foco preso enquanto aberto, Esc,
  e trava de rolagem do fundo com compensação da barra de rolagem. Era a maior dívida aberta.
- **`prefers-reduced-motion` passou a ser respeitado**, com os ganchos `data-movimento="afunda"` e
  `data-movimento="sobe"`. A regra zera durações mas **mantém a mudança de cor** — cor não desloca
  nada — e mantém o giro do botão carregando, porque giro congelado é pior que nenhum.
- **Alvo de toque de 44px em tudo que se toca.** O ✕ do modal saiu de 26px para 44px por margem
  negativa, sem engordar o ícone. `<Button size="sm">` e `<Chip>` ganharam `min-h-11` no celular e
  voltam a encolher a partir de `md`.
- **Toda mudança passou a ser anunciada:** `role="status"` no carregamento, `role="alert"` no erro,
  `aria-invalid`/`aria-describedby` no campo inválido.

**Mobile**

- **`viewport-fit=cover`** na meta viewport. Sem essa linha, `env(safe-area-inset-*)` valia zero no
  iOS e a barra de abas ficava sob o indicador de início — o padding já estava lá, inerte.
- **Modal virou bottom sheet em celular**, com alça, arraste para fechar (25% da altura) e safe
  area. Uma implementação, duas formas: não há `<BottomSheet>` separado para lembrar de usar.
- **`vh` → `dvh`** nos treze casos.

**Componentes novos**

- **`<TelaCarregando>`** substituiu `"Carregando…"` copiado em **17 arquivos**, com atraso de 300ms
  (espera curta não pisca) e altura reservada desde o primeiro quadro.
- **`<Skeleton>` / `<SkeletonCard>` / `<SkeletonLista>`**, com pulsação por opacidade e sem
  shimmer.
- **`<Toast>`** + `useToast()`, montado acima do roteador para sobreviver à navegação. Ligado em
  publicar atendimento, salvar rascunho, aprovar e recusar cadastro.
- **`<Aviso>`** para erro/sucesso/informação no fluxo da tela, com o `role` correto e o fundo
  `-soft` que o token já oferecia e ninguém usava.
- **`<ButtonLink>`**, que encerrou a string da variante `primary` copiada em três telas. As classes
  saíram para `button-classes.ts`, fonte única das duas formas.
- **`<Chip>`**, que encerrou **oito cópias** da fila de filtros. As oito usavam `duration-200`, que
  a seção 6 reserva para mudança de tamanho — chip só muda de cor, e cor anda em 150ms.
- **`RolagemAoTopo`**, a garantia que substitui a transição entre telas.

**Correções encontradas no caminho**

- O `<Stepper>` declarava `transition-colors`, mas o que muda nele é `width`/`height` — a animação
  de 200ms documentada **não estava acontecendo**. Agora transiciona as propriedades certas.
- `prop error` em `<Input>`, `<Select>` e `<Textarea>`, e `prop loading` no `<Button>`.

### Revisão 5 — mobile first e o que faltava documentar (agosto/2026)

Auditoria da implementação contra esta página. O que mudou no documento:

- **A página passou a ter formato fixo por componente** (objetivo · onde · estrutura · variações ·
  estados · espaçamento · mobile · movimento · exemplo · restrições) e **marcadores de situação**
  ✅ 🟡 🔴, para que a documentação nunca descreva como pronto o que ainda não existe.
- **Seção 6 (Movimento) nasceu.** As durações, a curva e as sete microinterações do produto
  existiam no código sem estar escritas em lugar nenhum — cada nova tela reinventava o valor. Ficou
  registrado também que **não há transição entre telas, e por quê**.
- **Seção 8 (Estados de tela) nasceu.** Carregando, vazio, erro e sucesso viraram contrato. A
  auditoria achou a mesma string de "Carregando…" copiada em **17 arquivos**, nenhum estado de
  sucesso no produto inteiro e nenhum anúncio para leitor de tela.
- **Seção 9 (Padrões compostos) nasceu**, com o **histórico de atividades** documentado: lista com
  divisor e não pilha de cards, carimbo em `font-mono`, mais recente primeiro, sem ícone e sem cor
  por tipo de evento.
- **Seção 11 (Mobile first) nasceu**, reunindo breakpoints, alvo de toque, safe area, `dvh` e as
  oito regras de conteúdo em tela pequena.
- **O alvo de toque subiu de 40px para 44px.** 40px era otimismo; 44px é o piso que um polegar
  acerta com confiabilidade. A mudança expôs quatro elementos abaixo do piso — todos na seção 15.
- **Modal em celular passou a ser bottom sheet por regra**, com a especificação completa escrita
  antes da implementação, conforme a regra desta página.
- **Seção 15 (Pendências abertas) nasceu**, com o que a auditoria encontrou de divergência entre
  esta página e o código.

### Revisão 4 — Logo 4, com contorno (agosto/2026)

- **A marca ganhou contorno escuro em cada forma.** Isso encerra o problema que vinha desde a
  Logo 3: os três elos azul-gelo agora têm borda própria e a marca se lê inteira sobre qualquer
  superfície do produto. Verificado de 170px a 16px, em fundo claro e em aba escura.
- **Consequência: o ladrilho azul saiu também dos favicons**, que passaram a ser o símbolo em
  PNG transparente. Só o `apple-touch-icon` mantém fundo, e branco, porque o iOS pinta preto
  atrás de transparência na tela de início. Não há mais nenhum fundo azul atrás da marca.
- **Azuis reamostrados da Logo 4:** `--accent`/`--brand` foi de `#0046BF` para `#0050E0`,
  `--brand-mid` para `#017BFA` e `--accent-soft`/`--brand-pale` para `#DDEDFC`. O azul da arte é
  mais vivo que o da Logo 3, e um botão em tom mais apagado ao lado do símbolo denunciava a
  diferença. Contraste de `--accent` sobre branco: 6,4:1.

### Revisão 3 — cromo cinza, marca sem fundo (agosto/2026)

- **O ladrilho azul atrás do símbolo caiu.** Foi apresentada a medição (três elos em ~1,1:1 de
  contraste sobre fundo claro) e as alternativas; o cliente escolheu o símbolo sem fundo nenhum,
  aceitando a perda dos elos claros. A revisão 4 tornou o custo desnecessário.
- **Barra lateral e demais cromos de navegação passaram de branco para `--surface-nav` (`#F0F2F5`)**,
  um cinza neutro sem azul. Como consequência, o `hover` do item de nav inativo virou branco e a
  pastilha da entidade ganhou borda — as duas coisas sumiriam num cinza sobre cinza.
- **O nome do produto foi para baixo do símbolo e para caixa normal:** "Acalento Gestão", com
  "Gestão" em `--accent`. A caixa alta anterior imitava o wordmark do arquivo verde, que não é
  mais a marca.
- **`--shadow-brand` removido**, já que existia só para o ladrilho.

### Revisão 2 — marca azul (agosto/2026)

O cliente trocou a marca: saiu o símbolo verde-petróleo, entrou o azul de `Logo 3.png`. O produto
inteiro foi repintado a partir dele.

- **Accent teal `#04585A` → azul `#0046BF`**, amostrado do núcleo do símbolo. Toda a escala neutra
  foi para azul-marinho/azul-gelo junto, e `--accent-soft` passou a ser exatamente `#E7F3FC`, a
  cor dos elos claros da arte.
- **Ladrilho da marca.** A descoberta que definiu a solução: 27% dos pixels opacos do arquivo são
  azul-gelo, então sobre branco o símbolo perde três dos cinco elos. O ladrilho não é decoração —
  é o que torna a marca legível na interface. Ver seção 1.
- **SVG aposentado.** Na revisão 1 a marca antiga tinha sido redesenhada em vetor. Agora o produto
  usa o PNG oficial direto, e os favicons são rasterizados a partir dele com o ladrilho embutido.
- **Work Sans → Inter.** A Work Sans é uma grotesca de origem editorial: boa em texto corrido, mas
  com x-height baixa a 12–14px, que é onde este produto vive. A Inter foi desenhada para interface
  nessa faixa e é a preferência nº 1 do `CLAUDE.md` §6. Dígitos tabulares ligados por padrão.
- **Categorias reancoradas no azul.** Informal foi para verde-azulado, Técnico para azul clínico,
  Superior para o azul da marca.
- **O semáforo não mudou:** âmbar pendente, verde confirmado, vermelho cancelado.

### Revisão 1 — ambiente frio, crachás de tinta (agosto/2026)

- **Crachá deixou de ser pastilha saturada com texto branco.** Ganho duplo: legibilidade (o par
  antigo âmbar/branco ficava em ~2,2:1) e sossego visual numa lista de quinze plantões.
- **Verde passou a significar "confirmado"** (pedido do produto). "Concluído" e "avaliado" foram
  para ardósia — o que terminou é histórico e não precisa mais chamar atenção. "Aprovado" na fila
  do quadro usa o mesmo verde de confirmado, porque é a mesma notícia boa.
- **Estrela de avaliação virou ouro (`--rating`)**, não a cor da marca — estrela na cor de ação lê
  como botão.
- **Raio e sombra viraram token.** Havia 37 ocorrências de `rounded-[10px]`/`[12px]`/`[14px]`
  espalhadas; agora são `rounded-control` / `rounded-card` / `rounded-panel`.
- **Moldura de campo virou fonte única** (`field.ts`) e **classes de navegação viraram fonte única**
  (`layout/nav.ts`). Os dois casos já tinham divergido silenciosamente entre call sites.
- **Foco virou regra global** em `:focus-visible`, em vez de classe repetida em alguns lugares e
  esquecida em outros.

---

## 15. Pendências abertas

**Todas as pendências da revisão 5 foram fechadas na revisão 6.** O que sobra é o que a
implementação deixou pronto mas ainda sem uso, e um ponto de projeto em aberto.

### Componentes prontos, ainda sem call site

Não são dívida — são a resposta pronta para quando a situação aparecer. **Não crie um substituto:**
use estes.

| O quê | Quando usar | Onde vive |
|---|---|---|
| `<SkeletonLista>` | Quando uma lista carregar sozinha dentro de uma página já renderizada. Hoje a demo carrega todo o estado de uma vez, então esse caso não existe. | `ui/Skeleton.tsx` |
| `<Button loading>` | Ação que demora o suficiente para o botão precisar dizer que está trabalhando. | `ui/Button.tsx` |
| `error` em `<Input>` / `<Select>` / `<Textarea>` | Validação por campo. Hoje os três formulários validam no nível do formulário, com `<Aviso>`. | `ui/field.ts` |
| `<Aviso tom="info">` | Observação no fluxo que não é erro nem confirmação. | `ui/Aviso.tsx` |

### Decisões de projeto em aberto

**Margem lateral no celular.** Esta página já dizia `px-5` no celular e `px-6` no desktop, mas
**as 19 telas usam `px-6` em ambos** — a documentação foi corrigida para descrever o código. Se a
intenção era a margem menor no celular (24px é folgado a 390px), a mudança é no código, e vale a
pena medir antes: `px-5` devolve 8px de largura útil ao card, o que em nome de paciente truncado
faz diferença.

**Dois vermelhos vizinhos.** `status-cancelado` (`#A53F34`) e `status-bloqueado` (`#7A2B23`) são
próximos de propósito — são estados vizinhos — mas se um dia aparecerem lado a lado na mesma
lista, o bloqueado precisa ganhar um ícone de cadeado além do tom.

**Link de ação no cabeçalho de `<Painel>`.** A revisão 17 levou o "Ver todos" do `<Secao>` a 44px
de alvo com `SECAO_LINK_CLASS` + `-my-2.5` no contêiner. O "Ver tudo" do Início do cuidador vive
num `<Painel actions>`, cujo cabeçalho tem preenchimento próprio e também recebe `<Button size="sm">`
em outras telas — a mesma margem negativa ali puxaria os botões para fora da faixa. A correção
certa é dar ao `<Painel>` o mesmo tratamento condicional que a `<Secao>` recebeu, medindo antes o
efeito nos call sites que passam botão. Enquanto isso, aquele link continua com ~18px de altura
clicável no celular.

**Toast e ações fora do fluxo confirmado.** O `<Toast>` está ligado em quatro ações (publicar,
salvar rascunho, aprovar, recusar). Convite enviado, check-in e check-out **não** usam aviso
flutuante, e isso é decisão: nos três a confirmação já está no lugar — o botão vira "Convidado ✓",
o stepper avança. Se uma dessas telas mudar e a confirmação sair do campo de visão, o aviso passa
a ser necessário.

### Avisos de lint conhecidos

**Nenhum.** `npm run lint` sai limpo, sem erro e sem aviso.

Os dois avisos de fast refresh que moravam aqui foram corrigidos na revisão 11, do jeito que esta
página já prescrevia: cada contexto ganhou módulo próprio (`app/app-state-context.ts` e
`app/session-context.ts`), como `ui/toast-context.ts` já fazia. O protótipo antigo da raiz
(`app_acalento_homecare.jsx`) saiu do alcance do lint por `ignorePatterns` — ele mantinha o portão
permanentemente vermelho por três erros num arquivo que está fora do build, o que treinava a
equipe a ignorar o resultado.
