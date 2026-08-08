import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";
import { ClipboardList, Clock, Package, TrendingUp } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type OrderRow = {
  id: string;
  status: string;
  created_at: string;
  item_count: number;
};

/* -------------------------------------------------------------------------- */
/*  Stat Card                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">{label}</p>
          <p className="mt-0.5 font-heading text-2xl font-bold text-foreground tabular-nums">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Status badge                                                              */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  fulfilled: "Fulfilled",
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-muted text-foreground/60",
    pending_approval: "bg-accent/10 text-accent",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-destructive/10 text-destructive",
    fulfilled: "bg-secondary/10 text-secondary",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status] ?? "bg-muted text-foreground/60"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  OrdersList                                                                */
/* -------------------------------------------------------------------------- */

export default function OrdersListPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });

  const fetchOrders = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbErr } = await supabase
        .from("orders")
        .select("id, status, created_at")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (dbErr) throw new Error(dbErr.message);

      const raw = (data as { id: string; status: string; created_at: string }[]) ?? [];

      // Counts
      let pending = 0;
      let approved = 0;
      for (const r of raw) {
        if (r.status === "pending_approval") pending++;
        else if (r.status === "approved") approved++;
      }
      setStats({ total: raw.length, pending, approved });

      // Get item counts
      const withCounts: OrderRow[] = [];
      for (const o of raw) {
        const { count: c } = await supabase
          .from("order_items")
          .select("*", { count: "exact", head: true })
          .eq("order_id", o.id);
        withCounts.push({ ...o, item_count: c ?? 0 });
      }
      setOrders(withCounts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    }

    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">My Orders</h1>
      <p className="mt-1 text-sm text-foreground/60">
        View and track orders for your organization.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={Package} label="Total Orders" value={stats.total} />
        <StatCard icon={Clock} label="Pending Approval" value={stats.pending} />
        <StatCard icon={TrendingUp} label="Approved" value={stats.approved} />
      </div>

      {/* Orders table */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-foreground">All Orders</h2>
        <p className="mb-4 text-xs text-foreground/50">Most recent first</p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Orders you create will appear here. Head over to New Order to get started."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Order</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Items</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                      {o.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground/60">{o.item_count}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground/50 tabular-nums">
                      {new Date(o.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
