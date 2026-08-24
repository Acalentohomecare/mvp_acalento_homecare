import { Button, PontoNivel, TelaCarregando, Vazio } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";
import { markAllRead, sessionNotifications } from "../../services/notifications";
import type { NotificationType } from "../../types";
import type { Nivel } from "../../constants/nivel";
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

/**
 * O nível de cada tipo de notificação (design system, seção 3.2).
 *
 * Toda linha desta tela tinha o mesmo sino cinza. Vinte sinos idênticos não informam nada: quem
 * abre a tela quer saber, sem ler, se ali dentro tem alguma coisa pegando fogo. O ponto de nível
 * responde isso na largura de cinco pixels.
 */
const TYPE_NIVEL: Record<NotificationType, Nivel> = {
  cancellation: "critico",
  checkin_pending: "critico",
  delay: "critico",
  invitation: "atencao",
  application: "atencao",
  reminder: "atencao",
  approval: "informacao",
  new_message: "informacao",
  confirmation: "sucesso",
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
          <h1 className="text-display">Notificações</h1>
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
        <div className="mt-5 rounded-card border border-linha">
          <Vazio porte="bloco">Nenhuma notificação.</Vazio>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-1.5">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-2.5 rounded-control border px-3 py-2.5 ${
                n.read ? "border-linha bg-transparent" : "border-accent/40 bg-surface-raised"
              }`}
            >
              {/* O ponto índice a linha pelo nível; a palavra do tipo, logo abaixo, é quem
                  carrega o significado por escrito (regra 3). */}
              <PontoNivel nivel={TYPE_NIVEL[n.type]} className="mt-[10px]" />
              <div className="min-w-0">
                <p className="text-body text-ink-muted">{n.text}</p>
                <p className="mt-0.5 numero text-meta text-ink-subtle">
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
