import { Bell } from "lucide-react";
import { Button, TelaCarregando } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { markAllRead, sessionNotifications } from "../../services/notifications";
import type { NotificationType } from "../../types";
import { PAGE_LIST } from "../../components/layout/page";

const TYPE_LABEL: Record<NotificationType, string> = {
  invitation: "Convite",
  confirmation: "Confirmação",
  reminder: "Lembrete",
  cancellation: "Cancelamento",
  checkin_pending: "Check-in pendente",
  new_message: "Nova mensagem",
  application: "Candidatura",
  approval: "Cadastro",
  delay: "Atraso",
};

export function NotificationsPage() {
  const { session } = useSession();
  const { state, setState } = useAppState();

  if (!state) {
    return <TelaCarregando />;
  }

  const notifications = sessionNotifications(state, session);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className={PAGE_LIST}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display font-semibold">Notificações</h1>
          <p className="prosa mt-1 text-body text-ink-subtle">
            {unread === 0 ? "Tudo lido." : `${unread} não ${unread === 1 ? "lida" : "lidas"}.`}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setState((s) => markAllRead(s, session))}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-linha py-10 text-center text-body text-ink-subtle">
          Nenhuma notificação.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-1.5">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-2.5 rounded-control border px-3 py-2.5 ${
                n.read ? "border-linha bg-transparent" : "border-accent/40 bg-surface-raised"
              }`}
            >
              <Bell size={14} className={`mt-0.5 shrink-0 ${n.read ? "text-ink-subtle" : "text-accent"}`} />
              <div className="min-w-0">
                <p className="text-body text-ink-muted">{n.text}</p>
                <p className="mt-0.5 font-mono text-meta text-ink-subtle">
                  {TYPE_LABEL[n.type]} · {new Date(n.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
