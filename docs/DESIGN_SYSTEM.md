# DESIGN_SYSTEM.md — MVP Acalento Home Care

> Etapa 2 do `IMPLEMENTATION_PLAN.md`. Documenta as decisões de identidade visual antes de
> qualquer tela de conteúdo ser construída.

---

## 0. Ponto de partida (o que este produto realmente é)

Não é uma landing page. É uma ferramenta operacional para uma coordenadora de home care que
trabalha do celular, sob pressão de tempo, decidindo em segundos "quem vai cobrir esse plantão".
O elemento que mais aparece em toda a jornada não é uma métrica de marketing — é a **credencial do
cuidador**: categoria (informal / técnico / superior), selo de verificado, registro no conselho de
classe. É em cima disso que a plataforma se diferencia (regra R2/R3). O design precisa carregar
essa hierarquia de confiança em todo lugar, de forma legível em tela pequena.

Evitando os três clichês genéricos de IA: nada de fundo creme + accent terracota (é o próprio
accent do Claude), nada de fundo quase-preto + verde-ácido, nada de layout jornal com hairlines.

---

## 1. Paleta

| Token | Hex | Uso |
|---|---|---|
| `--ink` | `#16241F` | Texto principal, base de contraste (verde-carvão, não preto puro — evoca "plantão noturno" sem ser frio). |
| `--surface` | `#F5F6F2` | Fundo geral (branco-sálvia pálido, mais suave que branco puro; diferente do creme padrão de IA). |
| `--surface-raised` | `#FFFFFF` | Cards e superfícies elevadas sobre `--surface`. |
| `--accent` | `#E8A33D` | Ação primária, destaques (marigold/âmbar — calor humano, "luz do dia", usado com moderação). |
| `--accent-ink` | `#7A5419` | Texto sobre `--accent` quando necessário / variação escura do accent. |
| `--linha` | `#DCDFD6` | Bordas e divisores sutis. |

### Cores de categoria de cuidador (elemento central do produto)

| Categoria | Hex | Racional |
|---|---|---|
| Informal | `#6B8F71` (sálvia) | Tom orgânico/humano — cuidado do dia a dia. |
| Técnico | `#3E7CB1` (azul-aço) | Tom clínico/técnico — procedimento, precisão. |
| Superior | `#A6672B` (cobre) | Tom "mais alto nível" sem recorrer a roxo — remete a insígnia/bronze de credencial. |

### Cores de status do atendimento (paleta separada, usada com moderação — ver seção 4 sobre o
stepper, que reduz a dependência de cor pura para comunicar estado)

| Status | Hex |
|---|---|
| Aberto / em busca | `#E8A33D` |
| Confirmado / agendado | `#3E7CB1` |
| Em andamento | `#2A9D8F` |
| Concluído | `#6B8F71` |
| Cancelado | `#B24C3A` |

---

## 2. Tipografia

Três papéis, escolhidos para a natureza operacional do produto (não é uma página de marketing):

1. **Display — `Fraunces`** (serifada, peso 500–600): usada com moderação em títulos de seção e no
   lockup do nome do produto. Traz o "humano" sem foto de banco de imagens.
2. **UI/Corpo — `Work Sans`**: texto de interface, formulários, listas — legível em tela pequena,
   neutra o suficiente para não competir com os badges de categoria.
3. **Dados/Utilitária — `IBM Plex Mono`**: horários de check-in/check-out, CPF/CNPJ, valores,
   relatório de horas. Fonte monoespaçada para tudo que é registro/prova de tempo — é uma escolha
   ligada diretamente ao produto (fechamento de horas é a dor nº 1 do cliente, seção 2 do
   `MVP_Home_Care.docx`), não uma fonte utilitária genérica.

Escala: `display-lg` 28px/34, `display` 22px/28, `title` 18px/24, `body` 15px/22, `label` 13px/16,
`mono` 13px/20 (todos com peso ajustado por papel, não só tamanho).

---

## 3. Layout

- **Telas do app (01–17):** emolduradas em um "frame" de celular (chassi arredondado, notch,
  indicador de home) — a demo inteira acontece dentro dessa moldura para reforçar "mobile first"
  mesmo sendo um artifact web.
- **Área de administração:** layout desktop convencional (sidebar + conteúdo), já que o próprio
  documento a trata como "uso interno, computador".

```
Frame do app (mobile)              Área de administração (desktop)
┌─────────────────┐                ┌──┬──────────────────────────┐
│  ●               │  ← notch      │  │  Fila de aprovação        │
│ ┌───────────────┐ │                │N │  ┌──────────────────┐   │
│ │  conteúdo da   │ │                │a │  │ linha da tabela   │   │
│ │  tela atual    │ │                │v │  └──────────────────┘   │
│ │                │ │                │  │  ┌──────────────────┐   │
│ └───────────────┘ │                │  │  │ linha da tabela   │   │
│ [ tab bar inferior]│                │  │  └──────────────────┘   │
│      ▂▂▂▂          │  ← home ind.  └──┴──────────────────────────┘
└─────────────────┘
```

---

## 4. Elemento de assinatura: o "crachá"

O elemento único e recorrente da interface é um **badge no formato de crachá/credencial** —
um chip com um pequeno entalhe (notch) na borda esquerda, como se fosse um clipe de lanyard,
usado para:

- Categoria do cuidador (informal/técnico/superior) — cor conforme seção 1.
- Selo de verificado (ícone de check dentro do crachá).
- Registro no conselho de classe (COREN, CREFITO etc.), quando aplicável.

Em vez de depender só de cor para comunicar o status do atendimento (o que seria frágil para
daltonismo e ficaria genérico), o progresso do atendimento usa um **stepper horizontal com
rótulos de texto**, e a cor de status é só um reforço secundário, não a única informação.

---

## 5. Componentes base (Etapa 2 — entregável desta etapa)

Botão (primário/secundário/ghost/destrutivo), Input de texto, Card, Crachá (categoria/selo/
conselho), Stepper de status, Modal. Implementados e validados no artifact
`componentes_base_design_system`.

---

## 6. Autocrítica (antes de seguir para a Etapa 3)

- Risco assumido: o crachá com entalhe é o único elemento decorativo "ousado" — todo o resto
  (tipografia, espaçamento, cor) é discreto de propósito, para não competir com ele.
- O que foi cortado: eu havia cogitado usar gradientes nos cards de destaque do dashboard;
  removido — não serve ao brief e é o tipo de decoração que "cheira a IA genérica".
- Cor de status "Cancelado" (`#B24C3A`) é próxima da cor de categoria "Superior" (`#A6672B`) —
  mantive porque não aparecem juntas no mesmo componente (uma é badge de categoria de cuidador,
  outra é cor de fundo do stepper), mas é um ponto para observar durante a Etapa 20
  (Responsividade e Refinamento Visual).
