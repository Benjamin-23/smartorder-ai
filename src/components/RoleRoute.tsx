import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { getHomePathForRole } from "../lib/roles";
import type { UserRole } from "../types";

export function RoleRoute({ allow }: { allow: UserRole[] }) {
  const { profile } = useAuth();

  // ProtectedRoute (rendered above this in the tree) already handles the
  // loading/no-session cases, so by the time we get here profile is either
  // populated or briefly null while it loads.
  if (!profile) return null;

  if (!allow.includes(profile.role)) {
    return <Navigate to={getHomePathForRole(profile.role)} replace />;
  }

  return <Outlet />;
}
