import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import { CheckCircle2, CheckSquare, XCircle } from "lucide-react";
import { EmptyState } from "../components/EmptyState";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type PendingOrder = {
  id: string;
  status: string;
  created_by_name: string;
  created_at: string;
  item_count: number;
};

/* -------------------------------------------------------------------------- */
/*  ApprovalsPage                                                             */
/* -------------------------------------------------------------------------- */

export default function ApprovalsPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbErr } = await supabase
        .from("orders")
        .select("id, status, created_by, created_at")
        .eq("organization_id", orgId)
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });

      if (dbErr) throw new Error(dbErr.message);

      const raw = (data as {
        id: string;
        status: string;
        created_by: string | null;
        created_at: string;
      }[]) ?? [];

      // Resolve created_by names
      const userIds = [...new Set(raw.map((r) => r.created_by).filter(Boolean))] as string[];
      const userMap = new Map<string, string>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        for (const p of (profiles as { id: string; full_name: string | null }[]) ?? []) {
          userMap.set(p.id, p.full_name ?? "Unknown");
        }
      }

      // Get item counts
      const withCounts: PendingOrder[] = [];
      for (const o of raw) {
        const { count: c } = await supabase
          .from("order_items")
          .select("*", { count: "exact", head: true })
          .eq("order_id", o.id);
        withCounts.push({
          ...o,
          created_by_name: o.created_by ? (userMap.get(o.created_by) ?? "—") : "—",
          item_count: c ?? 0,
        });
      }

      setPendingOrders(withCounts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load pending orders.");
    }

    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    void fetchPending();
  }, [fetchPending]);

  const handleApprove = async (orderId: string) => {
    setActionLoading(orderId);
    setActionError(null);
    const { error: e } = await supabase
      .from("orders")
      .update({
        status: "approved",
        approved_by: profile!.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    if (e) {
      setActionError(e.message);
    } else {
      void fetchPending();
    }
    setActionLoading(null);
  };

  const handleReject = async (orderId: string) => {
    setActionLoading(orderId);
    setActionError(null);
    const { error: e } = await supabase
      .from("orders")
      .update({ status: "rejected" })
      .eq("id", orderId);
    if (e) {
      setActionError(e.message);
    } else {
      void fetchPending();
    }
    setActionLoading(null);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Pending Approvals</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Review and approve orders submitted by your team.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : pendingOrders.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Nothing to review"
            description="Orders that need your approval will appear here. When staff submit orders for review, you'll see them in this queue."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Order</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Items</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Submitted By</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                      {o.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground/60">{o.item_count}</td>
                    <td className="px-4 py-3 text-foreground/60">{o.created_by_name}</td>
                    <td className="px-4 py-3 text-xs text-foreground/50 tabular-nums">
                      {new Date(o.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(o.id)}
                          disabled={actionLoading === o.id}
                          className="flex cursor-pointer items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-all duration-150 hover:bg-destructive/5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(o.id)}
                          disabled={actionLoading === o.id}
                          className="flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                        </button>
                      </div>
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