export type UserRole = "staff" | "manager" | "distributor" | "admin";

export interface Profile {
  id: string;
  organization_id: string | null;
  distributor_id: string | null;
  role: UserRole;
  full_name: string | null;
  created_at: string;
}
