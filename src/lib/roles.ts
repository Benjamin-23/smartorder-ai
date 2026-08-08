import type { LucideIcon } from "lucide-react";
import { CheckSquare, ClipboardList, FileUp, Inbox, ShieldCheck } from "lucide-react";
import type { UserRole } from "../types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  staff: [
    { label: "New Order", to: "/orders/new", icon: FileUp },
    { label: "My Orders", to: "/orders", icon: ClipboardList },
  ],
  manager: [
    { label: "New Order", to: "/orders/new", icon: FileUp },
    { label: "My Orders", to: "/orders", icon: ClipboardList },
    { label: "Pending Approvals", to: "/approvals", icon: CheckSquare },
  ],
  distributor: [{ label: "Incoming Orders", to: "/distributor", icon: Inbox }],
  admin: [{ label: "Admin", to: "/admin", icon: ShieldCheck }],
};

export function getHomePathForRole(role: UserRole): string {
  switch (role) {
    case "staff":
    case "manager":
      return "/orders";
    case "distributor":
      return "/distributor";
    case "admin":
      return "/admin";
    default:
      return "/login";
  }
}
