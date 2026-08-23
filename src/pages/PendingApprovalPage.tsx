import { Navigate, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "../components/ui";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { isCaregiverActive, lastRejection } from "../services/roster";

/**
 * Sala de espera do cuidador: quem confere documentos e libera o acesso são as empresas
 * (`services/roster.ts`). Basta uma aprovação para o cuidador entrar no app.
 */
export function PendingApprovalPage() {
  const { session, signOut } = useSession();
  const { state } = useAppState();
  const navigate = useNavigate();

  if (!state) return null;

  if (isCaregiverActive(state, session?.caregiverId)) return <Navigate to="/cuidador" replace />;

  const decision = lastRejection(state, session?.caregiverId);
  const isBlocked = decision?.status === "blocked";
  const isRejected = decision?.status === "rejected";

  const title = isBlocked ? "Acesso bloqueado" : isRejected ? "Cadastro recusado" : "Cadastro em análise";

  const handleBack = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Clock size={32} className={decision ? "text-status-cancelado" : "text-accent"} />
      <h1 className="mt-3 text-display font-semibold">{title}</h1>
      <p className="mt-2 prosa text-body text-ink/60">
        {decision
          ? `${decision.companyName}: ${decision.reason ?? "documento não aprovado."}`
          : "As empresas estão conferindo seus documentos. Assim que uma delas aprovar seu cadastro, você passa a receber convites para os plantões."}
      </p>
      <Button variant="ghost" className="mt-6" onClick={handleBack}>
        Voltar à entrada
      </Button>
    </div>
  );
}
