import { ShieldCheck } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function AdminPanelPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Admin Panel</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Manage organizations, distributors, and user assignments.
      </p>

      <div className="mt-8">
        <EmptyState
          icon={ShieldCheck}
          title="Administration coming soon"
          description="This is where you'll create and manage organizations, assign distributors, and control which users belong to which tenant."
        />
      </div>
    </div>
  );
}
