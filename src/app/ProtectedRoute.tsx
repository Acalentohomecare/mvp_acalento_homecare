import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import type { UserRole } from "../types";
import { useAppState } from "../hooks/useAppState";
import { useSession } from "../hooks/useSession";
import { isCaregiverActive } from "../services/roster";

interface ProtectedRouteProps {
  role: UserRole;
  /** false para a própria tela de "aguardando aprovação", que não deve exigir aprovação prévia. */
  requireApproval?: boolean;
  children: ReactNode;
}

/**
 * Garante sessão + papel corretos e aplica R1: enquanto nenhuma empresa aprovar o cadastro do
 * cuidador, ele não entra nas telas internas.
 */
export function ProtectedRoute({ role, requireApproval = true, children }: ProtectedRouteProps) {
  const { session } = useSession();
  const { state } = useAppState();

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to="/login" replace />;
  if (!state) return null;

  if (role === "caregiver" && requireApproval && !isCaregiverActive(state, session.caregiverId)) {
    return <Navigate to="/cuidador/aguardando-aprovacao" replace />;
  }

  return <>{children}</>;
}
