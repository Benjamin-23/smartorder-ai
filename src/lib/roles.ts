import type { LucideIcon } from "lucide-react";
import { BarChart3, CheckSquare, ClipboardList, FileUp } from "lucide-react";
import type { UserRole } from "../types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  staff: [
    { label: "Dashboard", to: "/orders", icon: BarChart3 },
    { label: "New Order", to: "/orders/new", icon: FileUp },
  ],
  manager: [
    { label: "Dashboard", to: "/manager", icon: BarChart3 },
    { label: "Orders", to: "/orders", icon: ClipboardList },
    { label: "New Order", to: "/orders/new", icon: FileUp },
    { label: "Approvals", to: "/approvals", icon: CheckSquare },
  ],
  distributor: [{ label: "Dashboard", to: "/distributor", icon: BarChart3 }],
  admin: [{ label: "Dashboard", to: "/admin", icon: BarChart3 }],
};

export function getHomePathForRole(role: UserRole): string {
  switch (role) {
    case "staff":
      return "/orders";
    case "manager":
      return "/manager";
    case "distributor":
      return "/distributor";
    case "admin":
      return "/admin";
    default:
      return "/login";
  }
}
