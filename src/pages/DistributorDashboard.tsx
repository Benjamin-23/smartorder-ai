import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import { CheckCircle2, Clock, Inbox, Package } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type OrderRow = {
  id: string;
  status: string;
  org_name: string;
  created_by_name: string;
  item_count: number;
  created_at: string;
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
    <div className="rounded-xl border border-border bg-surface p-4 transition-shadow duration-200 hover:shadow-md">
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
    approved: "bg-success-bg text-success",
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
/*  DistributorDashboard                                                      */
/* -------------------------------------------------------------------------- */

export default function DistributorDashboardPage() {
  const { profile } = useAuth();
  const distId = profile?.distributor_id;

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, approved: 0, fulfilled: 0 });

  const fetchOrders = useCallback(async () => {
    if (!distId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbErr } = await supabase
        .from("orders")
        .select("id, status, organization_id, created_by, created_at")
        .eq("distributor_id", distId)
        .order("created_at", { ascending: false });

      if (dbErr) throw new Error(dbErr.message);

      const raw = (data as {
        id: string;
        status: string;
        organization_id: string;
        created_by: string | null;
        created_at: string;
      }[]) ?? [];

      // Stats
      let approved = 0;
      let fulfilled = 0;
      for (const r of raw) {
        if (r.status === "approved") approved++;
        else if (r.status === "fulfilled") fulfilled++;
      }
      setStats({ total: raw.length, approved, fulfilled });

      // Resolve org names and profile names
      const orgIds = [...new Set(raw.map((r) => r.organization_id).filter(Boolean))];
      const profileIds = [...new Set(raw.map((r) => r.created_by).filter(Boolean))] as string[];

      const orgMap = new Map<string, string>();
      const userMap = new Map<string, string>();

      // Batch fetch org names
      if (orgIds.length > 0) {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id, name")
          .in("id", orgIds);
        for (const o of (orgs as { id: string; name: string }[]) ?? []) {
          orgMap.set(o.id, o.name);
        }
      }

      // Batch fetch profile names
      if (profileIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", profileIds);
        for (const p of (profiles as { id: string; full_name: string | null }[]) ?? []) {
          userMap.set(p.id, p.full_name ?? "Unknown");
        }
      }

      // Get item counts
      const withCounts: OrderRow[] = [];
      for (const o of raw) {
        const { count: c } = await supabase
          .from("order_items")
          .select("*", { count: "exact", head: true })
          .eq("order_id", o.id);
        withCounts.push({
          ...o,
          org_name: orgMap.get(o.organization_id) ?? "—",
          created_by_name: o.created_by ? (userMap.get(o.created_by) ?? "—") : "—",
          item_count: c ?? 0,
        });
      }
      setOrders(withCounts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    }

    setLoading(false);
  }, [distId]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Incoming Orders</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Orders sent to you by your partner organizations.
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
        <StatCard icon={Package} label="Total Received" value={stats.total} />
        <StatCard icon={Clock} label="Awaiting Fulfillment" value={stats.approved} />
        <StatCard icon={CheckCircle2} label="Fulfilled" value={stats.fulfilled} />
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
            icon={Inbox}
            title="No orders yet"
            description="When an organization approves an order and sends it to you, it will appear here for fulfillment."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Order</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Organization</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Items</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Created By</th>
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
                    <td className="px-4 py-3 font-medium text-foreground">{o.org_name}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground/60">{o.item_count}</td>
                    <td className="px-4 py-3 text-foreground/60">{o.created_by_name}</td>
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