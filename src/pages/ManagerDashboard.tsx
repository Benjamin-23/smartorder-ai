import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import { Building2, ClipboardList, Clock, Package, Power, PowerOff, Users } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Stat Card                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">{label}</p>
          <p className="mt-0.5 font-heading text-2xl font-bold text-foreground tabular-nums">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-2 text-xs text-foreground/50">{sub}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ManagerDashboard                                                          */
/* -------------------------------------------------------------------------- */

export default function ManagerDashboard() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* order stats */
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingApproval: 0,
    approved: 0,
    draft: 0,
  });

  /* team members */
  const [team, setTeam] = useState<{ id: string; full_name: string | null; role: string; is_active: boolean }[]>([]);

  /* ---- fetch ---- */
  const fetchData = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Order counts for this org
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);
      const { count: pendingApproval } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "pending_approval");
      const { count: approved } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "approved");
      const { count: draft } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "draft");

      setStats({
        totalOrders: totalOrders ?? 0,
        pendingApproval: pendingApproval ?? 0,
        approved: approved ?? 0,
        draft: draft ?? 0,
      });

      // Team members (staff only, for this org)
      const { data: teamData, error: teamErr } = await supabase
        .from("profiles")
        .select("id, full_name, role, is_active")
        .eq("organization_id", orgId)
        .neq("id", profile!.id) // exclude self
        .order("full_name");

      if (teamErr) throw new Error(teamErr.message);
      setTeam((teamData as typeof team) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data.");
    }

    setLoading(false);
  }, [orgId, profile]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  /* ---- toggle active ---- */
  const toggleActive = async (userId: string, currentActive: boolean) => {
    const { error: e } = await supabase
      .from("profiles")
      .update({ is_active: !currentActive })
      .eq("id", userId);
    if (e) {
      setError(e.message);
      return;
    }
    void fetchData();
  };

  /* ---- guard ---- */
  if (profile?.role !== "manager") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        You don&apos;t have permission to view this page.
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 px-6 py-5 text-sm text-foreground/70">
        You&apos;re not assigned to an organization yet. Contact your admin to get set up.
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Organization Dashboard</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Overview of your organization&apos;s orders and team.
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
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Orders" value={stats.totalOrders} />
        <StatCard icon={Clock} label="Pending Approval" value={stats.pendingApproval} sub="Requires your review" />
        <StatCard icon={ClipboardList} label="Approved" value={stats.approved} />
        <StatCard icon={Building2} label="Drafts" value={stats.draft} sub="Still being prepared by staff" />
      </div>

      {/* Team Management */}
      <div className="mt-10">
        <h2 className="font-heading text-lg font-bold text-foreground">Team Management</h2>
        <p className="mb-4 text-xs text-foreground/50">
          Activate or deactivate staff members. Inactive users cannot create or submit orders.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : team.length === 0 ? (
          <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
            <Users className="mx-auto h-8 w-8 text-foreground/25" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-foreground/70">No staff members yet</p>
            <p className="mt-1 text-xs text-foreground/50">
              When staff join your organization, they will appear here for management.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Role</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr
                    key={member.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 ${!member.is_active ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {member.full_name || "Unnamed"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/70">
                        {member.role === "staff" ? "Staff" : member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          member.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleActive(member.id, member.is_active)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                          member.is_active
                            ? "border border-destructive/30 text-destructive hover:bg-destructive/5"
                            : "border border-green-300 text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {member.is_active ? (
                          <>
                            <PowerOff className="h-3.5 w-3.5" aria-hidden="true" /> Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="h-3.5 w-3.5" aria-hidden="true" /> Activate
                          </>
                        )}
                      </button>
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
