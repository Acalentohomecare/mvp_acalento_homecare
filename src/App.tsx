import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./app/AppStateProvider";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { SessionProvider } from "./app/SessionProvider";
import { useSession } from "./hooks/useSession";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PendingApprovalPage } from "./pages/PendingApprovalPage";
import { CompanyDashboardPage } from "./pages/company/DashboardPage";
import { CaregiverDashboardPage } from "./pages/caregiver/DashboardPage";
import { AdminApprovalsPage } from "./pages/admin/ApprovalsPage";

function IndexRedirect() {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role === "company") return <Navigate to="/empresa" replace />;
  if (session.role === "caregiver") return <Navigate to="/cuidador" replace />;
  return <Navigate to="/admin" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route
        path="/cuidador/aguardando-aprovacao"
        element={
          <ProtectedRoute role="caregiver" requireApproval={false}>
            <PendingApprovalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa"
        element={
          <ProtectedRoute role="company">
            <CompanyDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuidador"
        element={
          <ProtectedRoute role="caregiver">
            <CaregiverDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <SessionProvider>
          <AppRoutes />
        </SessionProvider>
      </AppStateProvider>
    </BrowserRouter>
  );
}
