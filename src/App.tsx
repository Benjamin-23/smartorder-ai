import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";
import { AppShell } from "./components/layout/AppShell";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import OrdersListPage from "./pages/orders/OrdersList";
import NewOrderPage from "./pages/orders/NewOrder";
import ApprovalsPage from "./pages/Approvals";
import ManagerDashboardPage from "./pages/ManagerDashboard";
import DistributorDashboardPage from "./pages/DistributorDashboard";
import AdminPanelPage from "./pages/AdminPanel";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes — landing and auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Authenticated routes inside the app shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              {/* Staff + Manager routes */}
              <Route element={<RoleRoute allow={["staff", "manager"]} />}>
                <Route path="/orders" element={<OrdersListPage />} />
                <Route path="/orders/new" element={<NewOrderPage />} />
              </Route>

              {/* Manager-only routes */}
              <Route element={<RoleRoute allow={["manager"]} />}>
                <Route path="/manager" element={<ManagerDashboardPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
              </Route>

              {/* Distributor route */}
              <Route element={<RoleRoute allow={["distributor"]} />}>
                <Route path="/distributor" element={<DistributorDashboardPage />} />
              </Route>

              {/* Admin route */}
              <Route element={<RoleRoute allow={["admin"]} />}>
                <Route path="/admin" element={<AdminPanelPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all: redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
