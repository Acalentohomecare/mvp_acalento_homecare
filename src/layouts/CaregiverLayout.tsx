import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, CalendarCheck, Home, LogOut, Mail, UserRound } from "lucide-react";
import { Button, Logo } from "../components/ui";
import { TAB_INDICATOR_CLASS, sideNavClass, tabNavClass } from "../components/layout/nav";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { unreadCount } from "../services/notifications";

const NAV_ITEMS = [
  { to: "/cuidador", label: "Início", icon: Home, end: true },
  { to: "/cuidador/convites", label: "Convites", icon: Mail, end: false },
  { to: "/cuidador/agenda", label: "Agenda", icon: CalendarCheck, end: false },
  { to: "/cuidador/notificacoes", label: "Avisos", icon: Bell, end: false },
  { to: "/cuidador/perfil", label: "Perfil", icon: UserRound, end: false },
];

export function CaregiverLayout() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();
  const caregiver = state?.caregivers.find((c) => c.id === session?.caregiverId);
  const unread = state ? unreadCount(state, session) : 0;

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const badge = (label: string) =>
    label === "Avisos" && unread > 0 ? (
      <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 font-mono text-meta leading-none text-accent-ink">
        {unread}
      </span>
    ) : null;

  return (
    <div className="min-h-screen md:flex">
      <div className="hidden md:block md:w-60 md:shrink-0 md:border-r md:border-linha md:bg-surface-nav">
      <aside className="sticky top-0 flex h-screen flex-col px-3.5 py-5">
        <div className="px-2">
          <Logo variant="stacked" size={40} />
        </div>

        <p className="mt-5 truncate rounded-control border border-linha bg-surface-raised px-3 py-2 text-meta font-medium text-ink-muted">
          {caregiver?.name ?? "Cuidador"}
        </p>

        <nav className="mt-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => sideNavClass(isActive)}>
              <Icon size={16} strokeWidth={1.9} /> {label} {badge(label)}
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
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-linha bg-surface-nav/90 px-5 py-3 backdrop-blur-md md:hidden">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Logo variant="inline" size={30} />
            <span className="truncate text-meta text-ink-subtle">
              {caregiver?.name ?? "Cuidador"}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Sair
          </Button>
        </header>

        <Outlet />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-linha bg-surface-nav/95 pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur-md md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => tabNavClass(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <span className={TAB_INDICATOR_CLASS} />}
                <span className="relative">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.75} />
                  {label === "Avisos" && unread > 0 && (
                    <span className="absolute -top-1 -right-1 size-2 rounded-full bg-status-cancelado ring-2 ring-surface-raised" />
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
