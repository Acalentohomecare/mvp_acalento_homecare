import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  FileText,
  HeartHandshake,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "../components/ui";
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
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-56 md:shrink-0 md:flex-col md:border-r md:border-linha md:px-4 md:py-5">
        <div className="flex items-center gap-2.5 px-2">
          <HeartHandshake className="text-accent-ink" size={20} strokeWidth={1.75} />
          <div className="min-w-0">
            <div className="font-display text-base leading-none font-semibold">Acalento</div>
            <div className="mt-0.5 truncate text-[11px] text-ink/50">
              {company?.name ?? "Empresa"}
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
                `flex items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors duration-200 ease-out ${
                  isActive ? "bg-ink text-surface" : "text-ink/60 hover:bg-linha/50"
                }`
              }
            >
              <Icon size={15} /> {label}
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
              <div className="font-display text-base leading-none font-semibold">Acalento</div>
              <div className="mt-0.5 truncate text-[11px] text-ink/50">
                {company?.name ?? "Empresa"}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              to="/empresa/configuracoes"
              aria-label="Configurações"
              className="rounded-[10px] p-2 text-ink/55 transition-colors duration-200 ease-out hover:bg-linha/50 hover:text-ink"
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

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-linha bg-surface-raised md:hidden">
        {NAV_ITEMS.filter((item) => item.mobile).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-200 ease-out ${
                isActive ? "text-ink" : "text-ink/45"
              }`
            }
          >
            {({ isActive }) => (
              <>
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
