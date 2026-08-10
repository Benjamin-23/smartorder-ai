import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import { getHomePathForRole } from "../lib/roles";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LoadingScreen } from "../components/LoadingScreen";

export default function SignupPage() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auth is still initializing — show a spinner, not a blank screen
  if (loading) return <LoadingScreen />;

  // Already authenticated — redirect to role home
  if (session && profile) {
    return <Navigate to={getHomePathForRole(profile.role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields to create your account.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);

    // Sign up the user — Supabase sends a confirmation email by default if
    // email confirmations are enabled. The profile row is created via a
    // database trigger (see schema migration task).
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Always redirect to the live deployed app, even during local dev.
        // In preview environments window.location.origin is dynamic and works
        // correctly; for local dev we fall back to the production URL.
        emailRedirectTo: import.meta.env.DEV
          ? "https://5kounty7o2ylwej5iy52r3d9c.nativelyai.app/login"
          : `${window.location.origin}/login`,
      },
    });

    setSubmitting(false);

    if (authError) {
      setError(
        authError.message.includes("already registered")
          ? "An account with this email already exists."
          : "We couldn't create your account — please try again."
      );
      return;
    }

    // Success — send to login with a flag so they see a confirmation message
    navigate("/login?signup=success", { replace: true });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing orders with SmartOrder AI"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="cursor-pointer font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors duration-150 hover:text-primary/80"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
