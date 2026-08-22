import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Briefcase, Users, History, LogOut } from "lucide-react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Button, Card, Cracha, Modal } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import {
  approveCaregiver,
  rejectCaregiver,
  blockCaregiver,
  reactivateCaregiver,
  approveCompany,
  rejectCompany,
  suspendCompany,
  reactivateCompany,
} from "../../services/admin";
import type { ApprovalStatus, Caregiver, CaregiverCategory, Company } from "../../types";

type Section = "fila" | "cuidadores" | "empresas" | "atividade";

const NAV_ITEMS: { key: Section; label: string; icon: typeof ClipboardList }[] = [
  { key: "fila", label: "Fila de aprovação", icon: ClipboardList },
  { key: "cuidadores", label: "Cuidadores", icon: Users },
  { key: "empresas", label: "Empresas", icon: Briefcase },
  { key: "atividade", label: "Atividade", icon: History },
];

const CATEGORY_LABEL: Record<CaregiverCategory, string> = {
  informal: "Informal",
  tecnico: "Técnico",
  superior: "Superior",
};

const CATEGORY_CLASS: Record<CaregiverCategory, string> = {
  informal: "bg-cat-informal",
  tecnico: "bg-cat-tecnico",
  superior: "bg-cat-superior",
};

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Recusado",
  blocked: "Bloqueado",
};

const STATUS_CLASS: Record<ApprovalStatus, string> = {
  pending: "bg-status-aberto",
  approved: "bg-status-concluido",
  rejected: "bg-status-cancelado",
  blocked: "bg-status-bloqueado",
};

interface ReasonPrompt {
  title: string;
  confirmLabel: string;
  placeholder: string;
  defaultReason: string;
  onConfirm: (reason: string) => void;
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-6 text-center text-[12.5px] text-ink/45">{text}</p>;
}

export function AdminApprovalsPage() {
  const { signOut } = useSession();
  const { state, setState } = useAppState();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>("fila");
  const [prompt, setPrompt] = useState<ReasonPrompt | null>(null);
  const [reason, setReason] = useState("");

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">Carregando…</div>
    );
  }

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const openPrompt = (config: ReasonPrompt) => {
    setPrompt(config);
    setReason("");
  };

  const confirmPrompt = () => {
    if (!prompt) return;
    prompt.onConfirm(reason.trim() || prompt.defaultReason);
    setPrompt(null);
    setReason("");
  };

  const pendingCaregivers = state.caregivers.filter((c) => c.approvalStatus === "pending");
  const pendingCompanies = state.companies.filter((c) => c.approvalStatus === "pending");

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle="Administrador"
        right={
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Sair
          </Button>
        }
      />

      <div className="mx-auto flex max-w-5xl gap-8 px-6 py-8">
        <nav className="w-44 shrink-0 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium transition-colors duration-200 ease-out ${
                section === key ? "bg-ink text-surface" : "text-ink/60 hover:bg-linha/50"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {section === "fila" && (
            <div>
              <h1 className="mb-1 font-display text-[19px] font-semibold">Fila de aprovação</h1>
              <p className="mb-5 text-[12.5px] text-ink/50">
                {pendingCaregivers.length + pendingCompanies.length} cadastro(s) aguardando conferência.
              </p>

              {pendingCaregivers.length === 0 && pendingCompanies.length === 0 && (
                <EmptyState text="Nenhum cadastro pendente." />
              )}

              {pendingCaregivers.map((c) => (
                <Card key={c.id} className="mb-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13.5px] font-semibold">{c.name}</div>
                      <div className="mt-0.5 text-[11.5px] text-ink/50">
                        {c.councilRegistration ?? "Sem registro de conselho (informal)"}
                      </div>
                    </div>
                    <Cracha label={CATEGORY_LABEL[c.category]} className={CATEGORY_CLASS[c.category]} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openPrompt({
                          title: `Recusar ${c.name}`,
                          confirmLabel: "Recusar cadastro",
                          placeholder: "Ex.: documento de identidade ilegível.",
                          defaultReason: "Documentos não conferem.",
                          onConfirm: (r) => setState((s) => rejectCaregiver(s, c.id, r)),
                        })
                      }
                    >
                      Recusar
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setState((s) => approveCaregiver(s, c.id))}>
                      Aprovar
                    </Button>
                  </div>
                </Card>
              ))}

              {pendingCompanies.map((co) => (
                <Card key={co.id} className="mb-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13.5px] font-semibold">{co.name}</div>
                      <div className="mt-0.5 text-[11.5px] text-ink/50">
                        {co.cnpj} · {co.city}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openPrompt({
                          title: `Recusar ${co.name}`,
                          confirmLabel: "Recusar cadastro",
                          placeholder: "Ex.: cartão CNPJ inválido.",
                          defaultReason: "Documentos não conferem.",
                          onConfirm: (r) => setState((s) => rejectCompany(s, co.id, r)),
                        })
                      }
                    >
                      Recusar
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setState((s) => approveCompany(s, co.id))}>
                      Aprovar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {section === "cuidadores" && (
            <div>
              <h1 className="mb-5 font-display text-[19px] font-semibold">Cuidadores</h1>
              {state.caregivers.map((c: Caregiver) => (
                <Card key={c.id} className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">{c.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink/50">{c.city}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cracha label={CATEGORY_LABEL[c.category]} className={CATEGORY_CLASS[c.category]} />
                    <Cracha label={STATUS_LABEL[c.approvalStatus]} className={STATUS_CLASS[c.approvalStatus]} />
                    {c.approvalStatus === "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openPrompt({
                            title: `Bloquear ${c.name}`,
                            confirmLabel: "Bloquear",
                            placeholder: "Ex.: denúncia em análise.",
                            defaultReason: "Bloqueado pelo administrador.",
                            onConfirm: (r) => setState((s) => blockCaregiver(s, c.id, r)),
                          })
                        }
                      >
                        Bloquear
                      </Button>
                    )}
                    {c.approvalStatus === "blocked" && (
                      <Button variant="ghost" size="sm" onClick={() => setState((s) => reactivateCaregiver(s, c.id))}>
                        Reativar
                      </Button>
                    )}
                    {c.approvalStatus === "rejected" && (
                      <Button variant="ghost" size="sm" onClick={() => setState((s) => approveCaregiver(s, c.id))}>
                        Reconsiderar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {section === "empresas" && (
            <div>
              <h1 className="mb-5 font-display text-[19px] font-semibold">Empresas</h1>
              {state.companies.map((co: Company) => (
                <Card key={co.id} className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">{co.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink/50">
                      {co.cnpj} · {co.city}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cracha label={STATUS_LABEL[co.approvalStatus]} className={STATUS_CLASS[co.approvalStatus]} />
                    {co.approvalStatus === "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openPrompt({
                            title: `Suspender ${co.name}`,
                            confirmLabel: "Suspender",
                            placeholder: "Ex.: pendência financeira.",
                            defaultReason: "Suspensa pelo administrador.",
                            onConfirm: (r) => setState((s) => suspendCompany(s, co.id, r)),
                          })
                        }
                      >
                        Suspender
                      </Button>
                    )}
                    {co.approvalStatus === "blocked" && (
                      <Button variant="ghost" size="sm" onClick={() => setState((s) => reactivateCompany(s, co.id))}>
                        Reativar
                      </Button>
                    )}
                    {co.approvalStatus === "rejected" && (
                      <Button variant="ghost" size="sm" onClick={() => setState((s) => approveCompany(s, co.id))}>
                        Reconsiderar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {section === "atividade" && (
            <div>
              <h1 className="mb-1 font-display text-[19px] font-semibold">Registro de atividade</h1>
              <p className="mb-5 text-[12.5px] text-ink/50">
                Toda aprovação, recusa, bloqueio e cancelamento fica registrado (R12).
              </p>
              {state.auditLog.length === 0 && <EmptyState text="Nenhum registro ainda." />}
              {[...state.auditLog].reverse().map((entry) => (
                <div key={entry.id} className="border-b border-linha py-2.5 text-[12.5px] last:border-0">
                  <span className="font-semibold">{entry.action}</span> — {entry.detail}
                  <div className="mt-0.5 font-mono text-[10.5px] text-ink/45">
                    {entry.actor} · {new Date(entry.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {prompt && (
        <Modal title={prompt.title} onClose={() => setPrompt(null)}>
          <textarea
            className="mb-4 h-20 w-full rounded-[10px] border-[1.5px] border-linha bg-surface-raised p-2.5 text-[13px] text-ink outline-none transition-colors focus:border-accent"
            placeholder={prompt.placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPrompt(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmPrompt}>
              {prompt.confirmLabel}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
