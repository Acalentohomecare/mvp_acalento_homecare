import { Navigate, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "../components/ui";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";

export function PendingApprovalPage() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();

  if (!state) return null;

  const caregiver = state.caregivers.find((c) => c.id === session?.caregiverId);
  if (caregiver?.approvalStatus === "approved") return <Navigate to="/cuidador" replace />;

  const isRejected = caregiver?.approvalStatus === "rejected";
  const isBlocked = caregiver?.approvalStatus === "blocked";

  const title = isBlocked ? "Acesso bloqueado" : isRejected ? "Cadastro recusado" : "Cadastro em análise";

  const handleBack = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Clock size={32} className={isRejected || isBlocked ? "text-status-cancelado" : "text-accent"} />
      <h1 className="mt-3 font-display text-xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-xs text-sm text-ink/60">
        {isRejected || isBlocked
          ? (caregiver?.rejectionReason ?? "Documento não aprovado.")
          : "Assim que a conferência dos documentos for concluída, você poderá receber convites."}
      </p>
      <Button variant="ghost" className="mt-6" onClick={handleBack}>
        Voltar à entrada
      </Button>
    </div>
  );
}
