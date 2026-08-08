import { FileUp } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";

export default function NewOrderPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">New Order</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Upload an order form or build one manually — AI will help with extraction.
      </p>

      <div className="mt-8">
        <EmptyState
          icon={FileUp}
          title="Order creation coming soon"
          description="This is where you'll upload purchase orders, capture them with your camera, or type them in manually. The AI will extract line items and suggest quantities automatically."
        />
      </div>
    </div>
  );
}
