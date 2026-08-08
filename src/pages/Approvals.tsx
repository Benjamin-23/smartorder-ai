import { CheckSquare } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function ApprovalsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Pending Approvals</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Review and approve orders submitted by your team.
      </p>

      <div className="mt-8">
        <EmptyState
          icon={CheckSquare}
          title="Nothing to review"
          description="Orders that need your approval will appear here. When staff submit orders for review, you'll see them in this queue."
        />
      </div>
    </div>
  );
}
