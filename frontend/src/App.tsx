import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import OnboardingPage from "./features/auth/pages/OnboardingPage";
import AcceptInvitationPage from "./features/auth/pages/AcceptInvitationPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import UserManagementPage from "./features/users/pages/UserManagementPage";
import ProtectedRoute from "./lib/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-school" element={<OnboardingPage />} />
      <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserManagementPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
