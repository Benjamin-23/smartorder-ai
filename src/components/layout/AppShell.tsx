import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { NAV_ITEMS } from "../../lib/roles";

export function AppShell() {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = profile ? NAV_ITEMS[profile.role] : [];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed z-40 flex h-screen w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="font-heading text-lg font-bold text-primary">SmartOrder AI</span>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-foreground/60 transition-colors duration-150 hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <p className="truncate px-3 text-sm font-medium text-foreground">
            {profile?.full_name || "Account"}
          </p>
          <p className="px-3 text-xs capitalize text-foreground/50">{profile?.role}</p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col overflow-y-auto">
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            className="cursor-pointer rounded-md p-2 text-foreground/70 transition-colors duration-150 hover:bg-muted md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground/70 transition-all duration-150 hover:bg-muted active:scale-[0.97]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
