import { Inbox } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

export default function DistributorDashboardPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Incoming Orders</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Orders sent to you by your partner organizations.
      </p>

      <div className="mt-8">
        <EmptyState
          icon={Inbox}
          title="No orders yet"
          description="When an organization approves an order and sends it to you, it will appear here for fulfillment."
        />
      </div>
    </div>
  );
}
