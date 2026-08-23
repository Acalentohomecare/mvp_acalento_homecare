import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, CalendarCheck, HeartHandshake, Home, LogOut, Mail, UserRound } from "lucide-react";
import { Button } from "../components/ui";
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
      <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 font-mono text-meta text-accent-ink">
        {unread}
      </span>
    ) : null;

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-56 md:shrink-0 md:flex-col md:border-r md:border-linha md:px-4 md:py-5">
        <div className="flex items-center gap-2.5 px-2">
          <HeartHandshake className="text-accent-ink" size={20} strokeWidth={1.75} />
          <div className="min-w-0">
            <div className="text-title leading-none font-semibold">Acalento Gestão</div>
            <div className="mt-0.5 truncate text-meta text-ink/50">
              {caregiver?.name ?? "Cuidador"}
            </div>
          </div>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-[10px] px-3 py-2 text-note font-medium transition-colors duration-200 ease-out ${
                  isActive ? "bg-ink text-surface" : "text-ink/60 hover:bg-linha/50"
                }`
              }
            >
              <Icon size={15} /> {label} {badge(label)}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Sair
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-linha px-6 py-4 md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <HeartHandshake className="shrink-0 text-accent-ink" size={20} strokeWidth={1.75} />
            <div className="min-w-0">
              <div className="text-title leading-none font-semibold">Acalento Gestão</div>
              <div className="mt-0.5 truncate text-meta text-ink/50">
                {caregiver?.name ?? "Cuidador"}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Sair
          </Button>
        </header>

        <Outlet />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-linha bg-surface-raised md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-center text-meta font-medium -tracking-[0.01em] transition-colors duration-200 ease-out ${
                isActive ? "text-ink" : "text-ink/45"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.75} />
                  {label === "Avisos" && unread > 0 && (
                    <span className="absolute -top-1 -right-1 size-2 rounded-full bg-accent" />
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
