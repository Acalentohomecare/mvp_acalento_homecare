import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./app/AppStateProvider";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { RolagemAoTopo } from "./app/RolagemAoTopo";
import { SessionProvider } from "./app/SessionProvider";
import { ToastProvider } from "./components/ui";
import { useSession } from "./hooks/useSession";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PendingApprovalPage } from "./pages/PendingApprovalPage";
import { CompanyLayout } from "./layouts/CompanyLayout";
import { CaregiverLayout } from "./layouts/CaregiverLayout";
import { AttendanceDetailPage } from "./pages/shared/AttendanceDetailPage";
import { NotificationsPage } from "./pages/shared/NotificationsPage";
import { ReportsPage } from "./pages/company/ReportsPage";
import { CompanySchedulePage } from "./pages/company/SchedulePage";
import { CompanyDashboardPage } from "./pages/company/DashboardPage";
import { CompanyAttendancesPage } from "./pages/company/AttendancesPage";
import { NewAttendancePage } from "./pages/company/NewAttendancePage";
import { MatchingPage } from "./pages/company/MatchingPage";
import { ApplicationsPage } from "./pages/company/ApplicationsPage";
import { CompanyCaregiversPage } from "./pages/company/CaregiversPage";
import { CompanyCaregiverProfilePage } from "./pages/company/CaregiverProfilePage";
import { CompanySettingsPage } from "./pages/company/SettingsPage";
import { CaregiverDashboardPage } from "./pages/caregiver/DashboardPage";
import { CaregiverProfilePage } from "./pages/caregiver/ProfilePage";
import { CaregiverAttendancesPage } from "./pages/caregiver/AttendancesPage";
import { CaregiverInvitationsPage } from "./pages/caregiver/InvitationsPage";
import { CaregiverSchedulePage } from "./pages/caregiver/SchedulePage";

function IndexRedirect() {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role === "company") return <Navigate to="/empresa" replace />;
  return <Navigate to="/cuidador" replace />;
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
        element={
          <ProtectedRoute role="company">
            <CompanyLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/empresa" element={<CompanyDashboardPage />} />
        <Route path="/empresa/atendimentos" element={<CompanyAttendancesPage />} />
        <Route path="/empresa/atendimentos/novo" element={<NewAttendancePage />} />
        <Route path="/empresa/atendimentos/:attendanceId/cuidadores" element={<MatchingPage />} />
        <Route path="/empresa/atendimentos/:attendanceId/candidaturas" element={<ApplicationsPage />} />
        <Route path="/empresa/atendimentos/:attendanceId" element={<AttendanceDetailPage />} />
        <Route path="/empresa/agenda" element={<CompanySchedulePage />} />
        <Route path="/empresa/relatorios" element={<ReportsPage />} />
        <Route path="/empresa/notificacoes" element={<NotificationsPage />} />
        <Route path="/empresa/configuracoes" element={<CompanySettingsPage />} />
        <Route path="/empresa/cuidadores" element={<CompanyCaregiversPage />} />
        <Route path="/empresa/cuidadores/:caregiverId" element={<CompanyCaregiverProfilePage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute role="caregiver">
            <CaregiverLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/cuidador" element={<CaregiverDashboardPage />} />
        <Route path="/cuidador/perfil" element={<CaregiverProfilePage />} />
        <Route path="/cuidador/convites" element={<CaregiverInvitationsPage />} />
        <Route path="/cuidador/agenda" element={<CaregiverSchedulePage />} />
        <Route path="/cuidador/notificacoes" element={<NotificationsPage />} />
        <Route path="/cuidador/atendimentos" element={<CaregiverAttendancesPage />} />
        <Route path="/cuidador/atendimentos/:attendanceId" element={<AttendanceDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <SessionProvider>
          {/* O aviso flutuante precisa sobreviver à troca de tela: quem publica um atendimento
              e é levado de volta para a lista só vê a confirmação se ela não morrer na
              navegação (DESIGN_SYSTEM.md, seção 8.4). */}
          <ToastProvider>
            <RolagemAoTopo />
            <AppRoutes />
          </ToastProvider>
        </SessionProvider>
      </AppStateProvider>
    </BrowserRouter>
  );
}
