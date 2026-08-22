# mvp_acalento_homecare

Demo para apresentações comerciais e demonstrações para empresas de Home Care.

## O que é

MVP de demonstração de uma plataforma de conexão em Home Care (empresas de home care ↔
cuidadores informais e profissionais técnicos/superior), construído como um artifact React
single-file, sem backend real.

## Estrutura

```
mvp_acalento_homecare/
├── README.md
├── app_acalento_homecare.jsx          — app completo da demo (Etapas 3–19)
├── componentes_base_design_system.jsx — showcase dos componentes-base (Etapa 2)
└── docs/
    ├── IMPLEMENTATION_PLAN.md — plano oficial de execução (todas as etapas, regras, decisões)
    ├── DESIGN_SYSTEM.md       — paleta, tipografia, layout, elemento de assinatura
    └── DEMO_GUIDE.md          — roteiro de apresentação e checklist de validação (R1–R12)
```

## Como usar

Os arquivos `.jsx` são artifacts React de arquivo único, feitos para rodar no ambiente de
artifacts do Claude.ai (sem necessidade de build local — ver `docs/IMPLEMENTATION_PLAN.md`,
seção 2, para o porquê dessa decisão de arquitetura).

Para a demo completa, use `app_acalento_homecare.jsx` e siga o roteiro em `docs/DEMO_GUIDE.md`.

## Origem

Baseado no documento de produto `MVP_Home_Care.docx` (Plataforma de Conexão em Home Care —
MVP v1.0, agosto de 2026). Ver `docs/IMPLEMENTATION_PLAN.md` para a análise completa e o log
de decisões de cada revisão do plano.
