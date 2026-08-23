import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, CalendarCheck, Ellipsis, Home, LogOut, Mail, UserRound } from "lucide-react";
import { Button, Logo, Modal, PRODUTO_NOME } from "../components/ui";
import {
  HEADER_ICON_CLASS,
  SHEET_ITEM_CLASS,
  TAB_INDICATOR_CLASS,
  sideNavClass,
  tabNavClass,
} from "../components/layout/nav";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { unreadCount } from "../services/notifications";

/**
 * Navegação do cuidador (CLAUDE.md §11).
 *
 * Mesma gramática da empresa, e isso importa: os dois perfis são o mesmo produto, e trocar de
 * perfil ao vivo é o que a apresentação faz. O sino fica no mesmo canto, a folha "Mais" abre do
 * mesmo jeito, a barra tem quatro abas nos dois.
 *
 * O cuidador usa isto na rua, quase sempre com uma mão. Por isso Avisos saiu da barra de abas
 * para o sino: sobra espaço para as quatro telas que ele abre entre um plantão e outro, e cada
 * alvo fica 25% mais largo.
 */
const NAV_ITEMS = [
  { to: "/cuidador", label: "Início", icon: Home, end: true, mobile: true },
  { to: "/cuidador/convites", label: "Convites", icon: Mail, end: false, mobile: true },
  { to: "/cuidador/agenda", label: "Agenda", icon: CalendarCheck, end: false, mobile: true },
  { to: "/cuidador/perfil", label: "Perfil", icon: UserRound, end: false, mobile: true },
  { to: "/cuidador/notificacoes", label: "Avisos", icon: Bell, end: false, mobile: false },
];

export function CaregiverLayout() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const caregiver = state?.caregivers.find((c) => c.id === session?.caregiverId);
  const unread = state ? unreadCount(state, session) : 0;
  /* Só vale mostrar o nome da conta quando ele acrescenta algo ao lockup. */
  const nomeConta = caregiver?.name && caregiver.name !== PRODUTO_NOME ? caregiver.name : null;

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen md:flex">
      <div className="hidden md:block md:w-60 md:shrink-0 md:border-r md:border-linha md:bg-surface-nav">
        <aside className="sticky top-0 flex h-screen flex-col px-3.5 py-5">
          <div className="px-2">
            <Logo variant="stacked" size={40} />
          </div>

          {nomeConta && (
            <p className="mt-5 truncate rounded-control border border-linha bg-surface-raised px-3 py-2 text-meta font-medium text-ink-muted">
              {nomeConta}
            </p>
          )}

          <nav aria-label="Navegação principal" className="mt-4 flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => sideNavClass(isActive)}>
                <Icon size={16} strokeWidth={1.9} /> {label}
                {label === "Avisos" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 numero text-meta leading-none text-accent-ink">
                    {unread}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={14} /> Sair
            </Button>
          </div>
        </aside>
      </div>

      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-linha bg-surface-nav/90 px-5 py-2.5 backdrop-blur-md md:hidden">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Logo variant="inline" size={30} />
            {nomeConta && (
              <span className="truncate text-meta text-ink-subtle">{nomeConta}</span>
            )}
          </div>

          <div className="flex shrink-0 items-center">
            {/* O contador substitui o ponto vermelho que estava aqui: um ponto não diz quantos
                convites chegaram, e some inteiro para quem não distingue a cor. */}
            <Link
              to="/cuidador/notificacoes"
              aria-label={unread > 0 ? `Avisos, ${unread} não lidos` : "Avisos"}
              className={HEADER_ICON_CLASS}
            >
              <Bell size={19} strokeWidth={1.9} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-4 rounded-full bg-accent px-1 py-px text-center numero text-[10px] leading-tight text-accent-ink">
                  {unread}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Mais opções"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto(true)}
              className={HEADER_ICON_CLASS}
            >
              <Ellipsis size={19} strokeWidth={1.9} />
            </button>
          </div>
        </header>

        <Outlet />
      </div>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-linha bg-surface-nav/95 pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur-md md:hidden"
      >
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => tabNavClass(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <span className={TAB_INDICATOR_CLASS} />}
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.75} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {menuAberto && (
        <Modal title="Mais" onClose={() => setMenuAberto(false)}>
          {nomeConta && (
            <p className="mb-3 truncate text-note text-ink-subtle">{nomeConta}</p>
          )}
          <div className="flex flex-col gap-0.5">
            <Link
              to="/cuidador/notificacoes"
              onClick={() => setMenuAberto(false)}
              className={SHEET_ITEM_CLASS}
            >
              <Bell size={17} strokeWidth={1.9} className="text-ink-subtle" /> Avisos
              {unread > 0 && (
                <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 numero text-meta leading-none text-accent-ink">
                  {unread}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={`${SHEET_ITEM_CLASS} mt-1 border-t border-linha pt-3.5`}
            >
              <LogOut size={17} strokeWidth={1.9} className="text-ink-subtle" /> Sair
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
