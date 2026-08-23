import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Button, Card, Modal } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { companyAuditLog } from "../../services/roster";

/**
 * Configurações da empresa (CLAUDE.md §16). Guarda o registro de atividade da empresa (R12) e o
 * reset da demonstração — ações que antes viviam numa área de administração de plataforma que a
 * demo não tem mais.
 */
export function CompanySettingsPage() {
  const { session, signOut } = useSession();
  const { state, reset } = useAppState();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);

  if (!state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-body text-ink/50">
        Carregando…
      </div>
    );
  }

  const company = state.companies.find((c) => c.id === session?.companyId);
  const log = [...companyAuditLog(state, session?.companyId)].reverse();

  return (
    <div className="mx-auto max-w-2xl px-6 py-7">
      <h1 className="text-display font-semibold">Configurações</h1>
      <p className="prosa mt-1 text-body text-ink/50">{company?.name}</p>

      <section className="mt-7">
        <h2 className="mb-2.5 text-body font-semibold text-ink">
          Dados da empresa
        </h2>
        <Card>
          <dl className="flex flex-col gap-2 text-note">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">CNPJ</dt>
              <dd className="font-mono text-note">{company?.cnpj}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Cidade</dt>
              <dd>{company?.city}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">Telefone</dt>
              <dd className="font-mono text-note">{company?.phone}</dd>
            </div>
            <div className="flex min-w-0 justify-between gap-4">
              <dt className="text-ink/50">E-mail</dt>
              <dd className="truncate">{company?.email}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section className="mt-7">
        <h2 className="mb-1 text-body font-semibold text-ink">
          Registro de atividade
        </h2>
        <p className="mb-2.5 text-note text-ink/50">
          Toda aprovação, recusa, bloqueio e cancelamento da sua empresa fica registrado (R12).
        </p>
        {log.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-linha py-6 text-center text-body text-ink/45">
            Nenhum registro ainda.
          </p>
        ) : (
          <ul>
            {log.map((entry) => (
              <li key={entry.id} className="border-b border-linha py-2.5 text-note last:border-0">
                <span className="font-semibold">{entry.action}</span> — {entry.detail}
                <div className="mt-0.5 font-mono text-meta text-ink/45">
                  {entry.actor} · {new Date(entry.createdAt).toLocaleString("pt-BR")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-7">
        <h2 className="mb-2.5 text-body font-semibold text-ink">
          Demonstração
        </h2>
        <Card>
          <p className="text-title font-semibold">Restaurar dados da demonstração</p>
          <p className="mt-1 text-note text-ink/60">
            Apaga tudo o que foi feito durante a apresentação (atendimentos criados, aprovações de
            cuidadores, check-ins, avaliações, mensagens) e devolve o conjunto de dados inicial.
            Você será desconectado para começar do zero.
          </p>
          <Button variant="destructive" size="sm" className="mt-3" onClick={() => setResetting(true)}>
            <RotateCcw size={13} /> Restaurar dados
          </Button>
        </Card>
      </section>

      {resetting && (
        <Modal title="Restaurar dados?" onClose={() => setResetting(false)}>
          <p className="mb-4 text-note text-ink/70">
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
    </div>
  );
}
