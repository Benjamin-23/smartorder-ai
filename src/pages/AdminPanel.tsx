import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import { Building2, Package, Pencil, Plus, Power, PowerOff, Trash2, Truck, Users, X } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Distributor = { id: string; name: string; contact_email: string | null; created_at: string };
type Organization = { id: string; name: string; distributor_id: string | null; created_at: string };
type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  organization_id: string | null;
  distributor_id: string | null;
  role: string;
  is_active: boolean;
};

type Tab = "dashboard" | "distributors" | "organizations" | "users";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const TABS: { key: Tab; label: string; icon: typeof Truck }[] = [
  { key: "dashboard", label: "Dashboard", icon: Package },
  { key: "distributors", label: "Distributors", icon: Truck },
  { key: "organizations", label: "Organizations", icon: Building2 },
  { key: "users", label: "User Assignments", icon: Users },
];

const ROLE_LABELS: Record<string, string> = {
  staff: "Staff",
  manager: "Manager",
  distributor: "Distributor",
  admin: "Admin",
};

const sharedInputClass =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const sharedSelectClass =
  "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/* -------------------------------------------------------------------------- */
/*  Modal wrapper                                                             */
/* -------------------------------------------------------------------------- */

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-foreground/50 transition-colors duration-150 hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Confirmation dialog (for deletes)                                         */
/* -------------------------------------------------------------------------- */

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-foreground/70">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}

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
/*  Admin Panel                                                               */
/* -------------------------------------------------------------------------- */

export default function AdminPanelPage() {
  const { profile } = useAuth();

  const [tab, setTab] = useState<Tab>("dashboard");

  /* ---- data ---- */
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---- dashboard stats ---- */
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalPending: number;
    totalApproved: number;
    totalFulfilled: number;
  }>({ totalOrders: 0, totalPending: 0, totalApproved: 0, totalFulfilled: 0 });
  const [recentOrders, setRecentOrders] = useState<{
    id: string;
    status: string;
    orgName: string;
    distName: string;
    createdBy: string;
    created_at: string;
    itemCount: number;
  }[]>([]);

  /* ---- modals ---- */
  const [distModal, setDistModal] = useState<{ open: boolean; edit?: Distributor }>({ open: false });
  const [orgModal, setOrgModal] = useState<{ open: boolean; edit?: Organization }>({ open: false });
  const [userModal, setUserModal] = useState<{ open: boolean; edit?: Profile }>({ open: false });

  /* ---- confirm delete ---- */
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  /* ---- fetch ---- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [distRes, orgRes, profRes] = await Promise.all([
        supabase.from("distributors").select("*").order("name"),
        supabase.from("organizations").select("*").order("name"),
        supabase.from("profiles").select("*").order("full_name"),
      ]);
      if (distRes.error) throw new Error(distRes.error.message);
      if (orgRes.error) throw new Error(orgRes.error.message);
      if (profRes.error) throw new Error(profRes.error.message);
      setDistributors((distRes.data as Distributor[]) ?? []);
      setOrganizations((orgRes.data as Organization[]) ?? []);

      const enriched: Profile[] = [];
      for (const row of profRes.data as unknown as Profile[]) {
        enriched.push({ ...row, email: null });
      }
      setProfiles(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    }

    // Fetch order stats
    try {
      const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: totalPending } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_approval");
      const { count: totalApproved } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");
      const { count: totalFulfilled } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "fulfilled");

      setStats({
        totalOrders: totalOrders ?? 0,
        totalPending: totalPending ?? 0,
        totalApproved: totalApproved ?? 0,
        totalFulfilled: totalFulfilled ?? 0,
      });

      // Recent orders with join context
      const { data: recentOrd } = await supabase
        .from("orders")
        .select("id, status, organization_id, distributor_id, created_by, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      const rOrders = (recentOrd as {
        id: string;
        status: string;
        organization_id: string;
        distributor_id: string | null;
        created_by: string | null;
        created_at: string;
      }[] | null) ?? [];

      const orgNames = new Map(organizations.map((o) => [o.id, o.name]));
      const distNames = new Map(distributors.map((d) => [d.id, d.name]));
      const userNames = new Map(profiles.map((p) => [p.id, p.full_name ?? "Unknown"]));

      // Get item counts in parallel
      const withCounts = await Promise.all(
        rOrders.map(async (ro) => {
          const { count: c } = await supabase
            .from("order_items")
            .select("*", { count: "exact", head: true })
            .eq("order_id", ro.id);
          return {
            id: ro.id,
            status: ro.status,
            orgName: orgNames.get(ro.organization_id) ?? "—",
            distName: ro.distributor_id ? (distNames.get(ro.distributor_id) ?? "—") : "—",
            createdBy: ro.created_by ? (userNames.get(ro.created_by) ?? "—") : "—",
            created_at: ro.created_at,
            itemCount: c ?? 0,
          };
        })
      );

      setRecentOrders(withCounts);
    } catch {
      // Stats are best-effort; don't block the page
    }

    setLoading(false);
  }, [organizations, distributors, profiles]);

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- distributors ---- */
  const [distName, setDistName] = useState("");
  const [distEmail, setDistEmail] = useState("");
  const [distSaving, setDistSaving] = useState(false);

  const openDistModal = (d?: Distributor) => {
    setDistName(d?.name ?? "");
    setDistEmail(d?.contact_email ?? "");
    setDistModal({ open: true, edit: d });
  };

  const saveDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distName.trim()) return;
    setDistSaving(true);
    const payload = { name: distName.trim(), contact_email: distEmail.trim() || null };
    if (distModal.edit) {
      await supabase.from("distributors").update(payload).eq("id", distModal.edit.id);
    } else {
      await supabase.from("distributors").insert(payload);
    }
    setDistSaving(false);
    setDistModal({ open: false });
    void fetchData();
  };

  const confirmDeleteDist = (d: Distributor) => {
    setConfirm({
      open: true,
      title: "Delete Distributor",
      message: `Delete "${d.name}"? Organizations linked to this distributor will lose their assignment.`,
      onConfirm: async () => {
        setConfirmLoading(true);
        await supabase.from("distributors").delete().eq("id", d.id);
        setConfirmLoading(false);
        setConfirm({ open: false, title: "", message: "", onConfirm: () => {} });
        void fetchData();
      },
    });
  };

  /* ---- organizations ---- */
  const [orgName, setOrgName] = useState("");
  const [orgDistId, setOrgDistId] = useState("");
  const [orgSaving, setOrgSaving] = useState(false);

  const openOrgModal = (o?: Organization) => {
    setOrgName(o?.name ?? "");
    setOrgDistId(o?.distributor_id ?? "");
    setOrgModal({ open: true, edit: o });
  };

  const saveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setOrgSaving(true);
    const payload: Record<string, unknown> = { name: orgName.trim(), distributor_id: orgDistId || null };
    if (orgModal.edit) {
      await supabase.from("organizations").update(payload).eq("id", orgModal.edit.id);
    } else {
      await supabase.from("organizations").insert(payload);
    }
    setOrgSaving(false);
    setOrgModal({ open: false });
    void fetchData();
  };

  const confirmDeleteOrg = (o: Organization) => {
    setConfirm({
      open: true,
      title: "Delete Organization",
      message: `Delete "${o.name}"? Staff and managers assigned to it will be orphaned.`,
      onConfirm: async () => {
        setConfirmLoading(true);
        await supabase.from("organizations").delete().eq("id", o.id);
        setConfirmLoading(false);
        setConfirm({ open: false, title: "", message: "", onConfirm: () => {} });
        void fetchData();
      },
    });
  };

  /* ---- user assignments ---- */
  const [userRole, setUserRole] = useState("staff");
  const [userOrgId, setUserOrgId] = useState("");
  const [userDistId, setUserDistId] = useState("");
  const [userSaving, setUserSaving] = useState(false);

  const openUserModal = (p?: Profile) => {
    setUserRole(p?.role ?? "staff");
    setUserOrgId(p?.organization_id ?? "");
    setUserDistId(p?.distributor_id ?? "");
    setUserModal({ open: true, edit: p });
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModal.edit) return;
    setUserSaving(true);
    const payload: Record<string, unknown> = { role: userRole };

    if (userRole === "distributor") {
      payload.organization_id = null;
      payload.distributor_id = userDistId || null;
    } else if (userRole === "staff" || userRole === "manager") {
      payload.organization_id = userOrgId || null;
      payload.distributor_id = null;
    } else {
      // admin
      payload.organization_id = null;
      payload.distributor_id = null;
    }

    await supabase.from("profiles").update(payload).eq("id", userModal.edit.id);
    setUserSaving(false);
    setUserModal({ open: false });
    void fetchData();
  };

  /* ---- toggle active ---- */
  const toggleActive = async (p: Profile) => {
    const { error: e } = await supabase
      .from("profiles")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (e) {
      setError(e.message);
      return;
    }
    void fetchData();
  };

  /* ---- derived ---- */
  const distMap = new Map(distributors.map((d) => [d.id, d.name]));
  const orgMap = new Map(organizations.map((o) => [o.id, o.name]));
  const activeUsers = profiles.filter((p) => p.is_active).length;
  const inactiveUsers = profiles.length - activeUsers;

  const orgWithDist = organizations.filter((o) => o.distributor_id).length;

  const STATUS_LABELS: Record<string, string> = {
    draft: "Draft",
    pending_approval: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
    fulfilled: "Fulfilled",
  };

  /* ---- guard ---- */
  if (profile?.role !== "admin") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-5 text-sm text-destructive">
        You don&apos;t have permission to view this page.
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Admin Panel</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Manage distributors, organizations, and user assignments.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-muted p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 ${
              tab === t.key
                ? "bg-white text-primary shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* ================================================================= */}
      {/*  DASHBOARD                                                        */}
      {/* ================================================================= */}
      {tab === "dashboard" && (
        <div className="mt-6" role="tabpanel" aria-label="Dashboard">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Building2} label="Organizations" value={organizations.length} sub={`${orgWithDist} linked to a distributor`} />
            <StatCard icon={Truck} label="Distributors" value={distributors.length} />
            <StatCard icon={Users} label="Active Users" value={activeUsers} sub={`${inactiveUsers} inactive`} />
            <StatCard icon={Package} label="Total Orders" value={stats.totalOrders} sub={`${stats.totalPending} pending · ${stats.totalApproved} approved · ${stats.totalFulfilled} fulfilled`} />
          </div>

          {/* Recent orders */}
          <div className="mt-8">
            <h2 className="font-heading text-lg font-bold text-foreground">Recent Orders</h2>
            <p className="mb-4 text-xs text-foreground/50">Last 10 orders across all organizations</p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
                <Package className="mx-auto h-8 w-8 text-foreground/25" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-foreground/70">No orders yet</p>
                <p className="mt-1 text-xs text-foreground/50">
                  Orders created across all organizations will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/60">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-foreground">Organization</th>
                      <th className="px-4 py-3 font-semibold text-foreground">Distributor</th>
                      <th className="px-4 py-3 font-semibold text-foreground">Items</th>
                      <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 font-semibold text-foreground">By</th>
                      <th className="px-4 py-3 font-semibold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{o.orgName}</td>
                        <td className="px-4 py-3 text-foreground/60">{o.distName}</td>
                        <td className="px-4 py-3 tabular-nums text-foreground/60">{o.itemCount}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              o.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : o.status === "pending_approval"
                                  ? "bg-accent/10 text-accent"
                                  : o.status === "rejected"
                                    ? "bg-destructive/10 text-destructive"
                                    : o.status === "fulfilled"
                                      ? "bg-secondary/10 text-secondary"
                                      : "bg-muted text-foreground/60"
                            }`}
                          >
                            {STATUS_LABELS[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground/60">{o.createdBy}</td>
                        <td className="px-4 py-3 text-foreground/50 text-xs tabular-nums">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/*  DISTRIBUTORS                                                     */}
      {/* ================================================================= */}
      {tab === "distributors" && (
        <div className="mt-6" role="tabpanel" aria-label="Distributors">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-foreground/50">
              {distributors.length} distributor{distributors.length !== 1 && "s"}
            </p>
            <button
              type="button"
              onClick={() => openDistModal()}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Add
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : distributors.length === 0 ? (
            <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
              <Truck className="mx-auto h-8 w-8 text-foreground/25" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-foreground/70">No distributors yet</p>
              <p className="mt-1 text-xs text-foreground/50">
                Add your first distributor to assign them to organizations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Contact Email</th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {distributors.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                      <td className="px-4 py-3 text-foreground/60">{d.contact_email || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openDistModal(d)}
                            className="cursor-pointer rounded-md p-1.5 text-foreground/50 transition-colors duration-150 hover:bg-muted hover:text-foreground"
                            aria-label={`Edit ${d.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDeleteDist(d)}
                            className="cursor-pointer rounded-md p-1.5 text-foreground/50 transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${d.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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
      )}

      {/* ================================================================= */}
      {/*  ORGANIZATIONS                                                    */}
      {/* ================================================================= */}
      {tab === "organizations" && (
        <div className="mt-6" role="tabpanel" aria-label="Organizations">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-foreground/50">
              {organizations.length} organization{organizations.length !== 1 && "s"}
            </p>
            <button
              type="button"
              onClick={() => openOrgModal()}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Add
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : organizations.length === 0 ? (
            <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
              <Building2 className="mx-auto h-8 w-8 text-foreground/25" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-foreground/70">No organizations yet</p>
              <p className="mt-1 text-xs text-foreground/50">
                Add an organization and assign it to a distributor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Distributor</th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{o.name}</td>
                      <td className="px-4 py-3 text-foreground/60">
                        {o.distributor_id ? distMap.get(o.distributor_id) ?? "—" : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openOrgModal(o)}
                            className="cursor-pointer rounded-md p-1.5 text-foreground/50 transition-colors duration-150 hover:bg-muted hover:text-foreground"
                            aria-label={`Edit ${o.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDeleteOrg(o)}
                            className="cursor-pointer rounded-md p-1.5 text-foreground/50 transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Delete ${o.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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
      )}

      {/* ================================================================= */}
      {/*  USER ASSIGNMENTS                                                 */}
      {/* ================================================================= */}
      {tab === "users" && (
        <div className="mt-6" role="tabpanel" aria-label="User Assignments">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-foreground/50">
              {profiles.length} user{profiles.length !== 1 && "s"} · {activeUsers} active · {inactiveUsers} inactive
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-foreground/25" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-foreground/70">No users signed up yet</p>
              <p className="mt-1 text-xs text-foreground/50">
                Users who sign up will appear here for role and assignment management.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">User</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Role</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Organization</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Distributor</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Active</th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 ${!p.is_active ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">
                          {p.full_name || "Unnamed"}
                        </span>
                        {p.email && (
                          <span className="block text-xs text-foreground/50">{p.email}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            p.role === "admin"
                              ? "bg-destructive/10 text-destructive"
                              : p.role === "manager"
                                ? "bg-primary/10 text-primary"
                                : p.role === "distributor"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-muted text-foreground/70"
                          }`}
                        >
                          {ROLE_LABELS[p.role] ?? p.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/60">
                        {p.organization_id ? orgMap.get(p.organization_id) ?? "—" : "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground/60">
                        {p.distributor_id ? distMap.get(p.distributor_id) ?? "—" : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(p)}
                          className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-all duration-150 ${
                            p.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          }`}
                          title={p.is_active ? "Deactivate this user" : "Activate this user"}
                        >
                          {p.is_active ? (
                            <>
                              <Power className="h-3 w-3" aria-hidden="true" /> Active
                            </>
                          ) : (
                            <>
                              <PowerOff className="h-3 w-3" aria-hidden="true" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openUserModal(p)}
                          className="cursor-pointer rounded-md p-1.5 text-foreground/50 transition-colors duration-150 hover:bg-muted hover:text-foreground"
                          aria-label={`Edit assignment for ${p.full_name || "user"}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/*  MODALS                                                           */}
      {/* ================================================================= */}

      {/* Distributor modal */}
      <Modal
        open={distModal.open}
        onClose={() => setDistModal({ open: false })}
        title={distModal.edit ? "Edit Distributor" : "New Distributor"}
      >
        <form onSubmit={saveDistributor} className="space-y-4">
          <div>
            <label htmlFor="dist-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="dist-name"
              required
              value={distName}
              onChange={(e) => setDistName(e.target.value)}
              placeholder="Fresh Farms Ltd."
              className={sharedInputClass}
            />
          </div>
          <div>
            <label htmlFor="dist-email" className="mb-1.5 block text-sm font-medium text-foreground">
              Contact Email
            </label>
            <input
              id="dist-email"
              type="email"
              value={distEmail}
              onChange={(e) => setDistEmail(e.target.value)}
              placeholder="hello@freshfarms.com"
              className={sharedInputClass}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDistModal({ open: false })}
              className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={distSaving}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {distSaving ? "Saving…" : distModal.edit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Organization modal */}
      <Modal
        open={orgModal.open}
        onClose={() => setOrgModal({ open: false })}
        title={orgModal.edit ? "Edit Organization" : "New Organization"}
      >
        <form onSubmit={saveOrganization} className="space-y-4">
          <div>
            <label htmlFor="org-name" className="mb-1.5 block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="org-name"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Sunrise Supermarket"
              className={sharedInputClass}
            />
          </div>
          <div>
            <label htmlFor="org-dist" className="mb-1.5 block text-sm font-medium text-foreground">
              Distributor
            </label>
            <select
              id="org-dist"
              value={orgDistId}
              onChange={(e) => setOrgDistId(e.target.value)}
              className={sharedSelectClass}
            >
              <option value="">None</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOrgModal({ open: false })}
              className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={orgSaving}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {orgSaving ? "Saving…" : orgModal.edit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* User assignment modal */}
      <Modal
        open={userModal.open}
        onClose={() => setUserModal({ open: false })}
        title={`Assign: ${userModal.edit?.full_name || userModal.edit?.id?.slice(0, 8) || "User"}`}
      >
        <form onSubmit={saveUser} className="space-y-4">
          <div>
            <label htmlFor="user-role" className="mb-1.5 block text-sm font-medium text-foreground">
              Role
            </label>
            <select
              id="user-role"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className={sharedSelectClass}
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="distributor">Distributor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {userRole === "distributor" && (
            <div>
              <label htmlFor="user-dist" className="mb-1.5 block text-sm font-medium text-foreground">
                Distributor
              </label>
              <select
                id="user-dist"
                value={userDistId}
                onChange={(e) => setUserDistId(e.target.value)}
                className={sharedSelectClass}
              >
                <option value="">None</option>
                {distributors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(userRole === "staff" || userRole === "manager") && (
            <div>
              <label htmlFor="user-org" className="mb-1.5 block text-sm font-medium text-foreground">
                Organization
              </label>
              <select
                id="user-org"
                value={userOrgId}
                onChange={(e) => setUserOrgId(e.target.value)}
                className={sharedSelectClass}
              >
                <option value="">None</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              {(userRole === "manager" || userRole === "staff") && (
                <p className="mt-1 text-xs text-foreground/50">
                  {userRole === "manager"
                    ? "Managers will see this organization's dashboard and manage its staff."
                    : "Staff will be able to create and view orders for this organization."}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setUserModal({ open: false })}
              className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={userSaving}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {userSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, title: "", message: "", onConfirm: () => {} })}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        loading={confirmLoading}
      />
    </div>
  );
}
