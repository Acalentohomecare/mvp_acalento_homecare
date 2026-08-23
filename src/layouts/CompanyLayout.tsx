import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  Ellipsis,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Button, Logo, Modal, PRODUTO_NOME } from "../components/ui";
import {
  HEADER_ICON_CLASS,
  SHEET_ITEM_CLASS,
  SKIP_LINK_CLASS,
  TAB_INDICATOR_CLASS,
  sideNavClass,
  tabNavClass,
} from "../components/layout/nav";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { unreadCount } from "../services/notifications";

/**
 * Navegação da empresa (CLAUDE.md §11).
 *
 * **Desktop e celular não carregam a mesma lista, de propósito.** A barra lateral cabe inteira e
 * mostra os sete destinos. A barra do celular leva só as quatro telas que a coordenadora abre
 * durante a operação; o resto foi para onde cada coisa pertence em tela pequena:
 *
 * - **Avisos virou sino no cabeçalho**, com o número de não lidos. É o padrão que todo aplicativo
 *   de celular usa para notificação, é mais fácil de achar do que uma aba disputando espaço com
 *   tarefa, e de quebra resolve a empresa não ter contador nenhum antes — o cuidador tinha.
 * - **Relatórios e Configurações foram para a folha "Mais".** Antes não estavam na barra:
 *   Configurações era uma engrenagem sem rótulo no cabeçalho e Relatórios era um link no pé do
 *   painel. Estavam escondidos; agora estão num lugar que tem nome.
 * - **"Sair" saiu do cabeçalho.** Ocupava área nobre em todas as telas para uma ação usada uma
 *   vez por sessão.
 *
 * Quatro abas em vez de cinco também é alvo maior: cada uma passa de 20% para 25% da largura.
 */
const NAV_ITEMS = [
  { to: "/empresa", label: "Início", icon: Home, end: true, mobile: true },
  { to: "/empresa/atendimentos", label: "Atendimentos", icon: CalendarCheck, end: false, mobile: true },
  { to: "/empresa/agenda", label: "Escala", icon: CalendarDays, end: false, mobile: true },
  { to: "/empresa/cuidadores", label: "Cuidadores", icon: Users, end: false, mobile: true },
  { to: "/empresa/relatorios", label: "Relatórios", icon: FileText, end: false, mobile: false },
  { to: "/empresa/notificacoes", label: "Avisos", icon: Bell, end: false, mobile: false },
  { to: "/empresa/configuracoes", label: "Configurações", icon: Settings, end: false, mobile: false },
];

/** A folha "Mais" leva os destinos que não cabem na barra — Avisos já está no sino. */
const SHEET_ITEMS = NAV_ITEMS.filter((item) => !item.mobile && item.label !== "Avisos");

export function CompanyLayout() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const company = state?.companies.find((c) => c.id === session?.companyId);
  const unread = state ? unreadCount(state, session) : 0;
  /* Só vale mostrar o nome da conta quando ele acrescenta algo ao lockup. */
  const nomeConta = company?.name && company.name !== PRODUTO_NOME ? company.name : null;

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen md:flex">
      <a href="#conteudo" className={SKIP_LINK_CLASS}>
        Ir para o conteúdo
      </a>

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
            {/* O número entra no rótulo acessível também: um ponto colorido não diz quantos, e
                não diz nada para quem não distingue a cor. */}
            <Link
              to="/empresa/notificacoes"
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

        <main id="conteudo">
          <Outlet />
        </main>
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
            {SHEET_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMenuAberto(false)} className={SHEET_ITEM_CLASS}>
                <Icon size={17} strokeWidth={1.9} className="text-ink-subtle" /> {label}
              </Link>
            ))}
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
