import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Button } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";

export function CompanyDashboardPage() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();
  const company = state?.companies.find((c) => c.id === session?.companyId);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle={company?.name ?? "Empresa"}
        right={
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Sair
          </Button>
        }
      />
      <div className="mx-auto max-w-xl px-6 py-10 text-sm text-ink/60">
        Painel da empresa — atendimentos, pacientes e cuidadores entram nas próximas etapas do
        plano.
      </div>
    </div>
  );
}
