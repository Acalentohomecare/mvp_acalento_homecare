import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Button, Logo } from "../components/ui";
import { TAB_INDICATOR_CLASS, sideNavClass, tabNavClass } from "../components/layout/nav";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";

/**
 * Navegação da empresa (CLAUDE.md §11). Só entram destinos que já existem de verdade — os
 * demais itens do §11 (Agenda, Pacientes, Mensagens, Relatórios) entram nas etapas seguintes.
 */
const NAV_ITEMS = [
  { to: "/empresa", label: "Início", icon: Home, end: true, mobile: true },
  { to: "/empresa/agenda", label: "Escala", icon: CalendarDays, end: false, mobile: true },
  { to: "/empresa/atendimentos", label: "Atendimentos", icon: CalendarCheck, end: false, mobile: true },
  { to: "/empresa/cuidadores", label: "Cuidadores", icon: Users, end: false, mobile: true },
  // Relatório fica fora da barra do celular (não cabem 6 itens); há um link no painel.
  { to: "/empresa/relatorios", label: "Relatórios", icon: FileText, end: false, mobile: false },
  { to: "/empresa/notificacoes", label: "Avisos", icon: Bell, end: false, mobile: true },
  // Configurações também não cabe na barra; no celular o acesso é pelo ícone no cabeçalho.
  { to: "/empresa/configuracoes", label: "Configurações", icon: Settings, end: false, mobile: false },
];

export function CompanyLayout() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();
  const company = state?.companies.find((c) => c.id === session?.companyId);

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

        <p className="mt-5 truncate rounded-control border border-linha bg-surface-raised px-3 py-2 text-meta font-medium text-ink/60">
          {company?.name ?? "Empresa"}
        </p>

        <nav className="mt-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => sideNavClass(isActive)}>
              <Icon size={16} strokeWidth={1.9} /> {label}
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
            <span className="truncate text-meta text-ink/50">
              {company?.name ?? "Empresa"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/empresa/configuracoes"
              aria-label="Configurações"
              className="rounded-control p-2 text-ink/55 transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-ink"
            >
              <Settings size={16} />
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={14} /> Sair
            </Button>
          </div>
        </header>

        <Outlet />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-linha bg-surface-nav/95 pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur-md md:hidden">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => tabNavClass(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <span className={TAB_INDICATOR_CLASS} />}
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.75} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
