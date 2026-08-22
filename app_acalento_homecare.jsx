import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home, Calendar, MessageSquare, User, Check, X, ShieldCheck, Clock,
  Plus, ChevronLeft, Bell, MapPin, Star, FileText, LogOut, RefreshCw,
  Users, ClipboardList, AlertTriangle, Camera, Heart, Briefcase,
  Download, Send, Info
} from "lucide-react";

/* =========================================================================
   ACALENTO HOME CARE — MVP Demo
   Artifact React single-file (ver docs/IMPLEMENTATION_PLAN.md, seção 2).
   Persistência: window.storage. Reset disponível na área de administração.
========================================================================= */

/* -------------------------------------------------------------------- */
/* 1. TOKENS / ESTILO (ver docs/DESIGN_SYSTEM.md)                        */
/* -------------------------------------------------------------------- */

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .ac-root {
    --ink: #16241F; --surface: #F5F6F2; --surface-raised: #FFFFFF;
    --accent: #E8A33D; --accent-ink: #7A5419; --linha: #DCDFD6;
    --muted: #5B6960;
    --cat-informal: #6B8F71; --cat-tecnico: #3E7CB1; --cat-superior: #A6672B;
    --st-aberto: #E8A33D; --st-confirmado: #3E7CB1; --st-andamento: #2A9D8F;
    --st-concluido: #6B8F71; --st-cancelado: #B24C3A;
    background: var(--surface); color: var(--ink); font-family: 'Work Sans', sans-serif;
    height: 100%;
  }
  .ac-display { font-family: 'Fraunces', serif; font-weight: 600; }
  .ac-mono { font-family: 'IBM Plex Mono', monospace; }

  .ac-btn { font-family:'Work Sans',sans-serif; font-weight:600; font-size:13.5px; border-radius:10px; padding:9px 16px; border:none; cursor:pointer; transition:transform .08s; display:inline-flex; align-items:center; gap:6px; }
  .ac-btn:active { transform:scale(0.96); }
  .ac-btn:disabled { opacity:0.45; cursor:not-allowed; }
  .ac-btn-primary { background:var(--accent); color:var(--accent-ink); }
  .ac-btn-secondary { background:var(--ink); color:var(--surface); }
  .ac-btn-ghost { background:transparent; color:var(--ink); border:1.5px solid var(--linha); }
  .ac-btn-destructive { background:var(--st-cancelado); color:#fff; }
  .ac-btn-block { width:100%; justify-content:center; }
  .ac-btn-sm { padding:6px 10px; font-size:12px; }

  .ac-card { background:var(--surface-raised); border:1px solid var(--linha); border-radius:14px; padding:14px; }
  .ac-input, .ac-select, .ac-textarea { font-family:'Work Sans',sans-serif; font-size:13.5px; border:1.5px solid var(--linha); border-radius:10px; padding:9px 11px; width:100%; background:var(--surface-raised); color:var(--ink); outline:none; box-sizing:border-box; }
  .ac-input:focus, .ac-select:focus, .ac-textarea:focus { border-color:var(--accent); }
  .ac-label { font-size:11.5px; font-weight:600; color:var(--muted); margin-bottom:4px; display:block; }
  .ac-chip { display:inline-flex; align-items:center; gap:5px; font-size:12px; padding:5px 10px; border-radius:999px; border:1.5px solid var(--linha); cursor:pointer; user-select:none; }
  .ac-chip.on { background:var(--ink); color:var(--surface); border-color:var(--ink); }

  .ac-cracha { position:relative; display:inline-flex; align-items:center; gap:5px; padding:3px 9px 3px 14px; border-radius:999px; font-size:10.5px; font-weight:600; color:#fff; white-space:nowrap; }
  .ac-cracha::before { content:''; position:absolute; left:5px; top:50%; transform:translateY(-50%); width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.55); }

  .ac-stepper { display:flex; align-items:center; }
  .ac-step-dot { width:9px; height:9px; border-radius:50%; background:var(--linha); flex-shrink:0; }
  .ac-step-dot.active { background:var(--accent); }
  .ac-step-dot.done { background:var(--cat-informal); }
  .ac-step-line { flex:1; height:2px; background:var(--linha); }
  .ac-step-line.done { background:var(--cat-informal); }
  .ac-step-label { font-size:9.5px; color:var(--muted); text-align:center; width:56px; }
  .ac-step-label.active { color:var(--ink); font-weight:700; }

  .ac-phone-frame { width:320px; border-radius:42px; background:var(--ink); padding:14px; box-shadow:0 24px 48px -16px rgba(22,36,31,0.4); }
  .ac-phone-notch { width:90px; height:18px; background:var(--ink); border-radius:0 0 14px 14px; margin:0 auto 6px auto; }
  .ac-phone-screen { background:var(--surface); border-radius:28px; height:600px; overflow:hidden; display:flex; flex-direction:column; }
  .ac-topbar { padding:14px 16px 10px 16px; display:flex; align-items:center; justify-content:space-between; background:var(--surface); flex-shrink:0; }
  .ac-content { flex:1; overflow-y:auto; padding:0 16px 16px 16px; }
  .ac-tabbar { display:flex; justify-content:space-around; align-items:center; padding:10px 0 4px 0; border-top:1px solid var(--linha); background:var(--surface-raised); flex-shrink:0; }
  .ac-tabitem { display:flex; flex-direction:column; align-items:center; gap:2px; font-size:9.5px; color:var(--muted); cursor:pointer; }
  .ac-tabitem.active { color:var(--ink); font-weight:700; }
  .ac-home-indicator { width:90px; height:4px; background:var(--linha); border-radius:999px; margin:6px auto 0 auto; flex-shrink:0; }

  .ac-admin-shell { display:flex; border:1px solid var(--linha); border-radius:16px; overflow:hidden; background:var(--surface-raised); min-height:600px; }
  .ac-admin-sidebar { width:180px; background:var(--ink); color:var(--surface); padding:20px 14px; font-size:13px; display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
  .ac-admin-navitem { padding:8px 10px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:8px; }
  .ac-admin-navitem.active { background:rgba(245,246,242,0.14); font-weight:600; }
  .ac-admin-main { flex:1; padding:22px; overflow-y:auto; max-height:600px; }
  .ac-row { display:flex; align-items:center; justify-content:space-between; padding:11px 13px; border:1px solid var(--linha); border-radius:11px; margin-bottom:8px; background:var(--surface-raised); }

  .ac-modal-overlay { position:fixed; inset:0; background:rgba(22,36,31,0.5); display:flex; align-items:center; justify-content:center; z-index:80; }
  .ac-modal { background:var(--surface-raised); border-radius:18px; padding:20px; width:300px; max-height:80vh; overflow-y:auto; box-shadow:0 30px 60px -20px rgba(0,0,0,.4); }

  .ac-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:var(--surface); padding:10px 18px; border-radius:999px; font-size:13px; z-index:90; box-shadow:0 10px 24px rgba(0,0,0,.25); }

  .ac-bubble { max-width:78%; padding:8px 12px; border-radius:14px; font-size:13px; margin-bottom:6px; }
  .ac-bubble.mine { background:var(--accent); color:var(--accent-ink); margin-left:auto; border-bottom-right-radius:4px; }
  .ac-bubble.theirs { background:var(--surface-raised); border:1px solid var(--linha); margin-right:auto; border-bottom-left-radius:4px; }

  .ac-empty { text-align:center; padding:36px 16px; color:var(--muted); font-size:13px; }
  .ac-scrollx { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; }
  .ac-divider { height:1px; background:var(--linha); margin:10px 0; }
`;

/* -------------------------------------------------------------------- */
/* 2. CATÁLOGO / DADOS MOCKADOS (Etapa 3)                                */
/* -------------------------------------------------------------------- */

const CATEGORIA_COR = { informal: "#6B8F71", tecnico: "#3E7CB1", superior: "#A6672B" };
const CATEGORIA_LABEL = { informal: "Informal", tecnico: "Técnico", superior: "Superior" };
const CATEGORIA_RANK = { informal: 0, tecnico: 1, superior: 2 };
const STATUS_COR = {
  aberto: "#E8A33D", em_busca: "#E8A33D", convite_enviado: "#E8A33D",
  candidaturas_recebidas: "#E8A33D", confirmado: "#3E7CB1", em_andamento: "#2A9D8F",
  concluido: "#6B8F71", avaliado: "#6B8F71", cancelado: "#B24C3A",
};
const STATUS_LABEL = {
  aberto: "Aberto", em_busca: "Em busca", convite_enviado: "Convite enviado",
  candidaturas_recebidas: "Candidaturas recebidas", confirmado: "Confirmado",
  em_andamento: "Em andamento", concluido: "Concluído", avaliado: "Avaliado", cancelado: "Cancelado",
};

const ATIVIDADES = [
  { id: "higiene", nome: "Higiene e banho", min: "informal" },
  { id: "alimentacao", nome: "Alimentação", min: "informal" },
  { id: "locomocao", nome: "Apoio para locomoção", min: "informal" },
  { id: "companhia", nome: "Companhia e acompanhamento", min: "informal" },
  { id: "lembrete_medicacao", nome: "Lembrete de medicação já separada", min: "informal" },
  { id: "sinais_vitais", nome: "Verificação de sinais vitais", min: "tecnico" },
  { id: "medicacao_prescrita", nome: "Administração de medicação prescrita", min: "tecnico" },
  { id: "curativos", nome: "Curativos simples", min: "tecnico" },
  { id: "fisioterapia", nome: "Sessão de fisioterapia", min: "superior" },
  { id: "visita_enfermagem", nome: "Avaliação e visita de enfermagem", min: "superior" },
  { id: "plano_cuidado", nome: "Plano de cuidado", min: "superior" },
];

function categoriaExigida(atividadesIds) {
  let maxRank = 0;
  atividadesIds.forEach((id) => {
    const a = ATIVIDADES.find((x) => x.id === id);
    if (a) maxRank = Math.max(maxRank, CATEGORIA_RANK[a.min]);
  });
  return ["informal", "tecnico", "superior"][maxRank];
}

function seedData() {
  const empresa = {
    id: "emp1", nome: "Home Care Vida Plena", cnpj: "12.345.678/0001-90",
    cidade: "Cidade Média - Centro", telefone: "(11) 99999-0000", email: "contato@vidaplena.com.br",
    status: "aprovado", favoritos: ["c1", "c4"],
  };

  const cuidadores = [
    { id: "c1", nome: "Sandra Oliveira", cpf: "111.111.111-11", nascimento: "1985-04-12", cidade: "Cidade Média",
      bairros: ["Centro", "Jardim das Flores"], categoria: "informal", registroConselho: null, registroStatus: null,
      statusCadastro: "aprovado", motivoRecusa: null, atividades: ["higiene", "alimentacao", "locomocao", "companhia", "lembrete_medicacao"],
      disponibilidade: { dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"], turnos: ["manha", "tarde", "plantao12"] },
      valorPlantao: 180, seloVerificado: true, apresentacao: "Cuidadora com 8 anos de experiência com idosos.", experienciaAnos: 8,
    },
    { id: "c2", nome: "Beatriz Nunes", cpf: "222.222.222-22", nascimento: "1990-08-02", cidade: "Cidade Média",
      bairros: ["Centro", "Vila Nova"], categoria: "informal", registroConselho: null, registroStatus: null,
      statusCadastro: "aprovado", motivoRecusa: null, atividades: ["higiene", "alimentacao", "locomocao", "companhia"],
      disponibilidade: { dias: ["seg", "ter", "qua", "qui", "sex"], turnos: ["manha", "tarde"] },
      valorPlantao: 170, seloVerificado: true, apresentacao: "Acompanhante dedicada, atenta a rotina de medicação.", experienciaAnos: 4,
    },
    { id: "c3", nome: "Renata Alves", cpf: "333.333.333-33", nascimento: "1993-01-20", cidade: "Cidade Média",
      bairros: ["Centro"], categoria: "informal", registroConselho: null, registroStatus: null,
      statusCadastro: "em_analise", motivoRecusa: null, atividades: ["higiene", "companhia"],
      disponibilidade: { dias: ["sab", "dom"], turnos: ["plantao12", "plantao24"] },
      valorPlantao: 190, seloVerificado: false, apresentacao: "Cuidadora iniciante, muito atenciosa.", experienciaAnos: 1,
    },
    { id: "c4", nome: "Marcos Vidal", cpf: "444.444.444-44", nascimento: "1988-11-05", cidade: "Cidade Média",
      bairros: ["Centro", "Jardim das Flores"], categoria: "superior", registroConselho: "CREFITO 98765-F", registroStatus: "aprovado",
      statusCadastro: "aprovado", motivoRecusa: null, atividades: ["fisioterapia", "plano_cuidado", "locomocao"],
      disponibilidade: { dias: ["seg", "qua", "sex"], turnos: ["tarde"] },
      valorPlantao: 220, seloVerificado: true, apresentacao: "Fisioterapeuta especializado em reabilitação ortopédica.", experienciaAnos: 10,
    },
    { id: "c5", nome: "Juliana Prado", cpf: "555.555.555-55", nascimento: "1991-06-18", cidade: "Cidade Média",
      bairros: ["Centro", "Vila Nova"], categoria: "tecnico", registroConselho: "COREN 45231", registroStatus: "aprovado",
      statusCadastro: "aprovado", motivoRecusa: null, atividades: ["sinais_vitais", "medicacao_prescrita", "curativos", "higiene"],
      disponibilidade: { dias: ["ter", "qui", "sab"], turnos: ["manha", "plantao12"] },
      valorPlantao: 200, seloVerificado: true, apresentacao: "Técnica de enfermagem, cuidados pós-cirúrgicos.", experienciaAnos: 6,
    },
    { id: "c6", nome: "Paulo Ricci", cpf: "666.666.666-66", nascimento: "1980-02-27", cidade: "Cidade Média",
      bairros: ["Centro"], categoria: "superior", registroConselho: "COREN 11220", registroStatus: "em_analise",
      statusCadastro: "em_analise", motivoRecusa: null, atividades: ["visita_enfermagem", "medicacao_prescrita", "plano_cuidado"],
      disponibilidade: { dias: ["seg", "ter", "qua", "qui", "sex"], turnos: ["manha"] },
      valorPlantao: 240, seloVerificado: false, apresentacao: "Enfermeiro, aguardando conferência do registro.", experienciaAnos: 12,
    },
    { id: "c7", nome: "Camila Duarte", cpf: "777.777.777-77", nascimento: "1995-09-09", cidade: "Cidade Média",
      bairros: ["Vila Nova"], categoria: "informal", registroConselho: null, registroStatus: null,
      statusCadastro: "recusado", motivoRecusa: "Documento de identidade ilegível — favor reenviar.", atividades: ["higiene", "companhia"],
      disponibilidade: { dias: ["sab", "dom"], turnos: ["tarde"] },
      valorPlantao: 160, seloVerificado: false, apresentacao: "Disponível para plantões de fim de semana.", experienciaAnos: 2,
    },
    { id: "c8", nome: "Fernando Lima", cpf: "888.888.888-88", nascimento: "1987-03-15", cidade: "Cidade Média",
      bairros: ["Centro", "Jardim das Flores"], categoria: "tecnico", registroConselho: "COREN 78542", registroStatus: "aprovado",
      statusCadastro: "aprovado", motivoRecusa: null, atividades: ["sinais_vitais", "curativos", "higiene", "alimentacao"],
      disponibilidade: { dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"], turnos: ["noite", "plantao24"] },
      valorPlantao: 210, seloVerificado: true, apresentacao: "Técnico de enfermagem, especialista em plantões noturnos.", experienciaAnos: 7,
    },
  ];

  const paciente1 = { nome: "dona Marli", idade: 78, andaSozinho: false, sonda: false, oxigenio: false, animais: "1 cachorro" };
  const paciente2 = { nome: "seu Antônio", idade: 82, andaSozinho: true, sonda: false, oxigenio: true, animais: "nenhum" };

  const hoje = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (n) => { const d = new Date(hoje); d.setDate(d.getDate() + n); return d; };

  const atendimentos = [
    { id: "a1", empresaId: "emp1", tipo: "plantao12", endereco: { bairro: "Centro", rua: "Rua das Acácias", numero: "245" },
      dataInicio: iso(addDays(1)), horaInicio: "07:00", duracaoHoras: 12, repete: true, repeticaoDescricao: "Diariamente por 30 dias",
      atividades: ["higiene", "alimentacao", "locomocao"], paciente: paciente1, valor: 180,
      status: "confirmado", publicacaoAberta: false, cuidadorConfirmadoId: "c1", criadoEm: iso(addDays(-1)) },
    { id: "a2", empresaId: "emp1", tipo: "sessao", endereco: { bairro: "Centro", rua: "Rua das Acácias", numero: "245" },
      dataInicio: iso(addDays(2)), horaInicio: "15:00", duracaoHoras: 1, repete: true, repeticaoDescricao: "Seg/Qua/Sex às 15h",
      atividades: ["fisioterapia"], paciente: paciente1, valor: 120,
      status: "candidaturas_recebidas", publicacaoAberta: false, cuidadorConfirmadoId: null, criadoEm: iso(addDays(-1)) },
    { id: "a3", empresaId: "emp1", tipo: "sessao", endereco: { bairro: "Centro", rua: "Rua das Acácias", numero: "245" },
      dataInicio: iso(addDays(3)), horaInicio: "09:00", duracaoHoras: 1, repete: false, repeticaoDescricao: "",
      atividades: ["visita_enfermagem", "medicacao_prescrita"], paciente: paciente1, valor: 150,
      status: "aberto", publicacaoAberta: false, cuidadorConfirmadoId: null, criadoEm: iso(addDays(0)) },
    { id: "a4", empresaId: "emp1", tipo: "plantao12", endereco: { bairro: "Jardim das Flores", rua: "Av. Girassóis", numero: "88" },
      dataInicio: iso(addDays(-2)), horaInicio: "07:00", duracaoHoras: 12, repete: false, repeticaoDescricao: "",
      atividades: ["higiene", "alimentacao"], paciente: paciente2, valor: 180,
      status: "em_andamento", publicacaoAberta: false, cuidadorConfirmadoId: "c2",
      checkinHorario: iso(addDays(-2)) + "T06:58", checkinLocal: "Jardim das Flores (simulado)", criadoEm: iso(addDays(-4)) },
    { id: "a5", empresaId: "emp1", tipo: "plantao24", endereco: { bairro: "Vila Nova", rua: "Rua Tucanos", numero: "12" },
      dataInicio: iso(addDays(-6)), horaInicio: "07:00", duracaoHoras: 24, repete: false, repeticaoDescricao: "",
      atividades: ["sinais_vitais", "curativos"], paciente: paciente2, valor: 260,
      status: "concluido", publicacaoAberta: false, cuidadorConfirmadoId: "c5",
      checkinHorario: iso(addDays(-6)) + "T06:55", checkinLocal: "Vila Nova (simulado)",
      checkoutHorario: iso(addDays(-5)) + "T07:03", criadoEm: iso(addDays(-8)) },
    { id: "a6", empresaId: "emp1", tipo: "plantao12", endereco: { bairro: "Centro", rua: "Rua das Acácias", numero: "245" },
      dataInicio: iso(addDays(-10)), horaInicio: "07:00", duracaoHoras: 12, repete: false, repeticaoDescricao: "",
      atividades: ["higiene", "alimentacao", "locomocao"], paciente: paciente1, valor: 180,
      status: "avaliado", publicacaoAberta: false, cuidadorConfirmadoId: "c1",
      checkinHorario: iso(addDays(-10)) + "T07:02", checkinLocal: "Centro (simulado)",
      checkoutHorario: iso(addDays(-10)) + "T19:05", criadoEm: iso(addDays(-12)) },
    { id: "a7", empresaId: "emp1", tipo: "plantao24", endereco: { bairro: "Centro", rua: "Rua das Acácias", numero: "245" },
      dataInicio: iso(addDays(-15)), horaInicio: "07:00", duracaoHoras: 24, repete: false, repeticaoDescricao: "",
      atividades: ["higiene", "companhia"], paciente: paciente1, valor: 190,
      status: "cancelado", publicacaoAberta: false, cuidadorConfirmadoId: null,
      canceladoInfo: { quem: "Empresa", quando: iso(addDays(-15)) + "T20:00", motivo: "Paciente foi internada.", antecedenciaHoras: 11 },
      criadoEm: iso(addDays(-16)) },
    { id: "a8", empresaId: "emp1", tipo: "plantao12", endereco: { bairro: "Jardim das Flores", rua: "Av. Girassóis", numero: "88" },
      dataInicio: iso(addDays(5)), horaInicio: "07:00", duracaoHoras: 12, repete: false, repeticaoDescricao: "",
      atividades: ["higiene", "alimentacao", "companhia"], paciente: paciente2, valor: 180,
      status: "aberto", publicacaoAberta: true, cuidadorConfirmadoId: null, criadoEm: iso(addDays(0)) },
  ];

  const convites = [
    { id: "cv1", atendimentoId: "a2", cuidadorId: "c4", status: "aceito", criadoEm: iso(addDays(-1)) + "T20:00" },
  ];

  const candidaturas = [
    { id: "cd1", atendimentoId: "a2", cuidadorId: "c4", status: "pendente", criadoEm: iso(addDays(-1)) + "T20:05" },
  ];

  const registros = {
    a4: { atendimentoId: "a4", tarefas: [
        { id: "t1", nome: "Banho", feito: true }, { id: "t2", nome: "Café da manhã", feito: true },
        { id: "t3", nome: "Caminhada com apoio", feito: false }, { id: "t4", nome: "Almoço", feito: false },
      ], observacoes: [{ texto: "Seu Antônio dormiu bem à noite.", autor: "Beatriz Nunes", horario: iso(addDays(-2)) + "T08:10" }],
      sinaisVitais: "", fotos: 0, fechado: false },
    a5: { atendimentoId: "a5", tarefas: [
        { id: "t1", nome: "Curativo", feito: true }, { id: "t2", nome: "Sinais vitais", feito: true },
      ], observacoes: [{ texto: "Curativo trocado sem sinais de infecção.", autor: "Juliana Prado", horario: iso(addDays(-6)) + "T10:00" }],
      sinaisVitais: "PA 128/82, FC 76bpm", fotos: 1, fechado: true },
    a6: { atendimentoId: "a6", tarefas: [
        { id: "t1", nome: "Banho", feito: true }, { id: "t2", nome: "Café da manhã", feito: true },
        { id: "t3", nome: "Caminhada com andador", feito: true }, { id: "t4", nome: "Almoço", feito: true },
        { id: "t5", nome: "Troca de posição", feito: true },
      ], observacoes: [{ texto: "Dona Marli sentiu dor ao apoiar a perna à tarde.", autor: "Sandra Oliveira", horario: iso(addDays(-10)) + "T15:30" }],
      sinaisVitais: "", fotos: 0, fechado: true },
  };

  const avaliacoes = [
    { id: "av1", atendimentoId: "a6", de: "empresa", cuidadorId: "c1", nota: 5, comentario: "Sandra é atenciosa e pontual.", criadoEm: iso(addDays(-9)) },
    { id: "av2", atendimentoId: "a5", de: "empresa", cuidadorId: "c5", nota: 5, comentario: "Excelente cuidado técnico.", criadoEm: iso(addDays(-5)) },
  ];
  // Sandra (c1) tem só 1 avaliação de verdade aqui; adicionamos duas anteriores simuladas p/ liberar média (R10).
  avaliacoes.push(
    { id: "av0a", atendimentoId: "hist1", de: "empresa", cuidadorId: "c1", nota: 5, comentario: "Ótimo atendimento em plantão anterior.", criadoEm: iso(addDays(-40)) },
    { id: "av0b", atendimentoId: "hist2", de: "empresa", cuidadorId: "c1", nota: 4, comentario: "Muito boa, pequeno atraso uma vez.", criadoEm: iso(addDays(-25)) },
  );
  // Beatriz (c2) fica com só 1 avaliação de propósito, para demonstrar R10 (sem média ainda).
  avaliacoes.push({ id: "av3", atendimentoId: "hist3", de: "empresa", cuidadorId: "c2", nota: 5, comentario: "Muito cuidadosa.", criadoEm: iso(addDays(-20)) });

  const mensagens = [
    { id: "m1", atendimentoId: "a2", de: "empresa", texto: "Oi Marcos, tudo certo para a sessão de quarta?", horario: iso(addDays(-1)) + "T20:10" },
    { id: "m2", atendimentoId: "a2", de: "cuidador", texto: "Tudo certo! Confirmo presença às 15h.", horario: iso(addDays(-1)) + "T20:20" },
    { id: "m3", atendimentoId: "a6", de: "empresa", texto: "Sandra, obrigada pelo plantão de ontem!", horario: iso(addDays(-9)) + "T09:00" },
    { id: "m4", atendimentoId: "a6", de: "cuidador", texto: "Fico feliz em ajudar, qualquer coisa me chamem.", horario: iso(addDays(-9)) + "T09:15" },
  ];

  const notificacoes = [
    { id: "n1", paraTipo: "cuidador", paraId: "c4", tipo: "candidatura", texto: "Sua candidatura para a sessão de fisioterapia está em análise.", lida: false, criadoEm: iso(addDays(-1)) + "T20:05" },
    { id: "n2", paraTipo: "empresa", paraId: "emp1", tipo: "candidatura", texto: "Marcos Vidal se candidatou à sessão de fisioterapia.", lida: false, criadoEm: iso(addDays(-1)) + "T20:05" },
    { id: "n3", paraTipo: "empresa", paraId: "emp1", tipo: "checkin", texto: "Beatriz Nunes fez check-in no plantão de hoje.", lida: true, criadoEm: iso(addDays(-2)) + "T06:58" },
  ];

  const filaAprovacao = cuidadores.filter((c) => c.statusCadastro === "em_analise").map((c) => ({
    id: "fa_" + c.id, tipo: "cuidador", refId: c.id, criadoEm: iso(addDays(-1)),
  }));

  const log = [
    { id: "l1", acao: "Cadastro aprovado", quem: "Admin", quando: iso(addDays(-30)) + "T09:00", detalhe: "Sandra Oliveira aprovada." },
    { id: "l2", acao: "Cancelamento", quem: "Empresa", quando: iso(addDays(-15)) + "T20:00", detalhe: "Atendimento a7 cancelado com 11h de antecedência (< 12h, R8)." },
  ];

  return { empresa, cuidadores, atendimentos, convites, candidaturas, registros, avaliacoes, mensagens, notificacoes, filaAprovacao, log };
}

/* -------------------------------------------------------------------- */
/* 3. CAMADA DE DADOS (Etapa 19 — window.storage)                        */
/* -------------------------------------------------------------------- */

const STORAGE_KEY = "acalento_demo_state_v1";

async function loadState() {
  try {
    const res = await window.storage.get(STORAGE_KEY);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {
    // chave ainda não existe — cai no seed
  }
  const seed = seedData();
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(seed)); } catch (e) {}
  return seed;
}

async function saveState(state) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(state)); } catch (e) {
    console.error("Falha ao salvar estado (window.storage).", e);
  }
}

async function resetState() {
  const seed = seedData();
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(seed)); } catch (e) {}
  return seed;
}

/* -------------------------------------------------------------------- */
/* 4. HELPERS DE REGRA DE NEGÓCIO (R1–R12)                               */
/* -------------------------------------------------------------------- */

function cuidadorPorId(state, id) { return state.cuidadores.find((c) => c.id === id); }
function atendimentoPorId(state, id) { return state.atendimentos.find((a) => a.id === id); }

function notaMediaCuidador(state, cuidadorId) {
  const avs = state.avaliacoes.filter((a) => a.cuidadorId === cuidadorId && a.de === "empresa");
  if (avs.length < 3) return null; // R10
  const soma = avs.reduce((s, a) => s + a.nota, 0);
  return (soma / avs.length).toFixed(1);
}

function cuidadoresCompativeis(state, atendimento) {
  const catExigida = categoriaExigida(atendimento.atividades);
  return state.cuidadores
    .filter((c) => c.statusCadastro === "aprovado") // R1
    .filter((c) => CATEGORIA_RANK[c.categoria] >= CATEGORIA_RANK[catExigida]) // R2
    .filter((c) => (c.categoria === "informal") || c.registroStatus === "aprovado") // R3
    .filter((c) => atendimento.atividades.every((id) => c.atividades.includes(id))) // sabe fazer as atividades pedidas
    .filter((c) => c.bairros.includes(atendimento.endereco.bairro))
    .sort((a, b) => {
      const favA = state.empresa.favoritos.includes(a.id) ? 1 : 0;
      const favB = state.empresa.favoritos.includes(b.id) ? 1 : 0;
      if (favA !== favB) return favB - favA;
      const notaA = parseFloat(notaMediaCuidador(state, a.id) || 0);
      const notaB = parseFloat(notaMediaCuidador(state, b.id) || 0);
      return notaB - notaA;
    });
}

function janelaAtendimento(a) {
  const inicio = new Date(a.dataInicio + "T" + a.horaInicio);
  const fim = new Date(inicio.getTime() + a.duracaoHoras * 3600 * 1000);
  return { inicio, fim };
}

function temSobreposicao(state, cuidadorId, atendimentoAlvo) {
  const janelaAlvo = janelaAtendimento(atendimentoAlvo);
  return state.atendimentos.some((a) => {
    if (a.id === atendimentoAlvo.id) return false;
    if (a.cuidadorConfirmadoId !== cuidadorId) return false;
    if (!["confirmado", "em_andamento"].includes(a.status)) return false;
    const j = janelaAtendimento(a);
    return janelaAlvo.inicio < j.fim && j.inicio < janelaAlvo.fim; // R4
  });
}

function horasFechadas(state, cuidadorId) {
  return state.atendimentos
    .filter((a) => a.cuidadorConfirmadoId === cuidadorId && a.checkinHorario && a.checkoutHorario)
    .map((a) => {
      const h = (new Date(a.checkoutHorario) - new Date(a.checkinHorario)) / 3600000;
      return { atendimentoId: a.id, data: a.dataInicio, horas: Math.max(0, h).toFixed(1) };
    });
}

/* -------------------------------------------------------------------- */
/* 5. COMPONENTES DE UI COMPARTILHADOS                                   */
/* -------------------------------------------------------------------- */

function Cracha({ label, color, icon }) {
  return <span className="ac-cracha" style={{ background: color }}>{icon}{label}</span>;
}

function StatusBadge({ status }) {
  return (
    <span className="ac-cracha" style={{ background: STATUS_COR[status] || "#999" }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function CuidadorCategoriaCracha({ cuidador }) {
  return <Cracha label={CATEGORIA_LABEL[cuidador.categoria]} color={CATEGORIA_COR[cuidador.categoria]} />;
}

function Avatar({ nome, size = 36 }) {
  const iniciais = nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "var(--ink)", color: "var(--surface)",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>{iniciais}</div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="ac-modal-overlay" onClick={onClose}>
      <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="ac-display" style={{ fontSize: 16.5 }}>{title}</div>
          <X size={18} style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ text }) {
  if (!text) return null;
  return <div className="ac-toast">{text}</div>;
}

function StatusStepper({ current }) {
  const steps = ["aberto", "confirmado", "em_andamento", "concluido"];
  const labels = ["Aberto", "Confirmado", "Em andamento", "Concluído"];
  const map = { em_busca: "aberto", convite_enviado: "aberto", candidaturas_recebidas: "aberto", avaliado: "concluido" };
  const norm = map[current] || current;
  const idx = Math.max(0, steps.indexOf(norm));
  if (current === "cancelado") {
    return <div style={{ fontSize: 12.5, color: "var(--st-cancelado)", fontWeight: 700 }}>Atendimento cancelado</div>;
  }
  return (
    <div>
      <div className="ac-stepper">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={"ac-step-dot " + (i < idx ? "done" : i === idx ? "active" : "")} />
            {i < steps.length - 1 && <div className={"ac-step-line " + (i < idx ? "done" : "")} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: 4 }}>
        {labels.map((l, i) => (
          <div key={l} className={"ac-step-label " + (i === idx ? "active" : "")}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="ac-empty">{text}</div>;
}

function TopBar({ title, subtitle, onBack, right }) {
  return (
    <div className="ac-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {onBack && <ChevronLeft size={20} style={{ cursor: "pointer", flexShrink: 0 }} onClick={onBack} />}
        <div style={{ minWidth: 0 }}>
          {subtitle && <div style={{ fontSize: 11, color: "var(--muted)" }}>{subtitle}</div>}
          <div className="ac-display" style={{ fontSize: 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        </div>
      </div>
      {right}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 6. APP RAIZ                                                           */
/* -------------------------------------------------------------------- */

export default function AcalentoApp() {
  const [state, setState] = useState(null);
  const [session, setSession] = useState(null); // {tipo:'empresa'|'cuidador'|'admin', id}
  const [nav, setNav] = useState({ screen: "login", params: {} });
  const [navStack, setNavStack] = useState([]);
  const [toast, setToast] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => { loadState().then(setState); }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveState(next);
      return next;
    });
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const goTo = (screen, params = {}) => {
    setNavStack((s) => [...s, nav]);
    setNav({ screen, params });
  };
  const goBack = () => {
    setNavStack((s) => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setNav(prev);
      return s.slice(0, -1);
    });
  };
  const resetNav = (screen, params = {}) => { setNavStack([]); setNav({ screen, params }); };

  const doLogin = (tipo, id) => {
    setSession({ tipo, id });
    if (tipo === "admin") resetNav("admin_fila");
    else if (tipo === "empresa") resetNav("empresa_inicio");
    else resetNav("cuidador_inicio");
  };
  const doLogout = () => { setSession(null); resetNav("login"); };

  const handleReset = async () => {
    const seed = await resetState();
    setState(seed);
    showToast("Demo resetada para o estado inicial.");
    doLogout();
  };

  if (!state) {
    return <div className="ac-root" style={{ padding: 40, textAlign: "center" }}>Carregando demo…</div>;
  }

  const ctx = { state, persist, session, showToast, goTo, goBack, nav };

  // Área de administração — layout desktop
  if (session && session.tipo === "admin") {
    return (
      <div className="ac-root" style={{ padding: 24 }}>
        <style>{STYLE}</style>
        <AdminArea ctx={ctx} onLogout={doLogout} onReset={handleReset} />
        <Toast text={toast} />
      </div>
    );
  }

  // Empresa / Cuidador — dentro do frame de celular
  return (
    <div className="ac-root" style={{ padding: 24, display: "flex", justifyContent: "center" }}>
      <style>{STYLE}</style>
      <div className="ac-phone-frame">
        <div className="ac-phone-notch" />
        <div className="ac-phone-screen">
          {!session && <AuthScreens ctx={ctx} onLogin={doLogin} />}
          {session && session.tipo === "empresa" && (
            <EmpresaApp ctx={ctx} onLogout={doLogout} notifOpen={notifOpen} setNotifOpen={setNotifOpen} />
          )}
          {session && session.tipo === "cuidador" && (
            <CuidadorApp ctx={ctx} onLogout={doLogout} notifOpen={notifOpen} setNotifOpen={setNotifOpen} />
          )}
        </div>
      </div>
      <Toast text={toast} />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 7. TELAS 01–03 — ENTRADA, CADASTRO, AGUARDANDO APROVAÇÃO               */
/* -------------------------------------------------------------------- */

function AuthScreens({ ctx, onLogin }) {
  const { state, goTo, nav } = ctx;
  const screen = nav.screen === "login" ? "login" : nav.screen;

  if (screen === "cadastro") return <CadastroScreen ctx={ctx} onLogin={onLogin} />;

  return (
    <div className="ac-content" style={{ paddingTop: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div className="ac-display" style={{ fontSize: 24 }}>Acalento</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Conexão em Home Care</div>
      </div>

      <div className="ac-label" style={{ marginBottom: 8 }}>ENTRAR COMO EMPRESA</div>
      <div className="ac-card" style={{ marginBottom: 16, cursor: "pointer" }} onClick={() => onLogin("empresa", state.empresa.id)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Briefcase size={20} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{state.empresa.nome}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Perfil de coordenação (gestor)</div>
          </div>
        </div>
      </div>

      <div className="ac-label" style={{ marginBottom: 8 }}>ENTRAR COMO CUIDADOR</div>
      {state.cuidadores.slice(0, 4).map((c) => (
        <div key={c.id} className="ac-card" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => onLogin("cuidador", c.id)}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar nome={c.nome} size={30} />
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome}</div>
            </div>
            <CuidadorCategoriaCracha cuidador={c} />
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button className="ac-btn ac-btn-ghost ac-btn-block" onClick={() => goTo("cadastro")}>
          <Plus size={14} /> Criar novo cadastro
        </button>
      </div>
      <div className="ac-divider" />
      <button className="ac-btn ac-btn-ghost ac-btn-block" onClick={() => onLogin("admin", "admin1")}>
        Entrar como Administrador (uso interno)
      </button>
    </div>
  );
}

function CadastroScreen({ ctx, onLogin }) {
  const { state, persist, goTo, goBack, showToast } = ctx;
  const [tipo, setTipo] = useState("cuidador");
  const [categoria, setCategoria] = useState("informal");
  const [nome, setNome] = useState("");
  const [passo, setPasso] = useState(1);

  const finalizar = () => {
    if (!nome.trim()) { showToast("Informe um nome para continuar."); return; }
    const novoId = "novo_" + Date.now();
    if (tipo === "cuidador") {
      const novoCuidador = {
        id: novoId, nome, cpf: "000.000.000-00", nascimento: "2000-01-01", cidade: "Cidade Média",
        bairros: ["Centro"], categoria, registroConselho: categoria !== "informal" ? "Em conferência" : null,
        registroStatus: categoria !== "informal" ? "em_analise" : null, statusCadastro: "em_analise", motivoRecusa: null,
        atividades: categoria === "informal" ? ["higiene", "companhia"] : categoria === "tecnico" ? ["sinais_vitais"] : ["visita_enfermagem"],
        disponibilidade: { dias: ["seg", "ter", "qua"], turnos: ["manha"] }, valorPlantao: 180, seloVerificado: false,
        apresentacao: "Cadastro recém-criado na demo.", experienciaAnos: 0,
      };
      persist((s) => ({
        ...s, cuidadores: [...s.cuidadores, novoCuidador],
        filaAprovacao: [...s.filaAprovacao, { id: "fa_" + novoId, tipo: "cuidador", refId: novoId, criadoEm: new Date().toISOString() }],
      }));
      onLogin("cuidador", novoId);
    } else {
      showToast("Cadastro de empresa simulado — use o perfil de demonstração na Entrada.");
      goBack();
    }
  };

  return (
    <div className="ac-content" style={{ paddingTop: 20 }}>
      <TopBar title="Cadastro passo a passo" onBack={goBack} />
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[1, 2, 3].map((p) => (
          <div key={p} style={{ flex: 1, height: 4, borderRadius: 999, background: p <= passo ? "var(--accent)" : "var(--linha)" }} />
        ))}
      </div>

      {passo === 1 && (
        <>
          <div className="ac-label">Você é...</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div className={"ac-chip " + (tipo === "cuidador" ? "on" : "")} onClick={() => setTipo("cuidador")}>Cuidador</div>
            <div className={"ac-chip " + (tipo === "empresa" ? "on" : "")} onClick={() => setTipo("empresa")}>Empresa</div>
          </div>
          {tipo === "cuidador" && (
            <>
              <div className="ac-label">Categoria</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {["informal", "tecnico", "superior"].map((cat) => (
                  <div key={cat} className={"ac-chip " + (categoria === cat ? "on" : "")} onClick={() => setCategoria(cat)}>
                    {CATEGORIA_LABEL[cat]}
                  </div>
                ))}
              </div>
            </>
          )}
          <button className="ac-btn ac-btn-primary ac-btn-block" onClick={() => setPasso(2)}>Continuar</button>
        </>
      )}

      {passo === 2 && (
        <>
          <div className="ac-label">Nome completo</div>
          <input className="ac-input" style={{ marginBottom: 14 }} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
          <div className="ac-label">CPF {tipo === "empresa" && "/ CNPJ"}</div>
          <input className="ac-input" style={{ marginBottom: 14 }} placeholder="000.000.000-00" disabled />
          {tipo === "cuidador" && categoria !== "informal" && (
            <>
              <div className="ac-label">Registro no conselho de classe</div>
              <input className="ac-input" style={{ marginBottom: 14 }} placeholder="Ex.: COREN 12345" disabled />
            </>
          )}
          <button className="ac-btn ac-btn-primary ac-btn-block" onClick={() => setPasso(3)}>Continuar</button>
        </>
      )}

      {passo === 3 && (
        <>
          <div className="ac-card" style={{ marginBottom: 14, textAlign: "center" }}>
            <Camera size={26} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>Enviar documento + selfie (simulado)</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
              Nesta demo, o envio de documentos é simulado — sem upload real.
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
            Ao continuar, você aceita os Termos de Uso e a Política de Privacidade (simulado).
          </div>
          <button className="ac-btn ac-btn-primary ac-btn-block" onClick={finalizar}>Enviar cadastro</button>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 8. NOTIFICAÇÕES (compartilhado)                                       */
/* -------------------------------------------------------------------- */

function useMinhasNotificacoes(state, tipo, id) {
  return state.notificacoes.filter((n) => n.paraTipo === tipo && n.paraId === id).sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}

function NotificationBell({ ctx, tipo, id, open, setOpen }) {
  const notifs = useMinhasNotificacoes(ctx.state, tipo, id);
  const naoLidas = notifs.filter((n) => !n.lida).length;
  const marcarLidas = () => {
    ctx.persist((s) => ({ ...s, notificacoes: s.notificacoes.map((n) => (n.paraTipo === tipo && n.paraId === id ? { ...n, lida: true } : n)) }));
  };
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => { setOpen(!open); if (!open) marcarLidas(); }}>
        <Bell size={20} />
        {naoLidas > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: "var(--st-cancelado)", color: "#fff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {naoLidas}
          </span>
        )}
      </div>
      {open && (
        <div style={{ position: "absolute", top: 28, right: -10, width: 250, background: "var(--surface-raised)", border: "1px solid var(--linha)", borderRadius: 12, padding: 10, zIndex: 40, boxShadow: "0 12px 24px rgba(0,0,0,.15)" }}>
          <div className="ac-label" style={{ marginBottom: 6 }}>NOTIFICAÇÕES</div>
          {notifs.length === 0 && <EmptyState text="Nenhuma notificação por aqui." />}
          {notifs.slice(0, 6).map((n) => (
            <div key={n.id} style={{ fontSize: 12, padding: "7px 0", borderBottom: "1px solid var(--linha)" }}>
              {n.texto}
              <div className="ac-mono" style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 2 }}>{n.criadoEm.replace("T", " · ")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function notificar(persist, paraTipo, paraId, tipo, texto) {
  persist((s) => ({
    ...s,
    notificacoes: [...s.notificacoes, { id: "n_" + Date.now() + Math.random(), paraTipo, paraId, tipo, texto, lida: false, criadoEm: new Date().toISOString() }],
  }));
}

/* -------------------------------------------------------------------- */
/* 9. APP DA EMPRESA                                                     */
/* -------------------------------------------------------------------- */

function EmpresaApp({ ctx, onLogout, notifOpen, setNotifOpen }) {
  const { nav, goTo } = ctx;
  const tab = ["empresa_inicio", "empresa_escala", "empresa_conversas", "empresa_perfil"].includes(nav.screen) ? nav.screen : null;

  return (
    <>
      {nav.screen === "empresa_inicio" && <EmpresaInicio ctx={ctx} notifOpen={notifOpen} setNotifOpen={setNotifOpen} />}
      {nav.screen === "novo_atendimento" && <NovoAtendimento ctx={ctx} />}
      {nav.screen === "busca_cuidadores" && <BuscaCuidadores ctx={ctx} />}
      {nav.screen === "perfil_cuidador" && <PerfilCuidador ctx={ctx} viewer="empresa" />}
      {nav.screen === "candidaturas" && <CandidaturasRecebidas ctx={ctx} />}
      {nav.screen === "empresa_escala" && <EmpresaEscala ctx={ctx} />}
      {nav.screen === "detalhe_atendimento" && <DetalheAtendimento ctx={ctx} viewer="empresa" />}
      {nav.screen === "conversa" && <ConversaScreen ctx={ctx} viewer="empresa" />}
      {nav.screen === "empresa_conversas" && <ListaConversas ctx={ctx} viewer="empresa" />}
      {nav.screen === "avaliacao" && <AvaliacaoScreen ctx={ctx} viewer="empresa" />}
      {nav.screen === "relatorio_horas" && <RelatorioHoras ctx={ctx} />}
      {nav.screen === "empresa_perfil" && <EmpresaPerfil ctx={ctx} onLogout={onLogout} />}
      {nav.screen === "favoritos" && <FavoritosScreen ctx={ctx} />}

      {tab && (
        <div className="ac-tabbar">
          <TabItem icon={<Home size={19} />} label="Início" active={tab === "empresa_inicio"} onClick={() => goTo("empresa_inicio")} />
          <TabItem icon={<Calendar size={19} />} label="Escala" active={tab === "empresa_escala"} onClick={() => goTo("empresa_escala")} />
          <TabItem icon={<MessageSquare size={19} />} label="Conversas" active={tab === "empresa_conversas"} onClick={() => goTo("empresa_conversas")} />
          <TabItem icon={<User size={19} />} label="Perfil" active={tab === "empresa_perfil"} onClick={() => goTo("empresa_perfil")} />
        </div>
      )}
      <div className="ac-home-indicator" />
    </>
  );
}

function TabItem({ icon, label, active, onClick }) {
  return (
    <div className={"ac-tabitem " + (active ? "active" : "")} onClick={onClick}>
      {icon}<span>{label}</span>
    </div>
  );
}

function EmpresaInicio({ ctx, notifOpen, setNotifOpen }) {
  const { state, goTo } = ctx;
  const meus = state.atendimentos.filter((a) => a.empresaId === state.empresa.id);
  const hoje = new Date().toISOString().slice(0, 10);
  const deHoje = meus.filter((a) => a.dataInicio === hoje || a.status === "em_andamento");
  const emAberto = meus.filter((a) => ["aberto", "em_busca", "convite_enviado", "candidaturas_recebidas"].includes(a.status));
  const pendencias = meus.filter((a) => a.status === "candidaturas_recebidas");

  return (
    <div className="ac-content">
      <TopBar title={state.empresa.nome} subtitle="Início da empresa"
        right={<NotificationBell ctx={ctx} tipo="empresa" id={state.empresa.id} open={notifOpen} setOpen={setNotifOpen} />} />

      {state.empresa.status !== "aprovado" && (
        <div className="ac-card" style={{ marginBottom: 12, borderColor: "var(--st-cancelado)" }}>
          <AlertTriangle size={16} color="var(--st-cancelado)" />
          <div style={{ fontSize: 12.5, marginTop: 4 }}>
            Cadastro suspenso — não é possível publicar novos atendimentos (R11). Histórico permanece acessível.
          </div>
        </div>
      )}

      <button className="ac-btn ac-btn-primary ac-btn-block" style={{ marginBottom: 16 }}
        onClick={() => goTo("novo_atendimento")} disabled={state.empresa.status !== "aprovado"}>
        <Plus size={15} /> Novo atendimento
      </button>

      <SectionLabel text={`Hoje (${deHoje.length})`} />
      {deHoje.length === 0 && <EmptyState text="Nenhum atendimento hoje." />}
      {deHoje.map((a) => <AtendimentoRow key={a.id} a={a} onClick={() => goTo("detalhe_atendimento", { atendimentoId: a.id })} />)}

      <SectionLabel text={`Em aberto (${emAberto.length})`} />
      {emAberto.length === 0 && <EmptyState text="Nenhum atendimento em aberto." />}
      {emAberto.map((a) => <AtendimentoRow key={a.id} a={a} onClick={() => goTo("detalhe_atendimento", { atendimentoId: a.id })} />)}

      <SectionLabel text={`Pendências (${pendencias.length})`} />
      {pendencias.length === 0 && <EmptyState text="Nenhuma pendência no momento." />}
      {pendencias.map((a) => (
        <AtendimentoRow key={a.id} a={a} onClick={() => goTo("candidaturas", { atendimentoId: a.id })} />
      ))}
    </div>
  );
}

function SectionLabel({ text }) {
  return <div className="ac-label" style={{ marginTop: 16, marginBottom: 8 }}>{text.toUpperCase()}</div>;
}

function AtendimentoRow({ a, onClick }) {
  const cat = categoriaExigida(a.atividades);
  return (
    <div className="ac-card" style={{ marginBottom: 8, cursor: "pointer" }} onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.endereco.bairro} · {a.dataInicio.slice(8, 10)}/{a.dataInicio.slice(5, 7)}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{a.horaInicio} · {a.duracaoHoras}h · exige {CATEGORIA_LABEL[cat]}</div>
        </div>
        <StatusBadge status={a.status} />
      </div>
    </div>
  );
}

function NovoAtendimento({ ctx }) {
  const { state, persist, goTo, goBack, showToast } = ctx;
  const [tipo, setTipo] = useState("plantao12");
  const [bairro, setBairro] = useState("Centro");
  const [data, setData] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [hora, setHora] = useState("07:00");
  const [duracao, setDuracao] = useState(12);
  const [repete, setRepete] = useState(false);
  const [atividades, setAtividades] = useState([]);
  const [valor, setValor] = useState(180);
  const [idade, setIdade] = useState(78);
  const [andaSozinho, setAndaSozinho] = useState(false);
  const [sonda, setSonda] = useState(false);
  const [oxigenio, setOxigenio] = useState(false);

  const toggleAtividade = (id) => setAtividades((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const catExigida = categoriaExigida(atividades);

  const salvar = (comoRascunho) => {
    if (atividades.length === 0) { showToast("Marque ao menos uma atividade."); return; }
    const novoId = "a_" + Date.now();
    const novo = {
      id: novoId, empresaId: state.empresa.id, tipo, endereco: { bairro, rua: "Rua informada no cadastro", numero: "—" },
      dataInicio: data, horaInicio: hora, duracaoHoras: Number(duracao), repete, repeticaoDescricao: repete ? "Repetição configurada" : "",
      atividades, paciente: { idade: Number(idade), andaSozinho, sonda, oxigenio, animais: "—" }, valor: Number(valor),
      status: comoRascunho ? "rascunho" : "aberto", publicacaoAberta: false, cuidadorConfirmadoId: null, criadoEm: new Date().toISOString().slice(0, 10),
    };
    persist((s) => ({ ...s, atendimentos: [...s.atendimentos, novo] }));
    showToast(comoRascunho ? "Rascunho salvo." : `Atendimento publicado — exige categoria ${CATEGORIA_LABEL[catExigida]}.`);
    if (comoRascunho) goBack();
    else goTo("busca_cuidadores", { atendimentoId: novoId });
  };

  return (
    <div className="ac-content">
      <TopBar title="Novo atendimento" onBack={goBack} />

      <div className="ac-label">Tipo de atendimento</div>
      <div className="ac-scrollx" style={{ marginBottom: 12 }}>
        {[["plantao12", "Plantão 12h"], ["plantao24", "Plantão 24h"], ["periodo", "Período de horas"], ["sessao", "Sessão avulsa"]].map(([v, l]) => (
          <div key={v} className={"ac-chip " + (tipo === v ? "on" : "")} onClick={() => setTipo(v)} style={{ flexShrink: 0 }}>{l}</div>
        ))}
      </div>

      <div className="ac-label">Bairro do atendimento</div>
      <select className="ac-select" style={{ marginBottom: 12 }} value={bairro} onChange={(e) => setBairro(e.target.value)}>
        {["Centro", "Jardim das Flores", "Vila Nova"].map((b) => <option key={b}>{b}</option>)}
      </select>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="ac-label">Data</div>
          <input type="date" className="ac-input" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="ac-label">Horário</div>
          <input type="time" className="ac-input" value={hora} onChange={(e) => setHora(e.target.value)} />
        </div>
      </div>

      <div className="ac-label">Duração (horas)</div>
      <input type="number" className="ac-input" style={{ marginBottom: 10 }} value={duracao} onChange={(e) => setDuracao(e.target.value)} />

      <div className="ac-chip" style={{ marginBottom: 14, display: "inline-flex" }} onClick={() => setRepete(!repete)}>
        <input type="checkbox" checked={repete} readOnly /> Repetir (ex.: diariamente / dias fixos)
      </div>

      <div className="ac-label">Atividades necessárias — definem a categoria exigida</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {ATIVIDADES.map((a) => (
          <div key={a.id} className={"ac-chip " + (atividades.includes(a.id) ? "on" : "")} onClick={() => toggleAtividade(a.id)}>
            {a.nome}
          </div>
        ))}
      </div>
      {atividades.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <Cracha label={"Exige categoria: " + CATEGORIA_LABEL[catExigida]} color={CATEGORIA_COR[catExigida]} />
        </div>
      )}

      <div className="ac-label">Informações do paciente</div>
      <div className="ac-card" style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12.5 }}>Idade:</span>
          <input type="number" className="ac-input" style={{ width: 70 }} value={idade} onChange={(e) => setIdade(e.target.value)} />
        </div>
        {[["Anda sozinho", andaSozinho, setAndaSozinho], ["Usa sonda", sonda, setSonda], ["Usa oxigênio", oxigenio, setOxigenio]].map(([label, v, setter]) => (
          <div key={label} className="ac-chip" style={{ display: "inline-flex", width: "fit-content" }} onClick={() => setter(!v)}>
            <input type="checkbox" checked={v} readOnly /> {label}
          </div>
        ))}
      </div>

      <div className="ac-label">Valor oferecido (R$)</div>
      <input type="number" className="ac-input" style={{ marginBottom: 18 }} value={valor} onChange={(e) => setValor(e.target.value)} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className="ac-btn ac-btn-ghost" style={{ flex: 1 }} onClick={() => salvar(true)}>Salvar rascunho</button>
        <button className="ac-btn ac-btn-primary" style={{ flex: 1 }} onClick={() => salvar(false)}>Publicar</button>
      </div>
    </div>
  );
}

function BuscaCuidadores({ ctx }) {
  const { state, persist, nav, goTo, goBack, showToast } = ctx;
  const atendimento = atendimentoPorId(state, nav.params.atendimentoId);
  const [selecionados, setSelecionados] = useState([]);
  const [publicacaoAberta, setPublicacaoAberta] = useState(false);

  if (!atendimento) return <EmptyState text="Atendimento não encontrado." />;

  const compativeis = cuidadoresCompativeis(state, atendimento);
  const catExigida = categoriaExigida(atendimento.atividades);

  const toggle = (id) => setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const enviarConvites = () => {
    if (!publicacaoAberta && selecionados.length === 0) { showToast("Selecione ao menos um cuidador ou marque publicação aberta."); return; }
    const novosConvites = selecionados.map((cid) => ({
      id: "cv_" + Date.now() + cid, atendimentoId: atendimento.id, cuidadorId: cid, status: "enviado", criadoEm: new Date().toISOString(),
    }));
    persist((s) => ({
      ...s,
      convites: [...s.convites, ...novosConvites],
      atendimentos: s.atendimentos.map((a) => a.id === atendimento.id ? { ...a, status: "convite_enviado", publicacaoAberta } : a),
    }));
    selecionados.forEach((cid) => notificar(persist, "cuidador", cid, "convite", `Você recebeu um convite para um atendimento em ${atendimento.endereco.bairro}.`));
    showToast(publicacaoAberta ? "Publicação aberta ativada." : `Convite enviado para ${selecionados.length} cuidador(es).`);
    goTo("empresa_inicio");
  };

  return (
    <div className="ac-content">
      <TopBar title="Cuidadores compatíveis" subtitle={atendimento.endereco.bairro + " · exige " + CATEGORIA_LABEL[catExigida]} onBack={goBack} />

      <div className="ac-chip" style={{ marginBottom: 12, display: "inline-flex" }} onClick={() => setPublicacaoAberta(!publicacaoAberta)}>
        <input type="checkbox" checked={publicacaoAberta} readOnly /> Publicação aberta (qualquer compatível pode se candidatar)
      </div>

      {compativeis.length === 0 && (
        <EmptyState text={`Nenhum cuidador ${CATEGORIA_LABEL[catExigida].toLowerCase()} disponível neste bairro agora (regras R1/R2/R3 aplicadas).`} />
      )}

      {compativeis.map((c) => {
        const nota = notaMediaCuidador(state, c.id);
        const favorito = state.empresa.favoritos.includes(c.id);
        return (
          <div key={c.id} className="ac-card" style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 8, cursor: "pointer" }} onClick={() => goTo("perfil_cuidador", { cuidadorId: c.id, atendimentoId: atendimento.id })}>
                <Avatar nome={c.nome} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome} {favorito && "★"}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{nota ? `Nota ${nota}` : "Novo — sem média ainda"} · {c.experienciaAnos} anos</div>
                </div>
              </div>
              <div className={"ac-chip " + (selecionados.includes(c.id) ? "on" : "")} onClick={() => toggle(c.id)}>
                {selecionados.includes(c.id) ? "Selecionado" : "Convidar"}
              </div>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <CuidadorCategoriaCracha cuidador={c} />
              {c.seloVerificado && <Cracha label="Verificado" color="#16241F" icon={<ShieldCheck size={11} />} />}
            </div>
          </div>
        );
      })}

      {compativeis.length > 0 && (
        <button className="ac-btn ac-btn-primary ac-btn-block" style={{ marginTop: 10 }} onClick={enviarConvites}>
          {publicacaoAberta ? "Ativar publicação aberta" : `Enviar convite (${selecionados.length})`}
        </button>
      )}
    </div>
  );
}

function PerfilCuidador({ ctx, viewer }) {
  const { state, nav, goBack, persist, showToast } = ctx;
  const c = cuidadorPorId(state, nav.params.cuidadorId);
  if (!c) return <EmptyState text="Cuidador não encontrado." />;
  const nota = notaMediaCuidador(state, c.id);
  const favorito = state.empresa.favoritos.includes(c.id);

  const toggleFavorito = () => {
    persist((s) => ({
      ...s,
      empresa: { ...s.empresa, favoritos: favorito ? s.empresa.favoritos.filter((x) => x !== c.id) : [...s.empresa.favoritos, c.id] },
    }));
    showToast(favorito ? "Removido dos favoritos." : "Adicionado aos favoritos.");
  };

  return (
    <div className="ac-content">
      <TopBar title="Perfil do cuidador" onBack={goBack} />
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <Avatar nome={c.nome} size={64} />
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>{c.nome}</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{nota ? `★ ${nota} de avaliação` : "Ainda sem média (menos de 3 avaliações — R10)"}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
          <CuidadorCategoriaCracha cuidador={c} />
          {c.seloVerificado && <Cracha label="Verificado" color="#16241F" icon={<ShieldCheck size={11} />} />}
          {c.registroConselho && <Cracha label={c.registroConselho} color="#16241F" />}
        </div>
      </div>

      {viewer === "empresa" && (
        <button className="ac-btn ac-btn-ghost ac-btn-block" style={{ marginBottom: 14 }} onClick={toggleFavorito}>
          <Heart size={14} fill={favorito ? "var(--st-cancelado)" : "none"} color={favorito ? "var(--st-cancelado)" : "var(--ink)"} />
          {favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        </button>
      )}

      <SectionLabel text="Apresentação" />
      <div className="ac-card" style={{ marginBottom: 12, fontSize: 13 }}>{c.apresentacao}</div>

      <SectionLabel text="Atividades que realiza" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {c.atividades.map((id) => <span key={id} className="ac-chip">{ATIVIDADES.find((a) => a.id === id)?.nome}</span>)}
      </div>

      <SectionLabel text="Disponibilidade" />
      <div className="ac-card" style={{ marginBottom: 12, fontSize: 12.5 }}>
        Dias: {c.disponibilidade.dias.join(", ")}<br />Turnos: {c.disponibilidade.turnos.join(", ")}
      </div>

      <SectionLabel text="Valor pretendido" />
      <div className="ac-mono" style={{ fontSize: 14, marginBottom: 12 }}>R$ {c.valorPlantao} / plantão</div>
    </div>
  );
}

function CandidaturasRecebidas({ ctx }) {
  const { state, persist, nav, goBack, showToast, goTo } = ctx;
  const atendimento = atendimentoPorId(state, nav.params.atendimentoId);
  if (!atendimento) return <EmptyState text="Atendimento não encontrado." />;
  const cands = state.candidaturas.filter((cd) => cd.atendimentoId === atendimento.id && cd.status === "pendente");

  const confirmar = (cand) => {
    const cuidador = cuidadorPorId(state, cand.cuidadorId);
    if (temSobreposicao(state, cuidador.id, atendimento)) {
      showToast("Bloqueado: esse cuidador já tem outro atendimento confirmado nesse horário (R4).");
      return;
    }
    persist((s) => ({
      ...s,
      atendimentos: s.atendimentos.map((a) => a.id === atendimento.id ? { ...a, status: "confirmado", cuidadorConfirmadoId: cuidador.id } : a),
      candidaturas: s.candidaturas.map((cd) => cd.atendimentoId === atendimento.id
        ? { ...cd, status: cd.id === cand.id ? "confirmada" : "nao_selecionada" } : cd),
    }));
    notificar(persist, "cuidador", cuidador.id, "confirmacao", "Você foi confirmado(a)! O endereço completo já está liberado (R5).");
    cands.filter((c) => c.id !== cand.id).forEach((c) => notificar(persist, "cuidador", c.cuidadorId, "confirmacao", "A vaga já foi preenchida por outro cuidador."));
    showToast(`${cuidador.nome} confirmada(o). Demais candidatos foram avisados.`);
    goTo("empresa_inicio");
  };

  return (
    <div className="ac-content">
      <TopBar title="Candidaturas recebidas" subtitle={atendimento.endereco.bairro} onBack={goBack} />
      {cands.length === 0 && <EmptyState text="Nenhuma candidatura pendente." />}
      {cands.map((cd) => {
        const c = cuidadorPorId(state, cd.cuidadorId);
        const nota = notaMediaCuidador(state, c.id);
        return (
          <div key={cd.id} className="ac-card" style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Avatar nome={c.nome} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{nota ? `Nota ${nota}` : "Sem média ainda"}</div>
              </div>
              <CuidadorCategoriaCracha cuidador={c} />
            </div>
            <button className="ac-btn ac-btn-primary ac-btn-block" style={{ marginTop: 10 }} onClick={() => confirmar(cd)}>
              Confirmar {c.nome.split(" ")[0]}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function EmpresaEscala({ ctx }) {
  const { state, goTo } = ctx;
  const meus = state.atendimentos
    .filter((a) => a.empresaId === state.empresa.id && a.status !== "rascunho")
    .sort((a, b) => (a.dataInicio < b.dataInicio ? -1 : 1));

  return (
    <div className="ac-content">
      <TopBar title="Escala da empresa" subtitle="Semana e status de cada atendimento" />
      {meus.length === 0 && <EmptyState text="Nenhum atendimento na escala." />}
      {meus.map((a) => {
        const cuidador = a.cuidadorConfirmadoId ? cuidadorPorId(state, a.cuidadorConfirmadoId) : null;
        return (
          <div key={a.id} className="ac-card" style={{ marginBottom: 8, cursor: "pointer" }} onClick={() => goTo("detalhe_atendimento", { atendimentoId: a.id })}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div className="ac-mono" style={{ fontSize: 12 }}>{a.dataInicio.slice(8, 10)}/{a.dataInicio.slice(5, 7)} · {a.horaInicio}</div>
                <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 2 }}>{a.endereco.bairro}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{cuidador ? cuidador.nome : "Sem cuidador confirmado"}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmpresaPerfil({ ctx, onLogout }) {
  const { state, goTo } = ctx;
  return (
    <div className="ac-content">
      <TopBar title="Perfil e configurações" />
      <div className="ac-card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{state.empresa.nome}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>CNPJ {state.empresa.cnpj}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{state.empresa.cidade}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{state.empresa.telefone} · {state.empresa.email}</div>
      </div>
      <RowLink icon={<Heart size={16} />} label="Cuidadores favoritos" onClick={() => goTo("favoritos")} />
      <RowLink icon={<FileText size={16} />} label="Relatório de horas" onClick={() => goTo("relatorio_horas")} />
      <div style={{ marginTop: 20 }}>
        <button className="ac-btn ac-btn-ghost ac-btn-block" onClick={onLogout}><LogOut size={14} /> Sair</button>
      </div>
    </div>
  );
}

function RowLink({ icon, label, onClick }) {
  return (
    <div className="ac-row" style={{ cursor: "pointer" }} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{icon}<span style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</span></div>
      <ChevronLeft size={16} style={{ transform: "rotate(180deg)" }} />
    </div>
  );
}

function FavoritosScreen({ ctx }) {
  const { state, goBack, goTo } = ctx;
  const favoritos = state.cuidadores.filter((c) => state.empresa.favoritos.includes(c.id));
  return (
    <div className="ac-content">
      <TopBar title="Cuidadores favoritos" onBack={goBack} />
      {favoritos.length === 0 && <EmptyState text="Nenhum favorito ainda." />}
      {favoritos.map((c) => (
        <div key={c.id} className="ac-card" style={{ marginBottom: 8, cursor: "pointer" }} onClick={() => goTo("perfil_cuidador", { cuidadorId: c.id })}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Avatar nome={c.nome} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome}</div>
              <CuidadorCategoriaCracha cuidador={c} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatorioHoras({ ctx }) {
  const { state, goBack, showToast } = ctx;
  const cuidadoresComHoras = state.cuidadores.map((c) => ({ c, horas: horasFechadas(state, c.id) })).filter((x) => x.horas.length > 0);
  const totalGeral = cuidadoresComHoras.reduce((s, x) => s + x.horas.reduce((s2, h) => s2 + parseFloat(h.horas), 0), 0);

  const exportar = () => showToast("Exportação simulada — em produção geraria uma planilha real.");

  return (
    <div className="ac-content">
      <TopBar title="Relatório de horas" subtitle="Calculado a partir de check-in/check-out" onBack={goBack} />
      <div className="ac-card" style={{ marginBottom: 14, textAlign: "center" }}>
        <div className="ac-mono" style={{ fontSize: 22, fontWeight: 700 }}>{totalGeral.toFixed(1)}h</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>total fechado no período</div>
      </div>
      {cuidadoresComHoras.map(({ c, horas }) => (
        <div key={c.id} className="ac-card" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome}</span>
            <span className="ac-mono" style={{ fontSize: 13 }}>{horas.reduce((s, h) => s + parseFloat(h.horas), 0).toFixed(1)}h</span>
          </div>
          {horas.map((h) => (
            <div key={h.atendimentoId} className="ac-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{h.data} — {h.horas}h</div>
          ))}
        </div>
      ))}
      <button className="ac-btn ac-btn-secondary ac-btn-block" style={{ marginTop: 10 }} onClick={exportar}>
        <Download size={14} /> Exportar planilha
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 10. APP DO CUIDADOR                                                   */
/* -------------------------------------------------------------------- */

function CuidadorApp({ ctx, onLogout, notifOpen, setNotifOpen }) {
  const { nav, goTo, session, state } = ctx;
  const cuidador = cuidadorPorId(state, session.id);
  const tab = ["cuidador_inicio", "cuidador_agenda", "cuidador_conversas", "cuidador_perfil"].includes(nav.screen) ? nav.screen : null;

  if (cuidador && cuidador.statusCadastro !== "aprovado") {
    return <AguardandoAprovacao ctx={ctx} cuidador={cuidador} onLogout={onLogout} />;
  }

  return (
    <>
      {nav.screen === "cuidador_inicio" && <CuidadorInicio ctx={ctx} notifOpen={notifOpen} setNotifOpen={setNotifOpen} />}
      {nav.screen === "detalhe_atendimento" && <DetalheAtendimento ctx={ctx} viewer="cuidador" />}
      {nav.screen === "cuidador_agenda" && <CuidadorAgenda ctx={ctx} />}
      {nav.screen === "checkin_checkout" && <CheckinCheckout ctx={ctx} />}
      {nav.screen === "registro_atendimento" && <RegistroAtendimento ctx={ctx} />}
      {nav.screen === "conversa" && <ConversaScreen ctx={ctx} viewer="cuidador" />}
      {nav.screen === "cuidador_conversas" && <ListaConversas ctx={ctx} viewer="cuidador" />}
      {nav.screen === "avaliacao" && <AvaliacaoScreen ctx={ctx} viewer="cuidador" />}
      {nav.screen === "cuidador_perfil" && <CuidadorPerfilConfig ctx={ctx} onLogout={onLogout} />}

      {tab && (
        <div className="ac-tabbar">
          <TabItem icon={<Home size={19} />} label="Início" active={tab === "cuidador_inicio"} onClick={() => goTo("cuidador_inicio")} />
          <TabItem icon={<Calendar size={19} />} label="Agenda" active={tab === "cuidador_agenda"} onClick={() => goTo("cuidador_agenda")} />
          <TabItem icon={<MessageSquare size={19} />} label="Conversas" active={tab === "cuidador_conversas"} onClick={() => goTo("cuidador_conversas")} />
          <TabItem icon={<User size={19} />} label="Perfil" active={tab === "cuidador_perfil"} onClick={() => goTo("cuidador_perfil")} />
        </div>
      )}
      <div className="ac-home-indicator" />
    </>
  );
}

function AguardandoAprovacao({ ctx, cuidador, onLogout }) {
  const mapa = { em_analise: ["Em análise", "var(--accent)"], recusado: ["Recusado", "var(--st-cancelado)"] };
  const [label, cor] = mapa[cuidador.statusCadastro] || ["Em análise", "var(--accent)"];
  return (
    <div className="ac-content" style={{ paddingTop: 60, textAlign: "center" }}>
      <Clock size={36} color={cor} style={{ marginBottom: 10 }} />
      <div className="ac-display" style={{ fontSize: 19 }}>Cadastro {label.toLowerCase()}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, marginBottom: 16 }}>
        {cuidador.statusCadastro === "recusado"
          ? cuidador.motivoRecusa || "Documento não aprovado."
          : "Assim que a conferência dos documentos for concluída, você poderá receber convites (R1)."}
      </div>
      <button className="ac-btn ac-btn-ghost" onClick={onLogout}>Voltar à entrada</button>
    </div>
  );
}

function CuidadorInicio({ ctx, notifOpen, setNotifOpen }) {
  const { state, session, goTo } = ctx;
  const cuidador = cuidadorPorId(state, session.id);
  const meusConfirmados = state.atendimentos.filter((a) => a.cuidadorConfirmadoId === cuidador.id && ["confirmado", "em_andamento"].includes(a.status))
    .sort((a, b) => (a.dataInicio < b.dataInicio ? -1 : 1));
  const proximo = meusConfirmados[0];

  const convitesRecebidos = state.convites.filter((cv) => cv.cuidadorId === cuidador.id && cv.status === "enviado");
  const abertasPublicas = state.atendimentos.filter((a) =>
    a.publicacaoAberta && a.status !== "confirmado" && cuidadoresCompativeis(state, a).some((c) => c.id === cuidador.id)
    && !state.candidaturas.some((cd) => cd.atendimentoId === a.id && cd.cuidadorId === cuidador.id));

  return (
    <div className="ac-content">
      <TopBar title={cuidador.nome.split(" ")[0]} subtitle="Início do cuidador"
        right={<NotificationBell ctx={ctx} tipo="cuidador" id={cuidador.id} open={notifOpen} setOpen={setNotifOpen} />} />

      <SectionLabel text="Próximo atendimento" />
      {!proximo && <EmptyState text="Nenhum atendimento confirmado no momento." />}
      {proximo && <AtendimentoRow a={proximo} onClick={() => goTo("detalhe_atendimento", { atendimentoId: proximo.id })} />}

      <SectionLabel text={`Convites recebidos (${convitesRecebidos.length})`} />
      {convitesRecebidos.length === 0 && <EmptyState text="Nenhum convite pendente." />}
      {convitesRecebidos.map((cv) => {
        const a = atendimentoPorId(state, cv.atendimentoId);
        return <AtendimentoRow key={cv.id} a={a} onClick={() => goTo("detalhe_atendimento", { atendimentoId: a.id, convite: true })} />;
      })}

      <SectionLabel text={`Publicações abertas compatíveis (${abertasPublicas.length})`} />
      {abertasPublicas.length === 0 && <EmptyState text="Nenhuma publicação aberta compatível agora." />}
      {abertasPublicas.map((a) => <AtendimentoRow key={a.id} a={a} onClick={() => goTo("detalhe_atendimento", { atendimentoId: a.id, aberta: true })} />)}
    </div>
  );
}

function CuidadorAgenda({ ctx }) {
  const { state, session, goTo } = ctx;
  const cuidador = cuidadorPorId(state, session.id);
  const meus = state.atendimentos.filter((a) => a.cuidadorConfirmadoId === cuidador.id).sort((a, b) => (a.dataInicio < b.dataInicio ? -1 : 1));
  return (
    <div className="ac-content">
      <TopBar title="Minha agenda" />
      {meus.length === 0 && <EmptyState text="Nenhum atendimento na agenda." />}
      {meus.map((a) => <AtendimentoRow key={a.id} a={a} onClick={() => goTo("detalhe_atendimento", { atendimentoId: a.id })} />)}
    </div>
  );
}

function CuidadorPerfilConfig({ ctx, onLogout }) {
  const { state, session } = ctx;
  const cuidador = cuidadorPorId(state, session.id);
  return (
    <div className="ac-content">
      <TopBar title="Perfil e configurações" />
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <Avatar nome={cuidador.nome} size={60} />
        <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6 }}>{cuidador.nome}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 6 }}>
          <CuidadorCategoriaCracha cuidador={cuidador} />
          {cuidador.seloVerificado && <Cracha label="Verificado" color="#16241F" icon={<ShieldCheck size={11} />} />}
        </div>
      </div>
      <SectionLabel text="Disponibilidade" />
      <div className="ac-card" style={{ marginBottom: 12, fontSize: 12.5 }}>
        Dias: {cuidador.disponibilidade.dias.join(", ")}<br />Turnos: {cuidador.disponibilidade.turnos.join(", ")}
      </div>
      <SectionLabel text="Valor pretendido" />
      <div className="ac-mono" style={{ fontSize: 14, marginBottom: 14 }}>R$ {cuidador.valorPlantao} / plantão</div>
      <button className="ac-btn ac-btn-ghost ac-btn-block" onClick={onLogout}><LogOut size={14} /> Sair</button>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 11. TELAS COMPARTILHADAS — DETALHE, CHECK-IN/OUT, REGISTRO, CHAT,     */
/*     AVALIAÇÃO                                                         */
/* -------------------------------------------------------------------- */

function DetalheAtendimento({ ctx, viewer }) {
  const { state, session, persist, nav, goBack, goTo, showToast } = ctx;
  const a = atendimentoPorId(state, nav.params.atendimentoId);
  if (!a) return <EmptyState text="Atendimento não encontrado." />;
  const cuidador = a.cuidadorConfirmadoId ? cuidadorPorId(state, a.cuidadorConfirmadoId) : null;
  const catExigida = categoriaExigida(a.atividades);
  const enderecoLiberado = viewer === "empresa" || (cuidador && cuidador.id === session.id);

  const cvPendente = viewer === "cuidador" && state.convites.find((cv) => cv.atendimentoId === a.id && cv.cuidadorId === session.id && cv.status === "enviado");
  const jaCandidatado = viewer === "cuidador" && state.candidaturas.some((cd) => cd.atendimentoId === a.id && cd.cuidadorId === session.id);

  const aceitarConvite = () => {
    if (temSobreposicao(state, session.id, a)) { showToast("Você já tem outro atendimento confirmado nesse horário (R4)."); return; }
    persist((s) => ({
      ...s,
      convites: s.convites.map((cv) => cv.id === cvPendente.id ? { ...cv, status: "aceito" } : cv),
      candidaturas: [...s.candidaturas, { id: "cd_" + Date.now(), atendimentoId: a.id, cuidadorId: session.id, status: "pendente", criadoEm: new Date().toISOString() }],
      atendimentos: s.atendimentos.map((at) => at.id === a.id ? { ...at, status: "candidaturas_recebidas" } : at),
    }));
    notificar(persist, "empresa", state.empresa.id, "candidatura", `${cuidadorPorId(state, session.id).nome} aceitou o convite e se candidatou.`);
    showToast("Convite aceito — aguardando confirmação da empresa.");
  };
  const recusarConvite = () => {
    persist((s) => ({ ...s, convites: s.convites.map((cv) => cv.id === cvPendente.id ? { ...cv, status: "recusado" } : cv) }));
    showToast("Convite recusado.");
    goBack();
  };
  const candidatarAberta = () => {
    if (temSobreposicao(state, session.id, a)) { showToast("Você já tem outro atendimento confirmado nesse horário (R4)."); return; }
    persist((s) => ({
      ...s,
      candidaturas: [...s.candidaturas, { id: "cd_" + Date.now(), atendimentoId: a.id, cuidadorId: session.id, status: "pendente", criadoEm: new Date().toISOString() }],
      atendimentos: s.atendimentos.map((at) => at.id === a.id ? { ...at, status: "candidaturas_recebidas" } : at),
    }));
    notificar(persist, "empresa", state.empresa.id, "candidatura", `${cuidadorPorId(state, session.id).nome} se candidatou à publicação aberta.`);
    showToast("Candidatura enviada.");
  };

  const cancelar = () => {
    const agora = new Date();
    const inicio = new Date(a.dataInicio + "T" + a.horaInicio);
    const antecedenciaHoras = Math.round((inicio - agora) / 3600000);
    persist((s) => ({
      ...s,
      atendimentos: s.atendimentos.map((at) => at.id === a.id ? {
        ...at, status: "cancelado",
        canceladoInfo: { quem: viewer === "empresa" ? "Empresa" : "Cuidador", quando: agora.toISOString(), motivo: "Cancelado durante a demo.", antecedenciaHoras },
      } : at),
      log: [...s.log, { id: "l_" + Date.now(), acao: "Cancelamento", quem: viewer === "empresa" ? "Empresa" : "Cuidador",
        quando: agora.toISOString(), detalhe: `Atendimento ${a.id} cancelado com ${antecedenciaHoras}h de antecedência.` + (antecedenciaHoras < 12 ? " (< 12h — R8)" : "") }],
    }));
    showToast(antecedenciaHoras < 12 ? "Cancelado — ficará marcado no histórico (R8, menos de 12h)." : "Atendimento cancelado.");
    goBack();
  };

  return (
    <div className="ac-content">
      <TopBar title="Detalhe do atendimento" onBack={goBack} />
      <StatusStepper current={a.status} />
      <div className="ac-divider" />

      <div className="ac-card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 6 }}>
          {enderecoLiberado ? `${a.endereco.rua}, ${a.endereco.numero}` : `Bairro ${a.endereco.bairro} (endereço completo após confirmação — R5)`}
        </div>
        <div className="ac-mono" style={{ fontSize: 12.5, color: "var(--muted)" }}>
          {a.dataInicio} · {a.horaInicio} · {a.duracaoHoras}h {a.repete ? " · " + a.repeticaoDescricao : ""}
        </div>
        <div style={{ marginTop: 8 }}><Cracha label={"Exige " + CATEGORIA_LABEL[catExigida]} color={CATEGORIA_COR[catExigida]} /></div>
      </div>

      <SectionLabel text="Tarefas / atividades" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {a.atividades.map((id) => <span key={id} className="ac-chip">{ATIVIDADES.find((x) => x.id === id)?.nome}</span>)}
      </div>

      <SectionLabel text="Informações do paciente" />
      <div className="ac-card" style={{ marginBottom: 12, fontSize: 12.5, lineHeight: 1.6 }}>
        Idade: {a.paciente.idade} anos<br />
        Anda sozinho: {a.paciente.andaSozinho ? "sim" : "não"}<br />
        Sonda: {a.paciente.sonda ? "sim" : "não"} · Oxigênio: {a.paciente.oxigenio ? "sim" : "não"}<br />
        Animais em casa: {a.paciente.animais}
      </div>

      {cuidador && (
        <>
          <SectionLabel text="Cuidador confirmado" />
          <div className="ac-card" style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", cursor: viewer === "empresa" ? "pointer" : "default" }}
            onClick={() => viewer === "empresa" && goTo("perfil_cuidador", { cuidadorId: cuidador.id })}>
            <Avatar nome={cuidador.nome} />
            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{cuidador.nome}</div><CuidadorCategoriaCracha cuidador={cuidador} /></div>
          </div>
        </>
      )}

      {a.canceladoInfo && (
        <div className="ac-card" style={{ marginBottom: 12, borderColor: "var(--st-cancelado)" }}>
          <div style={{ fontSize: 12.5 }}>Cancelado por {a.canceladoInfo.quem} · {a.canceladoInfo.antecedenciaHoras}h de antecedência</div>
          {a.canceladoInfo.antecedenciaHoras < 12 && <div style={{ fontSize: 11.5, color: "var(--st-cancelado)", marginTop: 3 }}>Marcado no histórico das duas partes (R8)</div>}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {viewer === "cuidador" && cvPendente && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ac-btn ac-btn-ghost" style={{ flex: 1 }} onClick={recusarConvite}>Recusar</button>
            <button className="ac-btn ac-btn-secondary" style={{ flex: 1 }} onClick={() => goTo("conversa", { atendimentoId: a.id })}>Perguntar</button>
            <button className="ac-btn ac-btn-primary" style={{ flex: 1 }} onClick={aceitarConvite}>Aceitar</button>
          </div>
        )}
        {viewer === "cuidador" && !cvPendente && a.publicacaoAberta && !jaCandidatado && a.status !== "confirmado" && (
          <button className="ac-btn ac-btn-primary ac-btn-block" onClick={candidatarAberta}>Candidatar-se</button>
        )}
        {a.status === "confirmado" && viewer === "cuidador" && cuidador && cuidador.id === session.id && (
          <button className="ac-btn ac-btn-primary ac-btn-block" onClick={() => goTo("checkin_checkout", { atendimentoId: a.id })}>Ir para check-in / check-out</button>
        )}
        {a.status === "em_andamento" && viewer === "cuidador" && (
          <>
            <button className="ac-btn ac-btn-primary ac-btn-block" onClick={() => goTo("checkin_checkout", { atendimentoId: a.id })}>Check-in / check-out</button>
            <button className="ac-btn ac-btn-ghost ac-btn-block" onClick={() => goTo("registro_atendimento", { atendimentoId: a.id })}>Registro do atendimento</button>
          </>
        )}
        {["concluido", "avaliado"].includes(a.status) && (
          <>
            <button className="ac-btn ac-btn-ghost ac-btn-block" onClick={() => goTo("registro_atendimento", { atendimentoId: a.id })}>Ver registro</button>
            <button className="ac-btn ac-btn-primary ac-btn-block" onClick={() => goTo("avaliacao", { atendimentoId: a.id })}>
              {a.status === "avaliado" ? "Ver avaliação" : "Avaliar"}
            </button>
          </>
        )}
        {cuidador && <button className="ac-btn ac-btn-ghost ac-btn-block" onClick={() => goTo("conversa", { atendimentoId: a.id })}><MessageSquare size={14} /> Conversa</button>}
        {["confirmado", "candidaturas_recebidas", "aberto"].includes(a.status) && (
          <button className="ac-btn ac-btn-destructive ac-btn-block" onClick={cancelar}>Cancelar atendimento</button>
        )}
      </div>
    </div>
  );
}

function CheckinCheckout({ ctx }) {
  const { state, session, persist, nav, goBack, showToast } = ctx;
  const a = atendimentoPorId(state, nav.params.atendimentoId);
  if (!a) return <EmptyState text="Atendimento não encontrado." />;

  const fazerCheckin = () => {
    const agora = new Date();
    const inicio = new Date(a.dataInicio + "T" + a.horaInicio);
    const atrasoMin = (agora - inicio) / 60000;
    persist((s) => ({
      ...s,
      atendimentos: s.atendimentos.map((at) => at.id === a.id ? { ...at, status: "em_andamento", checkinHorario: agora.toISOString(), checkinLocal: a.endereco.bairro + " (simulado)" } : at),
    }));
    if (atrasoMin > 15) {
      notificar(persist, "empresa", state.empresa.id, "atraso", `${cuidadorPorId(state, session.id).nome} fez check-in com mais de 15 min de atraso.`);
      showToast("Check-in registrado — atraso maior que 15 min notificado à empresa.");
    } else {
      showToast("Check-in registrado com sucesso.");
    }
  };
  const fazerCheckout = () => {
    if (!a.checkinHorario) { showToast("Não é possível fazer check-out sem check-in (R6)."); return; }
    persist((s) => ({ ...s, atendimentos: s.atendimentos.map((at) => at.id === a.id ? { ...at, status: "concluido", checkoutHorario: new Date().toISOString() } : at) }));
    showToast("Check-out registrado. Registro do atendimento foi travado (R7).");
  };

  return (
    <div className="ac-content">
      <TopBar title="Check-in e check-out" onBack={goBack} />
      <div className="ac-card" style={{ marginBottom: 14, textAlign: "center" }}>
        <MapPin size={22} style={{ marginBottom: 6 }} />
        <div style={{ fontWeight: 600, fontSize: 14 }}>{a.endereco.bairro}</div>
        <div className="ac-mono" style={{ fontSize: 12, color: "var(--muted)" }}>{a.dataInicio} · {a.horaInicio}</div>
      </div>

      <div className="ac-row">
        <span style={{ fontSize: 13 }}>Check-in</span>
        <span className="ac-mono" style={{ fontSize: 12 }}>{a.checkinHorario ? new Date(a.checkinHorario).toLocaleString("pt-BR") : "—"}</span>
      </div>
      <div className="ac-row">
        <span style={{ fontSize: 13 }}>Check-out</span>
        <span className="ac-mono" style={{ fontSize: 12 }}>{a.checkoutHorario ? new Date(a.checkoutHorario).toLocaleString("pt-BR") : "—"}</span>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="ac-btn ac-btn-primary ac-btn-block" disabled={!!a.checkinHorario} onClick={fazerCheckin}>Fazer check-in</button>
        <button className="ac-btn ac-btn-secondary ac-btn-block" disabled={!a.checkinHorario || !!a.checkoutHorario} onClick={fazerCheckout}>Fazer check-out</button>
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
        Nesta demo o horário e a localização são simulados. No produto real, o check-in funciona mesmo sem sinal e sincroniza depois.
      </div>
    </div>
  );
}

function RegistroAtendimento({ ctx }) {
  const { state, persist, nav, goBack, showToast } = ctx;
  const a = atendimentoPorId(state, nav.params.atendimentoId);
  if (!a) return <EmptyState text="Atendimento não encontrado." />;
  const registro = state.registros[a.id] || { atendimentoId: a.id, tarefas: a.atividades.map((id, i) => ({ id: "t" + i, nome: ATIVIDADES.find((x) => x.id === id)?.nome, feito: false })), observacoes: [], sinaisVitais: "", fotos: 0, fechado: false };
  const [novaObs, setNovaObs] = useState("");

  const salvarRegistro = (novo) => persist((s) => ({ ...s, registros: { ...s.registros, [a.id]: novo } }));

  const toggleTarefa = (id) => {
    if (registro.fechado) { showToast("Registro travado após o check-out (R7). Use uma nova observação."); return; }
    salvarRegistro({ ...registro, tarefas: registro.tarefas.map((t) => t.id === id ? { ...t, feito: !t.feito } : t) });
  };
  const addObservacao = () => {
    if (!novaObs.trim()) return;
    salvarRegistro({ ...registro, observacoes: [...registro.observacoes, { texto: novaObs, autor: "Você", horario: new Date().toISOString() }] });
    setNovaObs("");
    showToast(registro.fechado ? "Nova observação adicionada (registro permanece travado)." : "Observação salva.");
  };

  return (
    <div className="ac-content">
      <TopBar title="Registro do atendimento" onBack={goBack} />
      {registro.fechado && (
        <div className="ac-card" style={{ marginBottom: 12, fontSize: 12, color: "var(--muted)" }}>
          <Info size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
          Registro travado após o check-out (R7). Correções entram como nova observação.
        </div>
      )}
      <SectionLabel text="Tarefas" />
      {registro.tarefas.map((t) => (
        <div key={t.id} className="ac-row" style={{ cursor: registro.fechado ? "default" : "pointer" }} onClick={() => toggleTarefa(t.id)}>
          <span style={{ fontSize: 13, textDecoration: t.feito ? "line-through" : "none", color: t.feito ? "var(--muted)" : "var(--ink)" }}>{t.nome}</span>
          {t.feito ? <Check size={16} color="var(--cat-informal)" /> : <span style={{ width: 16, height: 16, border: "1.5px solid var(--linha)", borderRadius: 4 }} />}
        </div>
      ))}

      <SectionLabel text="Observações" />
      {registro.observacoes.length === 0 && <EmptyState text="Nenhuma observação ainda." />}
      {registro.observacoes.map((o, i) => (
        <div key={i} className="ac-card" style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 12.5 }}>{o.texto}</div>
          <div className="ac-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{o.autor} · {new Date(o.horario).toLocaleString("pt-BR")}</div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <input className="ac-input" placeholder="Nova observação" value={novaObs} onChange={(e) => setNovaObs(e.target.value)} />
        <button className="ac-btn ac-btn-primary" onClick={addObservacao}><Send size={14} /></button>
      </div>

      <SectionLabel text="Fotos anexadas (simulado, até 3)" />
      <div style={{ fontSize: 12.5, marginBottom: 14 }}>{registro.fotos || 0} foto(s) anexada(s) — <span
        style={{ textDecoration: "underline", cursor: registro.fechado ? "default" : "pointer" }}
        onClick={() => !registro.fechado && registro.fotos < 3 && salvarRegistro({ ...registro, fotos: (registro.fotos || 0) + 1 })}>
        {registro.fechado ? "" : "anexar (simulado)"}</span></div>
    </div>
  );
}

function ListaConversas({ ctx, viewer }) {
  const { state, session, goTo } = ctx;
  const relevantes = viewer === "empresa"
    ? state.atendimentos.filter((a) => a.empresaId === state.empresa.id && a.cuidadorConfirmadoId)
    : state.atendimentos.filter((a) => a.cuidadorConfirmadoId === session.id || state.candidaturas.some((cd) => cd.atendimentoId === a.id && cd.cuidadorId === session.id));

  return (
    <div className="ac-content">
      <TopBar title="Conversas" />
      {relevantes.length === 0 && <EmptyState text="Nenhuma conversa ainda." />}
      {relevantes.map((a) => {
        const msgs = state.mensagens.filter((m) => m.atendimentoId === a.id);
        const ultima = msgs[msgs.length - 1];
        const outro = viewer === "empresa" ? cuidadorPorId(state, a.cuidadorConfirmadoId) : state.empresa;
        return (
          <div key={a.id} className="ac-card" style={{ marginBottom: 8, cursor: "pointer" }} onClick={() => goTo("conversa", { atendimentoId: a.id })}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Avatar nome={outro.nome} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{outro.nome}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ultima ? ultima.texto : "Sem mensagens ainda"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ConversaScreen({ ctx, viewer }) {
  const { state, persist, nav, goBack } = ctx;
  const a = atendimentoPorId(state, nav.params.atendimentoId);
  const [texto, setTexto] = useState("");
  if (!a) return <EmptyState text="Atendimento não encontrado." />;
  const msgs = state.mensagens.filter((m) => m.atendimentoId === a.id);

  const enviar = () => {
    if (!texto.trim()) return;
    persist((s) => ({ ...s, mensagens: [...s.mensagens, { id: "m_" + Date.now(), atendimentoId: a.id, de: viewer, texto, horario: new Date().toISOString() }] }));
    if (a.cuidadorConfirmadoId) {
      notificar(persist, viewer === "empresa" ? "cuidador" : "empresa", viewer === "empresa" ? a.cuidadorConfirmadoId : state.empresa.id, "mensagem", "Nova mensagem sobre um atendimento.");
    }
    setTexto("");
  };

  return (
    <div className="ac-content" style={{ display: "flex", flexDirection: "column" }}>
      <TopBar title="Conversa" subtitle={a.endereco.bairro} onBack={goBack} />
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 8 }}>
        {msgs.length === 0 && <EmptyState text="Envie a primeira mensagem." />}
        {msgs.map((m) => <div key={m.id} className={"ac-bubble " + (m.de === viewer ? "mine" : "theirs")}>{m.texto}</div>)}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input className="ac-input" placeholder="Escreva uma mensagem" value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} />
        <button className="ac-btn ac-btn-primary" onClick={enviar}><Send size={14} /></button>
      </div>
    </div>
  );
}

function AvaliacaoScreen({ ctx, viewer }) {
  const { state, persist, nav, goBack, showToast } = ctx;
  const a = atendimentoPorId(state, nav.params.atendimentoId);
  if (!a) return <EmptyState text="Atendimento não encontrado." />;
  const jaAvaliado = state.avaliacoes.find((av) => av.atendimentoId === a.id && av.de === viewer);
  const [nota, setNota] = useState(jaAvaliado ? jaAvaliado.nota : 5);
  const [comentario, setComentario] = useState(jaAvaliado ? jaAvaliado.comentario : "");
  const podeAvaliar = ["concluido", "avaliado"].includes(a.status); // R9

  const enviar = () => {
    if (!podeAvaliar) { showToast("Avaliação só é liberada após o atendimento concluído (R9)."); return; }
    persist((s) => ({
      ...s,
      avaliacoes: [...s.avaliacoes.filter((av) => !(av.atendimentoId === a.id && av.de === viewer)),
        { id: "av_" + Date.now(), atendimentoId: a.id, de: viewer, cuidadorId: a.cuidadorConfirmadoId, nota, comentario, criadoEm: new Date().toISOString() }],
      atendimentos: s.atendimentos.map((at) => at.id === a.id ? { ...at, status: "avaliado" } : at),
    }));
    showToast("Avaliação registrada.");
    goBack();
  };

  return (
    <div className="ac-content">
      <TopBar title="Avaliação" onBack={goBack} />
      {!podeAvaliar && <EmptyState text="Disponível após o atendimento concluído (R9)." />}
      {podeAvaliar && (
        <>
          <div className="ac-label">Nota</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={26} style={{ cursor: "pointer" }} fill={n <= nota ? "var(--accent)" : "none"} color={n <= nota ? "var(--accent)" : "var(--linha)"} onClick={() => setNota(n)} />
            ))}
          </div>
          <div className="ac-label">Comentário</div>
          <textarea className="ac-textarea" rows={4} style={{ marginBottom: 14 }} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Como foi o atendimento?" />
          <button className="ac-btn ac-btn-primary ac-btn-block" onClick={enviar}>{jaAvaliado ? "Atualizar avaliação" : "Enviar avaliação"}</button>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* 12. ÁREA DE ADMINISTRAÇÃO (desktop)                                   */
/* -------------------------------------------------------------------- */

function AdminArea({ ctx, onLogout, onReset }) {
  const [tela, setTela] = useState("fila");
  const [confirmReset, setConfirmReset] = useState(false);
  const { state } = ctx;

  return (
    <div className="ac-admin-shell">
      <div className="ac-admin-sidebar">
        <div className="ac-display" style={{ fontSize: 16, marginBottom: 10 }}>Acalento · Admin</div>
        <div className={"ac-admin-navitem " + (tela === "fila" ? "active" : "")} onClick={() => setTela("fila")}><ClipboardList size={15} /> Fila de aprovação</div>
        <div className={"ac-admin-navitem " + (tela === "empresas" ? "active" : "")} onClick={() => setTela("empresas")}><Briefcase size={15} /> Empresas</div>
        <div className={"ac-admin-navitem " + (tela === "cuidadores" ? "active" : "")} onClick={() => setTela("cuidadores")}><Users size={15} /> Cuidadores</div>
        <div className={"ac-admin-navitem " + (tela === "numeros" ? "active" : "")} onClick={() => setTela("numeros")}><FileText size={15} /> Números de uso</div>
        <div style={{ flex: 1 }} />
        <div className="ac-admin-navitem" onClick={onLogout}><LogOut size={15} /> Sair</div>
      </div>
      <div className="ac-admin-main">
        {tela === "fila" && <AdminFila ctx={ctx} />}
        {tela === "empresas" && <AdminEmpresas ctx={ctx} />}
        {tela === "cuidadores" && <AdminCuidadores ctx={ctx} />}
        {tela === "numeros" && <AdminNumeros ctx={ctx} onReset={() => setConfirmReset(true)} />}
      </div>
      {confirmReset && (
        <Modal title="Resetar a demo?" onClose={() => setConfirmReset(false)}>
          <div style={{ fontSize: 13, marginBottom: 16 }}>
            Isso apaga todas as ações feitas na demonstração e restaura o conjunto de dados inicial.
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="ac-btn ac-btn-ghost" onClick={() => setConfirmReset(false)}>Cancelar</button>
            <button className="ac-btn ac-btn-destructive" onClick={() => { setConfirmReset(false); onReset(); }}>Resetar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AdminFila({ ctx }) {
  const { state, persist, showToast } = ctx;
  const [motivoRecusa, setMotivoRecusa] = useState({});
  const pendentes = state.cuidadores.filter((c) => c.statusCadastro === "em_analise");

  const aprovar = (c) => {
    persist((s) => ({
      ...s,
      cuidadores: s.cuidadores.map((x) => x.id === c.id ? { ...x, statusCadastro: "aprovado", seloVerificado: true, registroStatus: x.registroConselho ? "aprovado" : x.registroStatus } : x),
      filaAprovacao: s.filaAprovacao.filter((f) => f.refId !== c.id),
      log: [...s.log, { id: "l_" + Date.now(), acao: "Cadastro aprovado", quem: "Admin", quando: new Date().toISOString(), detalhe: `${c.nome} aprovado(a).` }],
    }));
    notificar(persist, "cuidador", c.id, "aprovacao", "Seu cadastro foi aprovado! Você já pode receber convites.");
    showToast(`${c.nome} aprovado(a).`);
  };
  const recusar = (c) => {
    const motivo = motivoRecusa[c.id] || "Documentos não conferem.";
    persist((s) => ({
      ...s,
      cuidadores: s.cuidadores.map((x) => x.id === c.id ? { ...x, statusCadastro: "recusado", motivoRecusa: motivo } : x),
      filaAprovacao: s.filaAprovacao.filter((f) => f.refId !== c.id),
      log: [...s.log, { id: "l_" + Date.now(), acao: "Cadastro recusado", quem: "Admin", quando: new Date().toISOString(), detalhe: `${c.nome} recusado(a): ${motivo}` }],
    }));
    showToast(`${c.nome} recusado(a).`);
  };

  return (
    <div>
      <div className="ac-display" style={{ fontSize: 19, marginBottom: 4 }}>Fila de aprovação</div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 16 }}>{pendentes.length} cadastro(s) aguardando conferência</div>
      {pendentes.length === 0 && <EmptyState text="Nenhum cadastro pendente." />}
      {pendentes.map((c) => (
        <div key={c.id} className="ac-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar nome={c.nome} size={30} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.nome}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{c.registroConselho || "Sem registro de conselho (informal)"}</div>
              </div>
            </div>
            <CuidadorCategoriaCracha cuidador={c} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input className="ac-input" placeholder="Motivo (se recusar)" style={{ flex: 1 }}
              value={motivoRecusa[c.id] || ""} onChange={(e) => setMotivoRecusa((m) => ({ ...m, [c.id]: e.target.value }))} />
            <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => recusar(c)}><X size={13} /> Recusar</button>
            <button className="ac-btn ac-btn-primary ac-btn-sm" onClick={() => aprovar(c)}><Check size={13} /> Aprovar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminEmpresas({ ctx }) {
  const { state, persist, showToast } = ctx;
  const suspender = () => {
    persist((s) => ({
      ...s, empresa: { ...s.empresa, status: s.empresa.status === "aprovado" ? "suspensa" : "aprovado" },
      log: [...s.log, { id: "l_" + Date.now(), acao: s.empresa.status === "aprovado" ? "Empresa suspensa" : "Empresa reativada", quem: "Admin", quando: new Date().toISOString(), detalhe: s.empresa.nome }],
    }));
    showToast(state.empresa.status === "aprovado" ? "Empresa suspensa (R11)." : "Empresa reativada.");
  };
  return (
    <div>
      <div className="ac-display" style={{ fontSize: 19, marginBottom: 16 }}>Empresas</div>
      <div className="ac-row">
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{state.empresa.nome}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{state.empresa.cnpj} · {state.empresa.cidade}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Cracha label={state.empresa.status === "aprovado" ? "Aprovada" : "Suspensa"} color={state.empresa.status === "aprovado" ? "#6B8F71" : "#B24C3A"} />
          <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={suspender}>{state.empresa.status === "aprovado" ? "Suspender" : "Reativar"}</button>
        </div>
      </div>
      <div className="ac-label" style={{ marginTop: 18, marginBottom: 8 }}>REGISTRO DE ATIVIDADE (R12)</div>
      {state.log.slice().reverse().map((l) => (
        <div key={l.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: "1px solid var(--linha)" }}>
          <span style={{ fontWeight: 600 }}>{l.acao}</span> — {l.detalhe}
          <div className="ac-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{l.quem} · {new Date(l.quando).toLocaleString("pt-BR")}</div>
        </div>
      ))}
    </div>
  );
}

function AdminCuidadores({ ctx }) {
  const { state, persist, showToast } = ctx;
  const bloquear = (c) => {
    persist((s) => ({
      ...s, cuidadores: s.cuidadores.map((x) => x.id === c.id ? { ...x, statusCadastro: x.statusCadastro === "aprovado" ? "recusado" : "aprovado", motivoRecusa: x.statusCadastro === "aprovado" ? "Bloqueado pelo administrador." : null } : x),
      log: [...s.log, { id: "l_" + Date.now(), acao: c.statusCadastro === "aprovado" ? "Cuidador bloqueado" : "Cuidador reativado", quem: "Admin", quando: new Date().toISOString(), detalhe: c.nome }],
    }));
    showToast(c.statusCadastro === "aprovado" ? `${c.nome} bloqueado(a).` : `${c.nome} reativado(a).`);
  };
  return (
    <div>
      <div className="ac-display" style={{ fontSize: 19, marginBottom: 16 }}>Cuidadores</div>
      {state.cuidadores.map((c) => (
        <div key={c.id} className="ac-row">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar nome={c.nome} size={28} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nome}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{c.statusCadastro}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CuidadorCategoriaCracha cuidador={c} />
            {c.statusCadastro !== "em_analise" && (
              <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => bloquear(c)}>
                {c.statusCadastro === "aprovado" ? "Bloquear" : "Reativar"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminNumeros({ ctx, onReset }) {
  const { state } = ctx;
  const cadastrosPorStatus = ["aprovado", "em_analise", "recusado"].map((s) => ({
    status: s, total: state.cuidadores.filter((c) => c.statusCadastro === s).length,
  }));
  const publicados = state.atendimentos.length;
  const concluidos = state.atendimentos.filter((a) => ["concluido", "avaliado"].includes(a.status)).length;

  return (
    <div>
      <div className="ac-display" style={{ fontSize: 19, marginBottom: 16 }}>Números de uso</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Atendimentos publicados" value={publicados} />
        <StatCard label="Atendimentos concluídos" value={concluidos} />
        {cadastrosPorStatus.map((c) => <StatCard key={c.status} label={"Cadastros — " + c.status} value={c.total} />)}
      </div>
      <div className="ac-divider" />
      <div className="ac-label" style={{ marginBottom: 8 }}>RESET DA DEMO</div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>Restaura todos os dados ao estado inicial da demonstração.</div>
      <button className="ac-btn ac-btn-destructive" onClick={onReset}><RefreshCw size={14} /> Resetar demo</button>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="ac-card" style={{ minWidth: 140 }}>
      <div className="ac-mono" style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
