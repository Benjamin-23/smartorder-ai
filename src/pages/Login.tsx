import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";
import { getHomePathForRole } from "../lib/roles";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LoadingScreen } from "../components/LoadingScreen";

export default function LoginPage() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupSuccess = searchParams.get("signup") === "success";

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
      setError("Please enter both your email and password.");
      return;
    }

    setSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "The email or password you entered is incorrect."
          : "We couldn't sign you in — please try again."
      );
      return;
    }

    // Auth state listener in AuthProvider will pick up the session
    // and set the profile, then the redirect above will kick in.
    navigate("/", { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your SmartOrder AI account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="cursor-pointer font-semibold text-primary underline decoration-primary/30 underline-offset-2 transition-colors duration-150 hover:text-primary/80"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {signupSuccess && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
            Account created! Check your email for a confirmation link, then sign in.
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
