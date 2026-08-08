import { ClipboardList } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";

export default function OrdersListPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">My Orders</h1>
      <p className="mt-1 text-sm text-foreground/60">
        View and track orders you&apos;ve submitted.
      </p>

      <div className="mt-8">
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Orders you create will appear here. Head over to New Order to get started."
        />
      </div>
    </div>
  );
}
