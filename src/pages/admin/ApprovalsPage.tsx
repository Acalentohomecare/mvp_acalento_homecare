import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  History,
  LogOut,
  RotateCcw,
  Settings,
  Users,
} from "lucide-react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Button, Card, Cracha, Modal, Textarea } from "../../components/ui";
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
import {
  APPROVAL_STATUS_CLASS,
  APPROVAL_STATUS_LABEL,
  CATEGORY_CLASS,
  CATEGORY_LABEL,
} from "../../constants/caregiver";
import { platformMetrics } from "../../services/metrics";
import type { Caregiver, Company } from "../../types";

type Section = "fila" | "cuidadores" | "empresas" | "numeros" | "atividade" | "config";

const NAV_ITEMS: { key: Section; label: string; icon: typeof ClipboardList }[] = [
  { key: "fila", label: "Fila de aprovação", icon: ClipboardList },
  { key: "cuidadores", label: "Cuidadores", icon: Users },
  { key: "empresas", label: "Empresas", icon: Briefcase },
  { key: "numeros", label: "Números de uso", icon: BarChart3 },
  { key: "atividade", label: "Atividade", icon: History },
  { key: "config", label: "Configurações", icon: Settings },
];

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
  const { state, setState, reset } = useAppState();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>("fila");
  const [prompt, setPrompt] = useState<ReasonPrompt | null>(null);
  const [reason, setReason] = useState("");
  const [resetting, setResetting] = useState(false);

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

  const metrics = platformMetrics(state);
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

      {/* A administração é desenhada para desktop (DESIGN_SYSTEM.md §3); no celular a navegação
          vira uma faixa rolável em cima do conteúdo em vez de espremer a coluna. */}
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-8 md:flex-row md:gap-8">
        <nav className="-mx-6 flex gap-1 overflow-x-auto px-6 pb-1 md:mx-0 md:w-44 md:shrink-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ease-out md:w-full ${
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
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
                <Card key={c.id} className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">{c.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink/50">{c.city}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cracha label={CATEGORY_LABEL[c.category]} className={CATEGORY_CLASS[c.category]} />
                    <Cracha
                      label={APPROVAL_STATUS_LABEL[c.approvalStatus]}
                      className={APPROVAL_STATUS_CLASS[c.approvalStatus]}
                    />
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
                <Card key={co.id} className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">{co.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-ink/50">
                      {co.cnpj} · {co.city}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cracha
                      label={APPROVAL_STATUS_LABEL[co.approvalStatus]}
                      className={APPROVAL_STATUS_CLASS[co.approvalStatus]}
                    />
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

          {section === "numeros" && (
            <div>
              <h1 className="mb-1 font-display text-[19px] font-semibold">Números de uso</h1>
              <p className="mb-5 text-[12.5px] text-ink/50">
                Contagens derivadas do dataset atual — mudam conforme as ações da demonstração.
              </p>

              <h2 className="mb-2 text-[11px] font-semibold tracking-wide text-ink/40 uppercase">
                Cadastros por situação
              </h2>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-linha bg-linha sm:grid-cols-4">
                {(Object.keys(APPROVAL_STATUS_LABEL) as (keyof typeof APPROVAL_STATUS_LABEL)[]).map(
                  (status) => (
                    <div key={status} className="bg-surface-raised px-3.5 py-3">
                      <div className="text-[10px] tracking-wide text-ink/40 uppercase">
                        {APPROVAL_STATUS_LABEL[status]}
                      </div>
                      <div className="mt-1 font-mono text-[17px] leading-none">
                        {metrics.caregivers[status] + metrics.companies[status]}
                      </div>
                      <div className="mt-1 text-[10.5px] text-ink/40">
                        {metrics.caregivers[status]} cuidador(es) · {metrics.companies[status]}{" "}
                        empresa(s)
                      </div>
                    </div>
                  ),
                )}
              </div>

              <h2 className="mt-6 mb-2 text-[11px] font-semibold tracking-wide text-ink/40 uppercase">
                Atendimentos e plataforma
              </h2>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-linha bg-linha sm:grid-cols-3">
                {[
                  { label: "Publicados", value: metrics.publishedAttendances },
                  { label: "Concluídos", value: metrics.completedAttendances },
                  { label: "Cancelados", value: metrics.cancelledAttendances },
                  { label: "Pendências na fila", value: metrics.pendingApprovals },
                  { label: "Pacientes", value: metrics.patients },
                  { label: "Avaliações", value: metrics.evaluations },
                ].map((item) => (
                  <div key={item.label} className="bg-surface-raised px-3.5 py-3">
                    <div className="text-[10px] tracking-wide text-ink/40 uppercase">{item.label}</div>
                    <div className="mt-1 font-mono text-[17px] leading-none">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "config" && (
            <div>
              <h1 className="mb-1 font-display text-[19px] font-semibold">Configurações</h1>
              <p className="mb-5 text-[12.5px] text-ink/50">
                Ajustes da demonstração.
              </p>

              <Card>
                <p className="text-[13.5px] font-semibold">Restaurar dados da demonstração</p>
                <p className="mt-1 text-[12.5px] text-ink/60">
                  Apaga tudo o que foi feito durante a apresentação (atendimentos criados,
                  aprovações, check-ins, avaliações, mensagens) e devolve o conjunto de dados
                  inicial. Você será desconectado para começar do zero.
                </p>
                <Button variant="destructive" size="sm" className="mt-3" onClick={() => setResetting(true)}>
                  <RotateCcw size={13} /> Restaurar dados
                </Button>
              </Card>
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

      {resetting && (
        <Modal title="Restaurar dados?" onClose={() => setResetting(false)}>
          <p className="mb-4 text-[13px] text-ink/70">
            Todas as ações feitas nesta demonstração serão apagadas e o conjunto de dados inicial
            volta ao lugar. Não dá para desfazer.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setResetting(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                setResetting(false);
                await reset();
                signOut();
                navigate("/login");
              }}
            >
              Restaurar dados
            </Button>
          </div>
        </Modal>
      )}

      {prompt && (
        <Modal title={prompt.title} onClose={() => setPrompt(null)}>
          <Textarea
            className="mb-4 h-20"
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
