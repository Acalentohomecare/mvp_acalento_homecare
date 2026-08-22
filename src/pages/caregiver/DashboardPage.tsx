import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Button } from "../../components/ui";
import { useAppState } from "../../hooks/useAppState";
import { useSession } from "../../hooks/useSession";

export function CaregiverDashboardPage() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();
  const caregiver = state?.caregivers.find((c) => c.id === session?.caregiverId);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle={caregiver?.name ?? "Cuidador"}
        right={
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> Sair
          </Button>
        }
      />
      <div className="mx-auto max-w-xl px-6 py-10 text-sm text-ink/60">
        Painel do cuidador — convites, agenda e atendimentos entram nas próximas etapas do plano.
      </div>
    </div>
  );
}
