# mvp_acalento_homecare

Demo para apresentações comerciais e demonstrações para empresas de Home Care.

> Esta aplicação é uma **demo frontend**. Não existe backend, banco de dados ou autenticação real.
> Todos os dados são fictícios.

## O que é

Demonstração de uma plataforma de conexão em Home Care: empresas de home care ↔ cuidadores
informais e profissionais (técnico/superior). Toda a operação é simulada no navegador.

## Perfis

A demo tem **dois perfis**: **Empresa** e **Cuidador**. Não existe perfil de administrador de
plataforma — quem confere documentos e aprova o cuidador que vai assumir o plantão é a própria
empresa, no seu quadro (`src/services/roster.ts`).

O status de aprovação é **por empresa**: o mesmo cuidador pode estar aprovado em uma e em análise
em outra.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Lucide.

## Instalação

```bash
npm install
npm start        # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

## Contas de demonstração

| Perfil   | E-mail              | Senha  |
| -------- | ------------------- | ------ |
| Empresa  | `empresa@demo.com`  | 123456 |
| Cuidador | `cuidador@demo.com` | 123456 |

Contas extras de cuidador (`beatriz@`, `marcos@`, `juliana@`, `fernando@`, `debora@demo.com`) e
uma segunda empresa (`empresa2@demo.com`) existem para explorar categorias e quadros diferentes.

## Arquitetura frontend

```
src/
├── app/          — providers de estado e sessão, guarda de rotas
├── components/   — ui/ (design system), layout/, shared/
├── pages/        — telas por perfil (company/, caregiver/, shared/)
├── layouts/      — casca de navegação de cada perfil
├── services/     — regras de negócio simuladas (roster, matching, invitations, …)
├── mocks/        — dataset inicial da demonstração
├── types/        — domínio e enums
├── hooks/ utils/ constants/
```

As telas não sabem de onde vêm os dados: falam com os serviços, que hoje operam sobre um estado
em memória persistido no `localStorage` e amanhã podem virar uma `ApiService`.

## Mocks e persistência

O dataset inicial vive em `src/mocks/` (empresas, cuidadores, vínculos de quadro, pacientes,
atendimentos, convites, candidaturas, avaliações, notificações, mensagens, auditoria).

`src/services/storage.ts` é o **único** módulo que conhece o `localStorage`: guarda o estado da
demo (`acalento:app-state:v2`) e a sessão simulada. Não é banco de produção.

## Reset da demo

**Empresa → Configurações → Restaurar dados da demonstração.** Pede confirmação, apaga tudo o que
foi feito na apresentação, restaura o dataset inicial e desconecta.

## Limitações

Sem backend, banco, autenticação real, push, WebSocket, GPS, pagamentos ou integrações externas.
Upload de documentos, foto de perfil e localização de check-in são simulados.

## Origem

Baseado no documento de produto `MVP_Home_Care.docx` (Plataforma de Conexão em Home Care —
MVP v1.0). Ver `docs/IMPLEMENTATION_PLAN.md` para a análise completa e o log de decisões.

Os arquivos `app_acalento_homecare.jsx` e `componentes_base_design_system.jsx` na raiz são o
**protótipo original** em artifact single-file, mantidos apenas como referência histórica — não
fazem parte do build e não refletem o modelo atual.
