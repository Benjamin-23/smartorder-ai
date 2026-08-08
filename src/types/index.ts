export type UserRole = "staff" | "manager" | "distributor" | "admin";

export interface Profile {
  id: string;
  organization_id: string | null;
  distributor_id: string | null;
  role: UserRole;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
