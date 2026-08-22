import React, { useState } from "react";
import { Home, Calendar, MessageSquare, User, Check, X, ShieldCheck, Clock } from "lucide-react";

/* ---------------------------------------------------------------------
   Acalento Home Care — Etapa 2: Design System / Componentes-base
   Ver docs/DESIGN_SYSTEM.md para o racional de cada decisão.
--------------------------------------------------------------------- */

const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .ds-root {
    --ink: #16241F;
    --surface: #F5F6F2;
    --surface-raised: #FFFFFF;
    --accent: #E8A33D;
    --accent-ink: #7A5419;
    --linha: #DCDFD6;
    --cat-informal: #6B8F71;
    --cat-tecnico: #3E7CB1;
    --cat-superior: #A6672B;
    --st-aberto: #E8A33D;
    --st-confirmado: #3E7CB1;
    --st-andamento: #2A9D8F;
    --st-concluido: #6B8F71;
    --st-cancelado: #B24C3A;
    background: var(--surface);
    color: var(--ink);
    font-family: 'Work Sans', sans-serif;
  }
  .ds-display { font-family: 'Fraunces', serif; font-weight: 600; }
  .ds-mono { font-family: 'IBM Plex Mono', monospace; }

  .ds-btn {
    font-family: 'Work Sans', sans-serif;
    font-weight: 600;
    font-size: 14px;
    border-radius: 10px;
    padding: 10px 18px;
    border: none;
    cursor: pointer;
    transition: transform .08s ease, opacity .15s ease;
  }
  .ds-btn:active { transform: scale(0.97); }
  .ds-btn-primary { background: var(--accent); color: var(--accent-ink); }
  .ds-btn-secondary { background: var(--ink); color: var(--surface); }
  .ds-btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid var(--linha); }
  .ds-btn-destructive { background: var(--st-cancelado); color: #fff; }

  .ds-card {
    background: var(--surface-raised);
    border: 1px solid var(--linha);
    border-radius: 16px;
    padding: 16px;
  }

  .ds-input {
    font-family: 'Work Sans', sans-serif;
    font-size: 14px;
    border: 1.5px solid var(--linha);
    border-radius: 10px;
    padding: 10px 12px;
    width: 100%;
    background: var(--surface-raised);
    color: var(--ink);
    outline: none;
  }
  .ds-input:focus { border-color: var(--accent); }
  .ds-label { font-size: 12px; font-weight: 600; color: #5B6960; margin-bottom: 4px; display: block; }

  .ds-cracha {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 16px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }
  .ds-cracha::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.55);
  }

  .ds-stepper { display: flex; align-items: center; }
  .ds-step-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--linha); flex-shrink: 0;
  }
  .ds-step-dot.active { background: var(--accent); }
  .ds-step-dot.done { background: var(--cat-informal); }
  .ds-step-line { flex: 1; height: 2px; background: var(--linha); }
  .ds-step-line.done { background: var(--cat-informal); }
  .ds-step-label { font-size: 10.5px; color: #5B6960; text-align: center; width: 64px; }
  .ds-step-label.active { color: var(--ink); font-weight: 700; }

  .ds-phone-frame {
    width: 300px;
    border-radius: 40px;
    background: var(--ink);
    padding: 14px;
    box-shadow: 0 20px 40px -12px rgba(22,36,31,0.35);
  }
  .ds-phone-notch {
    width: 90px; height: 18px; background: var(--ink);
    border-radius: 0 0 14px 14px; margin: 0 auto 6px auto;
  }
  .ds-phone-screen {
    background: var(--surface);
    border-radius: 26px;
    height: 460px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .ds-phone-content { flex: 1; overflow-y: auto; padding: 14px; }
  .ds-tabbar {
    display: flex; justify-content: space-around; align-items: center;
    padding: 10px 0 6px 0; border-top: 1px solid var(--linha); background: var(--surface-raised);
  }
  .ds-home-indicator {
    width: 90px; height: 4px; background: var(--linha); border-radius: 999px;
    margin: 8px auto 2px auto;
  }

  .ds-admin-shell {
    display: flex; border: 1px solid var(--linha); border-radius: 16px; overflow: hidden;
    background: var(--surface-raised);
  }
  .ds-admin-sidebar {
    width: 150px; background: var(--ink); color: var(--surface); padding: 16px 12px;
    font-size: 13px; display: flex; flex-direction: column; gap: 10px;
  }
  .ds-admin-nav-item { padding: 6px 8px; border-radius: 8px; }
  .ds-admin-nav-item.active { background: rgba(245,246,242,0.12); font-weight: 600; }
  .ds-admin-main { flex: 1; padding: 18px; }
  .ds-admin-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px; border: 1px solid var(--linha); border-radius: 10px; margin-bottom: 8px;
  }

  .ds-modal-overlay {
    position: fixed; inset: 0; background: rgba(22,36,31,0.45);
    display: flex; align-items: center; justify-content: center; z-index: 50;
  }
  .ds-modal {
    background: var(--surface-raised); border-radius: 18px; padding: 22px;
    width: 320px; box-shadow: 0 30px 60px -20px rgba(0,0,0,0.35);
  }
`;

function Cracha({ label, color, icon }) {
  return (
    <span className="ds-cracha" style={{ background: color }}>
      {icon}
      {label}
    </span>
  );
}

function StatusStepper({ current }) {
  const steps = ["Aberto", "Confirmado", "Em andamento", "Concluído"];
  const idx = steps.indexOf(current);
  return (
    <div>
      <div className="ds-stepper">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={
                "ds-step-dot " + (i < idx ? "done" : i === idx ? "active" : "")
              }
            />
            {i < steps.length - 1 && (
              <div className={"ds-step-line " + (i < idx ? "done" : "")} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", marginTop: 4 }}>
        {steps.map((s, i) => (
          <div
            key={s}
            className={"ds-step-label " + (i === idx ? "active" : "")}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function CuidadorCard({ nome, categoria, corCategoria, verificado, nota, regiao }) {
  return (
    <div className="ds-card" style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>{nome}</div>
          <div style={{ fontSize: 12, color: "#5B6960", marginTop: 2 }}>{regiao}</div>
        </div>
        <div className="ds-mono" style={{ fontSize: 12.5 }}>★ {nota}</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <Cracha label={categoria} color={corCategoria} />
        {verificado && (
          <Cracha label="Verificado" color="#16241F" icon={<ShieldCheck size={12} />} />
        )}
      </div>
    </div>
  );
}

export default function DesignSystemShowcase() {
  const [modalOpen, setModalOpen] = useState(false);

  const palette = [
    { name: "ink", hex: "#16241F" },
    { name: "surface", hex: "#F5F6F2" },
    { name: "surface-raised", hex: "#FFFFFF" },
    { name: "accent", hex: "#E8A33D" },
    { name: "linha", hex: "#DCDFD6" },
  ];
  const categorias = [
    { name: "Informal", hex: "#6B8F71" },
    { name: "Técnico", hex: "#3E7CB1" },
    { name: "Superior", hex: "#A6672B" },
  ];
  const statuses = [
    { name: "Aberto", hex: "#E8A33D" },
    { name: "Confirmado", hex: "#3E7CB1" },
    { name: "Em andamento", hex: "#2A9D8F" },
    { name: "Concluído", hex: "#6B8F71" },
    { name: "Cancelado", hex: "#B24C3A" },
  ];

  return (
    <div className="ds-root" style={{ padding: 28, minHeight: "100%" }}>
      <style>{TOKENS}</style>

      <div style={{ marginBottom: 28 }}>
        <div className="ds-display" style={{ fontSize: 26 }}>Acalento Home Care</div>
        <div style={{ fontSize: 13, color: "#5B6960" }}>
          Design System — Etapa 2 · componentes-base
        </div>
      </div>

      {/* Paleta */}
      <Section title="Paleta">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {palette.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
          {categorias.map((c) => (
            <Swatch key={c.name} name={"categoria: " + c.name} hex={c.hex} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
          {statuses.map((c) => (
            <Swatch key={c.name} name={"status: " + c.name} hex={c.hex} />
          ))}
        </div>
      </Section>

      {/* Tipografia */}
      <Section title="Tipografia">
        <div className="ds-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div className="ds-label">Display — Fraunces 600</div>
            <div className="ds-display" style={{ fontSize: 24 }}>
              A escala de amanhã está fechada
            </div>
          </div>
          <div>
            <div className="ds-label">UI/Corpo — Work Sans</div>
            <div style={{ fontSize: 15 }}>
              Sandra aceitou o plantão das 7h às 19h no bairro Centro. O endereço completo
              foi liberado após a confirmação.
            </div>
          </div>
          <div>
            <div className="ds-label">Dados — IBM Plex Mono</div>
            <div className="ds-mono" style={{ fontSize: 14 }}>
              14/08/2026 · 06:55 — Check-in registrado · 12h04min no plantão
            </div>
          </div>
        </div>
      </Section>

      {/* Botões */}
      <Section title="Botões">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="ds-btn ds-btn-primary">Confirmar cuidador</button>
          <button className="ds-btn ds-btn-secondary">Ver perfil</button>
          <button className="ds-btn ds-btn-ghost">Salvar rascunho</button>
          <button className="ds-btn ds-btn-destructive">Cancelar atendimento</button>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <div className="ds-card" style={{ maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className="ds-label">Bairro de atendimento</label>
            <input className="ds-input" placeholder="Ex.: Centro" />
          </div>
          <div>
            <label className="ds-label">Valor por plantão (R$)</label>
            <input className="ds-input" placeholder="180,00" />
          </div>
        </div>
      </Section>

      {/* Crachás */}
      <Section title="Crachá (elemento de assinatura)">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Cracha label="Informal" color="#6B8F71" />
          <Cracha label="Técnico" color="#3E7CB1" />
          <Cracha label="Superior" color="#A6672B" />
          <Cracha label="Verificado" color="#16241F" icon={<ShieldCheck size={12} />} />
          <Cracha label="COREN 123456" color="#16241F" icon={<Check size={12} />} />
        </div>
      </Section>

      {/* Stepper */}
      <Section title="Stepper de status do atendimento">
        <div className="ds-card" style={{ maxWidth: 380 }}>
          <StatusStepper current="Em andamento" />
        </div>
      </Section>

      {/* Cards de cuidador */}
      <Section title="Card de cuidador">
        <div style={{ maxWidth: 320 }}>
          <CuidadorCard
            nome="Sandra Oliveira"
            categoria="Informal"
            corCategoria="#6B8F71"
            verificado
            nota="4,8"
            regiao="Centro · manhã e tarde"
          />
          <CuidadorCard
            nome="Marcos Vidal — Fisioterapeuta"
            categoria="Superior"
            corCategoria="#A6672B"
            verificado
            nota="5,0"
            regiao="Centro · sessões avulsas"
          />
        </div>
      </Section>

      {/* Modal */}
      <Section title="Modal">
        <button className="ds-btn ds-btn-primary" onClick={() => setModalOpen(true)}>
          Abrir exemplo de modal
        </button>
        {modalOpen && (
          <div className="ds-modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ds-display" style={{ fontSize: 18, marginBottom: 8 }}>
                Confirmar Sandra?
              </div>
              <div style={{ fontSize: 13.5, color: "#3E4A44", marginBottom: 16 }}>
                As outras 2 candidatas serão avisadas automaticamente de que a vaga foi
                preenchida.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="ds-btn ds-btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button className="ds-btn ds-btn-primary" onClick={() => setModalOpen(false)}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Frame mobile */}
      <Section title='"Frame" de celular — telas do app (mobile first)'>
        <div className="ds-phone-frame">
          <div className="ds-phone-notch" />
          <div className="ds-phone-screen">
            <div style={{ padding: "14px 14px 0 14px" }}>
              <div style={{ fontSize: 12, color: "#5B6960" }}>Novo atendimento · Centro</div>
              <div className="ds-display" style={{ fontSize: 17, marginTop: 2 }}>
                Cuidadores compatíveis
              </div>
            </div>
            <div className="ds-phone-content">
              <CuidadorCard
                nome="Sandra Oliveira"
                categoria="Informal"
                corCategoria="#6B8F71"
                verificado
                nota="4,8"
                regiao="0,8 km"
              />
              <CuidadorCard
                nome="Beatriz Nunes"
                categoria="Informal"
                corCategoria="#6B8F71"
                verificado
                nota="4,6"
                regiao="1,2 km"
              />
              <CuidadorCard
                nome="Renata Alves"
                categoria="Informal"
                corCategoria="#6B8F71"
                verificado={false}
                nota="—"
                regiao="1,9 km"
              />
            </div>
            <div className="ds-tabbar">
              <Home size={20} color="#16241F" />
              <Calendar size={20} color="#9AA69E" />
              <MessageSquare size={20} color="#9AA69E" />
              <User size={20} color="#9AA69E" />
            </div>
            <div className="ds-home-indicator" />
          </div>
        </div>
      </Section>

      {/* Admin desktop */}
      <Section title="Layout desktop — área de administração">
        <div className="ds-admin-shell" style={{ maxWidth: 620 }}>
          <div className="ds-admin-sidebar">
            <div className="ds-admin-nav-item active">Fila de aprovação</div>
            <div className="ds-admin-nav-item">Empresas</div>
            <div className="ds-admin-nav-item">Cuidadores</div>
            <div className="ds-admin-nav-item">Números de uso</div>
          </div>
          <div className="ds-admin-main">
            <div style={{ fontSize: 12, color: "#5B6960", marginBottom: 10 }}>
              3 cadastros aguardando conferência
            </div>
            <div className="ds-admin-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>Marcos Vidal</span>
                <Cracha label="Superior" color="#A6672B" />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ds-btn ds-btn-ghost" style={{ padding: "6px 10px", fontSize: 12.5 }}>
                  <X size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
                  Recusar
                </button>
                <button className="ds-btn ds-btn-primary" style={{ padding: "6px 10px", fontSize: 12.5 }}>
                  <Check size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
                  Aprovar
                </button>
              </div>
            </div>
            <div className="ds-admin-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>Renata Alves</span>
                <Cracha label="Informal" color="#6B8F71" />
                <span className="ds-mono" style={{ fontSize: 11, color: "#5B6960" }}>
                  <Clock size={11} style={{ verticalAlign: -1, marginRight: 3 }} />
                  há 2h
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ds-btn ds-btn-ghost" style={{ padding: "6px 10px", fontSize: 12.5 }}>
                  Recusar
                </button>
                <button className="ds-btn ds-btn-primary" style={{ padding: "6px 10px", fontSize: 12.5 }}>
                  Aprovar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#5B6960",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Swatch({ name, hex }) {
  return (
    <div style={{ width: 108 }}>
      <div
        style={{
          width: 108,
          height: 56,
          borderRadius: 10,
          background: hex,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      />
      <div style={{ fontSize: 11.5, marginTop: 4, fontWeight: 600 }}>{name}</div>
      <div className="ds-mono" style={{ fontSize: 10.5, color: "#5B6960" }}>
        {hex}
      </div>
    </div>
  );
}
