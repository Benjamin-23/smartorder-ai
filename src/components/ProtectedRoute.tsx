import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { LoadingScreen } from "./LoadingScreen";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
