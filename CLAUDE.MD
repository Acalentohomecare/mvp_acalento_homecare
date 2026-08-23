CLAUDE.md — Home Care Demo

1. Visão geral do projeto

Este repositório contém uma demo frontend da Plataforma de Conexão em Home Care.

A aplicação existe exclusivamente para:

apresentações comerciais;

demonstrações para empresas de Home Care;

validação inicial da proposta do produto;

reuniões com potenciais clientes e investidores;

validação visual e de UX dos fluxos antes do desenvolvimento do produto real.

Este projeto NÃO é o MVP de produção.

O documento MVP_Home_Care.docx é a principal fonte dos requisitos de produto e dos fluxos de negócio.

A demo deve parecer um produto real e funcional, mas toda a operação é simulada localmente.

2. Regra mais importante

Este é um projeto SOMENTE FRONTEND.

Não criar ou introduzir:

backend;

banco de dados;

API própria;

ORM;

Supabase;

Firebase;

AWS;

Redis;

RabbitMQ;

Kafka;

Kubernetes;

Docker como requisito de execução;

autenticação externa;

serviços cloud obrigatórios;

secrets;

API keys;

integrações externas necessárias para funcionamento.

O projeto precisa funcionar localmente com:

npm install
npm run dev

Se uma funcionalidade puder ser simulada no frontend, simule. Não crie infraestrutura real.

3. Objetivo técnico

A demo deve ter uma implementação simples, modular e fácil de substituir posteriormente por um backend real.

Queremos:

código claro;

TypeScript consistente;

componentes reutilizáveis;

regras de negócio simuladas centralizadas;

mocks organizados;

navegação completa;

persistência opcional em localStorage;

possibilidade futura de trocar MockService por ApiService sem reescrever as telas.

Não queremos overengineering.

4. Stack preferencial

Utilizar preferencialmente:

React;

TypeScript;

Vite;

Tailwind CSS;

Lucide para ícones, quando necessário.

Não adicionar outra tecnologia importante sem necessidade real.

Quando uma biblioteca nova for considerada, pergunte primeiro:

Qual problema concreto da demo essa biblioteca resolve?

Se não houver uma vantagem clara, prefira uma solução simples com a stack existente.

5. Direção visual obrigatória

A interface deve seguir o conceito:

Healthcare Premium + Human SaaS

A aplicação deve transmitir:

confiança;

cuidado;

organização;

profissionalismo;

proximidade;

segurança;

tecnologia discreta.

A interface NÃO deve parecer um template genérico de SaaS ou uma aplicação gerada automaticamente por IA.

Evitar completamente

roxo tecnológico genérico;

gradientes roxo/azul;

neon;

fundos abstratos;

glassmorphism exagerado;

sombras pesadas;

excesso de cards;

bordas grossas;

rounded-3xl em elementos pequenos;

dashboards cheios de caixas iguais;

gráficos sem função;

excesso de ícones;

emojis como elementos principais;

ilustrações decorativas sem propósito;

textos artificiais ou excessivamente promocionais.

Direção estética

Usar a mesma disciplina visual encontrada em produtos como Linear, Vercel e Apple — especialmente em hierarquia, espaçamento e consistência — sem copiar visualmente essas marcas.

A identidade deve ser própria do Home Care.

6. Design System

Antes de construir muitas telas, estabelecer um pequeno design system consistente.

Definir e reutilizar:

tipografia;

cores;

spacing;

radius;

borders;

botões;

inputs;

selects;

badges;

tabelas;

modais;

toasts;

navegação;

estados;

componentes de formulário.

Paleta base

Background principal:

#F7F7F5

Surface:

#FFFFFF

Texto principal:

#202321

Texto secundário:

#6B716D

Accent:

verde sálvia ou verde petróleo suave;

usar com moderação;

apenas uma cor principal de destaque.

Estados:

sucesso: verde natural;

alerta: âmbar discreto;

erro: vermelho queimado;

informação: accent ou neutro.

Tipografia

Preferência:

Inter;

Geist;

Plus Jakarta Sans;

system-ui.

Usar uma única família principal.

Títulos:

peso 500–600;

letter-spacing levemente negativo quando apropriado.

Texto:

peso 400.

Destaques:

peso 500–600.

Espaçamento

Priorizar whitespace generoso.

Não preencher a tela sem necessidade.

7. UX e comportamento visual

Cada tela deve ter uma ação principal claramente identificável.

Adicionar estados:

hover;

focus;

active;

disabled;

loading;

success;

error;

empty.

Transições devem ser suaves e discretas.

Preferência:

transition-all duration-200 ease-out

Não usar animações chamativas apenas para criar efeito visual.

8. Responsividade

A aplicação é mobile first.

Entretanto, a demo precisa ser muito boa em desktop porque será utilizada em apresentações.

Considerar sempre:

mobile;

tablet;

desktop;

notebook.

Não sacrificar a experiência mobile para conseguir uma interface desktop bonita.

9. Perfis do sistema

A demo representa três perfis:

Empresa

Responsável pela operação da Home Care.

Pode:

visualizar dashboard;

cadastrar pacientes;

cadastrar/gerenciar cuidadores;

visualizar cuidadores;

conferir documentos e aprovar/recusar cadastros de cuidadores no seu quadro;

bloquear/reativar cuidadores do seu quadro;

publicar atendimentos;

encontrar cuidadores compatíveis;

enviar convites;

visualizar candidaturas;

confirmar atendimento;

acompanhar agenda;

acompanhar check-in/check-out;

visualizar registros;

avaliar cuidadores;

visualizar relatórios;

conversar com cuidadores.

Cuidador informal

Pode:

visualizar dashboard;

editar perfil;

receber convites;

aceitar/recusar;

visualizar agenda;

iniciar atendimento;

realizar check-in/check-out simulado;

registrar atendimento;

visualizar histórico;

avaliar a empresa.

Cuidador profissional

Possui as capacidades do cuidador e também:

categoria profissional;

registro profissional;

especialidade;

status de aprovação em cada empresa.

Não existe perfil de Administrador de plataforma.

A conferência de documentos, a aprovação, a recusa e o bloqueio de cuidadores são
responsabilidade da Empresa — é ela que controla quem pode assumir os seus plantões. O status de
aprovação é por empresa (quadro próprio): o mesmo cuidador pode estar aprovado em uma e em
análise em outra.

10. Login da demo

A autenticação é totalmente simulada.

Contas iniciais:

Empresa
empresa@demo.com
123456

Cuidador
cuidador@demo.com
123456

Ao efetuar login:

identificar o perfil;

criar o estado de sessão local;

redirecionar para o dashboard correto.

Não implementar autenticação real.

11. Navegação

Empresa

Início;

Atendimentos;

Agenda;

Pacientes;

Cuidadores;

Mensagens;

Relatórios;

Notificações;

Configurações.

Cuidador

Início;

Convites;

Agenda;

Atendimentos;

Mensagens;

Avaliações;

Perfil;

Notificações.

A tela de Cuidadores da Empresa reúne o quadro aprovado, a fila de cadastros em análise e os
inativos (recusados/bloqueados) — é onde a empresa aprova quem vai assumir os plantões.

Desktop: sidebar limpa.

Mobile: navegação adaptada e simples.

12. Arquitetura frontend

Organizar o projeto de forma modular, mas simples.

Estrutura preferencial:

src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── pages/
├── layouts/
├── features/
│   ├── auth/
│   ├── companies/
│   ├── caregivers/
│   ├── patients/
│   ├── attendances/
│   ├── schedules/
│   ├── evaluations/
│   ├── notifications/
│   └── messages/
├── mocks/
├── services/
├── hooks/
├── types/
├── utils/
├── constants/
└── assets/

A estrutura pode ser adaptada conforme o crescimento real do projeto.

Não criar abstrações apenas para parecer arquiteturalmente sofisticado.

13. Mocks

Todos os dados de negócio devem estar em uma camada explicitamente mockada.

Estrutura preferencial:

src/mocks/
├── users.ts
├── companies.ts
├── caregivers.ts
├── patients.ts
├── attendances.ts
├── applications.ts
├── invitations.ts
├── evaluations.ts
├── notifications.ts
├── messages.ts
├── caregiver-links.ts
└── dashboard.ts

Os dados devem parecer reais, mas ser completamente fictícios.

Criar dados suficientes para uma apresentação convincente.

Base inicial mínima:

2 empresas;

10 cuidadores;

vínculos de quadro (empresa ↔ cuidador) cobrindo aprovado, em análise, recusado e bloqueado;

8 pacientes;

15 atendimentos;

10+ avaliações;

10+ notificações;

mensagens simuladas.

Incluir diferentes categorias, status e situações.

14. Serviços mockados

Criar serviços para separar UI de armazenamento.

Exemplo:

interface PatientService {
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient>;
  createPatient(patient: Patient): Promise<Patient>;
  updatePatient(id: string, data: Partial<Patient>): Promise<Patient>;
}

Implementação atual:

MockPatientService

Futuro, quando o projeto real existir:

ApiPatientService

As telas não devem saber se os dados vêm de mock ou API.

15. Persistência local

Não existe banco.

É permitido utilizar localStorage para:

sessão simulada;

usuários criados;

pacientes criados;

cuidadores criados;

atendimentos;

convites;

mensagens;

avaliações;

estados da demo.

Criar uma camada simples para isso.

Não tratar localStorage como banco de produção.

16. Reset da demo

Adicionar em Configurações uma ação:

Restaurar dados da demonstração

Antes de executar, pedir confirmação.

Depois:

limpar alterações;

restaurar mocks iniciais;

manter o ambiente pronto para uma nova apresentação.

17. Domínio e tipos

Criar tipos para, no mínimo:

User
Company
Caregiver
Patient
Attendance
Application
Invitation
Evaluation
Notification
Message
Document
Schedule
CaregiverLink

Criar enums/unions para:

UserRole
CaregiverCategory
ApprovalStatus
AttendanceStatus
InvitationStatus
ApplicationStatus

18. Regras de negócio simuladas

As regras devem ficar centralizadas em funções/serviços de domínio, não espalhadas por componentes.

Obrigatórias:

Cuidador não aprovado não aparece em buscas.

Atendimento que exige formação não mostra cuidador informal.

Profissional especializado só aparece quando compatível.

Cuidador não pode aceitar dois atendimentos sobrepostos.

Endereço completo só é exibido após confirmação.

Check-out só é permitido depois do check-in.

Atendimento concluído não pode ser editado.

Cancelamento altera o histórico.

Avaliação só pode acontecer após conclusão.

A média pública só aparece após três avaliações.

Empresa só enxerga seus próprios dados.

Cada empresa aprova o próprio quadro: cuidador só aparece na busca, recebe convite ou se candidata
em empresa que já aprovou o cadastro dele.

Cuidador sem nenhuma aprovação não acessa as telas internas — fica na tela de cadastro em análise.

19. Fluxo principal de apresentação

O fluxo principal precisa funcionar de ponta a ponta:

Login Empresa
↓
Dashboard
↓
Selecionar/Cadastrar Paciente
↓
Novo Atendimento
↓
Selecionar Atividades
↓
Sistema determina perfil necessário
↓
Cuidadores Compatíveis
↓
Visualizar Perfil
↓
Enviar Convite
↓
Logout
↓
Login Cuidador
↓
Convite
↓
Aceitar
↓
Agenda
↓
Detalhe do Atendimento
↓
Check-in
↓
Registro
↓
Check-out
↓
Logout
↓
Login Empresa
↓
Avaliação
↓
Relatório

Fluxo de aprovação do quadro (feito pela própria Empresa):

Login Empresa
↓
Cuidadores → Em análise
↓
Visualizar cuidador
↓
Aprovar para o quadro
↓
Cuidador passa a aparecer na busca e pode ser convidado para os plantões

20. Funcionalidades da demo

Dashboard empresa

Foco operacional.

Mostrar:

atendimentos hoje;

atendimentos em aberto;

cuidadores ativos;

pacientes;

horas realizadas;

alertas;

check-ins pendentes;

cadastros de cuidadores aguardando aprovação da empresa;

próximos atendimentos;

atividade recente.

Não transformar tudo em cards.

Dashboard cuidador

Mostrar:

próximo atendimento;

convites pendentes;

agenda;

horas realizadas;

avaliação;

próximos compromissos.

21. Pacientes

A demo permite à empresa:

listar pacientes;

pesquisar;

filtrar;

visualizar paciente;

criar paciente;

editar paciente;

visualizar histórico.

Campos possíveis:

nome;

idade;

data de nascimento;

responsável;

cidade;

bairro;

endereço;

observações;

mobilidade;

uso de oxigênio;

uso de sonda;

animais na residência.

Usar dados fictícios.

22. Cuidadores

A empresa deve conseguir:

pesquisar;

filtrar;

visualizar perfil;

convidar.

Filtros:

categoria;

especialidade;

bairro;

turno;

valor;

avaliação;

disponibilidade.

Mostrar:

avatar;

nome;

categoria;

experiência;

avaliação;

região;

disponibilidade;

especialidade;

selo de verificado.

23. Novo atendimento

A criação de atendimento deve ser uma das experiências centrais da demo.

Campos:

tipo;

paciente;

endereço;

data;

horário;

duração;

repetição;

atividades;

informações relevantes do paciente;

valor oferecido.

Tipos:

plantão de 12 horas;

plantão de 24 horas;

período de horas;

sessão avulsa.

Atividades podem incluir:

higiene;

banho;

alimentação;

mobilidade;

companhia;

sinais vitais;

curativo;

fisioterapia;

acompanhamento.

24. Regra de formação

A seleção de atividades deve alterar os cuidadores elegíveis.

Exemplos:

Higiene + alimentação + companhia
→ cuidador informal permitido

Atividade de enfermagem
→ profissional de enfermagem

Fisioterapia
→ fisioterapeuta

A interface deve mostrar claramente o perfil profissional necessário.

25. Matching

Depois de criar um atendimento, mostrar cuidadores compatíveis.

Ordenação sugerida:

compatibilidade;

disponibilidade;

região;

avaliação.

Cada resultado deve permitir:

visualizar perfil;

convidar.

26. Convites e candidaturas

A empresa deve poder:

enviar convite;

visualizar status;

acompanhar candidaturas;

confirmar um cuidador.

O cuidador deve poder:

visualizar convite;

aceitar;

recusar.

Quando o atendimento for confirmado:

status deve mudar;

atendimento entra na agenda;

endereço completo fica disponível;

demais candidatos podem ser informados.

27. Agenda

Empresa:

visão diária;

semanal;

lista;

status;

cuidador;

paciente.

Cuidador:

próximos atendimentos;

horários;

pacientes;

status.

28. Atendimento, check-in e check-out

Detalhe do atendimento deve mostrar:

paciente;

cuidador;

horário;

duração;

endereço;

atividades;

valor;

status;

observações;

check-in;

check-out.

Check-in é simulado.

Mostrar horário e “localização registrada”, sem usar GPS real.

Check-out depende do check-in.

Depois do check-out, o atendimento entra em estado encerrado.

29. Registro do atendimento

Permitir simular:

tarefas concluídas;

observações;

sinais vitais;

fotos fictícias.

Depois do check-out, o registro deve ser visualmente tratado como encerrado.

30. Avaliações

Após um atendimento concluído:

Empresa pode avaliar cuidador.

Cuidador pode avaliar empresa.

Permitir:

nota de 1 a 5;

comentário.

A média pública só aparece após a terceira avaliação.

31. Mensagens

A conversa é simulada e vinculada ao atendimento.

Permitir:

visualizar mensagens;

enviar mensagem;

persistir localmente.

Não utilizar WebSocket ou serviço real.

32. Notificações

Criar centro interno de notificações.

Tipos:

convite;

confirmação;

lembrete;

cancelamento;

check-in pendente;

nova mensagem.

Não implementar push real.

33. Relatórios

Criar relatório de horas com filtros por:

período;

cuidador;

paciente;

atendimento.

Mostrar:

horas previstas;

horas realizadas;

quantidade de atendimentos;

valor estimado.

Exportação pode gerar CSV local.

34. Quadro de cuidadores (aprovações da Empresa)

Não existe área administrativa de plataforma. O controle é da Empresa, dentro da tela de
Cuidadores, em três abas:

Meu quadro

listar;

pesquisar/filtrar;

visualizar perfil;

favoritar;

bloquear.

Em análise

fila de cadastros ainda não decididos;

visualizar perfil;

aprovar para o quadro;

recusar com motivo.

Inativos

recusados e bloqueados;

motivo da decisão;

reconsiderar.

Em Configurações da Empresa:

dados da empresa;

registro de atividade da empresa (R12);

restaurar dados da demonstração.

Toda decisão gera notificação para o cuidador e entrada no registro de atividade.

35. Dados e privacidade na demo

Todos os dados são fictícios.

Nunca inserir:

CPF real;

CNPJ real;

documentos reais;

dados reais de pacientes;

informações reais de saúde;

telefones reais de usuários.

A demo pode simular dados sensíveis visualmente, mas deve deixar claro no código e no README que os dados são fictícios.

36. Funcionalidades fora do escopo

Não implementar:

pagamentos;

contratos digitais;

prontuário clínico completo;

app da família;

teleatendimento;

integrações contábeis;

integrações com sistemas externos;

consulta automática de conselho profissional;

backend;

banco;

infraestrutura de produção.

Se algo futuro precisar aparecer para uma apresentação, pode ser mostrado apenas como elemento visual ou placeholder, sem infraestrutura real.

37. Regras de implementação

Antes de criar uma nova tecnologia, biblioteca ou arquitetura, validar se ela é necessária para a demo.

Priorizar simplicidade.

Não introduzir:

microfrontend;

CQRS;

event sourcing;

DDD excessivamente formal;

state management complexo sem necessidade;

múltiplos frameworks de UI;

múltiplas fontes de verdade.

A arquitetura deve resolver o problema atual, não problemas hipotéticos de escala.

38. Qualidade do código

Sempre:

usar TypeScript corretamente;

evitar any sem justificativa;

criar nomes claros;

evitar duplicação;

manter componentes pequenos;

separar UI de regras de negócio;

centralizar mocks;

centralizar constantes;

reutilizar componentes visuais;

tratar loading/error/empty states;

manter acessibilidade básica.

Não espalhar lógica de negócio em JSX quando ela puder estar em uma função de domínio/serviço.

39. Acessibilidade

Considerar:

contraste;

foco de teclado;

labels em inputs;

botões semanticamente corretos;

textos legíveis;

navegação clara.

Não sacrificar acessibilidade para estética.

40. Processo ao receber uma nova tarefa

Antes de implementar qualquer nova tarefa:

Entender o objetivo da tarefa.

Verificar o contexto atual do projeto.

Verificar se já existe componente, serviço ou tipo reutilizável.

Reutilizar antes de criar algo novo.

Verificar impacto nos fluxos existentes.

Implementar a solução mais simples que atende ao requisito.

Testar o fluxo alterado.

Verificar responsividade.

Verificar consistência visual.

Não modificar partes não relacionadas sem necessidade.

41. Regra para novas telas

Antes de criar uma tela, responder internamente:

quem usa esta tela?

qual problema ela resolve?

qual é a ação principal?

quais informações são realmente necessárias?

qual é o estado vazio?

qual é o estado de loading?

qual é o estado de erro?

como funciona em mobile?

como funciona em desktop?

Não criar telas apenas para completar menus.

42. Regra para novos componentes

Antes de criar um componente:

procurar um componente existente que possa ser reutilizado;

manter API simples;

evitar componentes excessivamente genéricos;

evitar duplicação;

respeitar o Design System.

43. Regra visual crítica

Se uma interface parecer um template genérico, parar e revisar.

Perguntas obrigatórias:

parece específico para Home Care?

a hierarquia visual está clara?

há espaço suficiente?

existem cards demais?

existem elementos decorativos sem função?

parece produzido por uma IA sem direção de design?

o produto possui personalidade?

A resposta desejada é uma interface:

profissional + humana + confiável + premium + moderna.

44. Cenário inicial de apresentação

Ao abrir a demo, deve existir dados suficientes para que a apresentação não comece com uma tela vazia.

O cenário padrão deve permitir navegar imediatamente por:

login;

dashboard;

paciente;

criação de atendimento;

matching;

convite;

confirmação;

agenda;

check-in;

registro;

check-out;

avaliação;

relatório.

45. README obrigatório

Manter README atualizado com:

objetivo da demo;

stack;

instalação;

contas de demonstração;

arquitetura frontend;

estrutura de diretórios;

mocks;

uso de localStorage;

reset da demo;

limitações.

Deixar explícito:

Esta aplicação é uma demo frontend. Não existe backend, banco de dados ou autenticação real.

46. Critério de pronto

Uma funcionalidade só deve ser considerada pronta quando:

funciona no fluxo esperado;

possui estado visual de sucesso/erro quando aplicável;

não quebra os fluxos existentes;

funciona em mobile;

funciona em desktop;

respeita o Design System;

usa mocks/serviços corretamente;

não cria dependência externa desnecessária.

47. Ordem de desenvolvimento preferencial

Bootstrap do projeto.

Design System.

Tipos de domínio.

Mocks.

Serviços mockados.

Estado/localStorage.

Autenticação simulada.

Layout e navegação.

Dashboard empresa.

Pacientes.

Cuidadores.

Novo atendimento.

Matching.

Convites/candidaturas.

Agenda.

Detalhe do atendimento.

Check-in.

Registro.

Check-out.

Avaliações.

Mensagens.

Notificações.

Relatórios.

Quadro de cuidadores (aprovações da Empresa).

Reset da demo.

Revisão visual.

Revisão responsiva.

Teste completo do fluxo de apresentação.

A ordem pode ser ajustada quando uma dependência real justificar a mudança.

48. Regra final

Não transforme esta demo em um MVP de produção.

Não adicione backend.

Não adicione banco.

Não adicione cloud.

Não adicione integrações reais.

Não adicione complexidade de arquitetura sem necessidade.

O objetivo deste repositório é:

DEMO VISUAL + UX + FLUXOS + MOCKS + APRESENTAÇÃO.

A aplicação deve parecer real para quem a utiliza, mas permanecer simples e claramente separada do futuro produto de produção.