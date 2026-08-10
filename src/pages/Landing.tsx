import { Link, Navigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";
import { useAuth } from "../lib/auth-context";
import { getHomePathForRole } from "../lib/roles";
import { LoadingScreen } from "../components/LoadingScreen";
import { HeroScene } from "../components/HeroScene";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stepVariant: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const features = [
  {
    icon: Camera,
    title: "Snap a Photo",
    description:
      "Take a picture of any paper order sheet or upload a PDF — our AI reads it instantly.",
  },
  {
    icon: Sparkles,
    title: "AI Extraction",
    description:
      "OpenAI-powered vision extracts every line item: product name, quantity, and unit — no typing required.",
  },
  {
    icon: ShieldCheck,
    title: "Manager Approval",
    description:
      "Every order flows through a review step. Nothing reaches your distributor without human sign-off.",
  },
  {
    icon: Zap,
    title: "Smart Suggestions",
    description:
      "Quantities are pre-filled from your last order. Just confirm or tweak — no guessing.",
  },
  {
    icon: Truck,
    title: "Instant Notifications",
    description:
      "As soon as an order is approved, your distributor gets an email with all the details.",
  },
  {
    icon: CheckCircle2,
    title: "Full Audit Trail",
    description:
      "Every order tracked from creation to fulfillment. Know who created, approved, and when.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload",
    desc: "Snap a photo or upload a PDF of your order sheet.",
  },
  {
    step: "02",
    title: "Review",
    desc: "AI extracts the line items. Edit or add anything in seconds.",
  },
  {
    step: "03",
    title: "Approve",
    desc: "A manager reviews and approves — one click.",
  },
  {
    step: "04",
    title: "Deliver",
    desc: "The distributor is notified instantly via email.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Landing Page                                                              */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  const { session, profile, loading } = useAuth();

  // Parallax scroll effect for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  // Still determining auth state — show a clean spinner
  if (loading) return <LoadingScreen />;

  // Already logged in — redirect to role-specific home
  if (session && profile) {
    return <Navigate to={getHomePathForRole(profile.role)} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── 3D Scene Background ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Rich gradient layer behind the 3D canvas */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(70% 55% at 50% 0%, color-mix(in oklch, var(--color-primary) 22%, transparent) 0%, transparent 70%),
              radial-gradient(40% 35% at 80% 70%, color-mix(in oklch, var(--color-accent) 12%, transparent) 0%, transparent 60%),
              radial-gradient(35% 40% at 20% 60%, color-mix(in oklch, var(--color-secondary) 14%, transparent) 0%, transparent 60%),
              var(--color-background)
            `,
          }}
        />
        <HeroScene />
        {/* Subtle dot grid overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-md focus:ring-2 focus:ring-primary/20"
      >
        Skip to main content
      </a>

      {/* ── Nav ────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-30 border-b border-transparent bg-background/60 backdrop-blur-xl"
      >
        <nav className="flex items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <span className="font-heading text-lg font-bold text-primary">
            SmartOrder AI
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-foreground/70 transition-all duration-200 hover:text-foreground hover:bg-foreground/5"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.97]"
            >
              Get started{" "}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <main id="main-content">
        <motion.section
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:pb-24 sm:pt-28 lg:pt-36"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm"
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            From paper to approved in under 2 minutes
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Turn paper order sheets
            <br />
            into{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              structured orders
            </span>{" "}
            in seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/55 sm:text-lg"
          >
            SmartOrder AI uses vision AI to scan handwritten order sheets,
            extract every line item, and route approved orders to your
            distributor — automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              to="/signup"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.97] sm:w-auto"
            >
              Start your free account{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-surface/40 px-7 py-3.5 text-base font-semibold text-primary backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:bg-surface/60 active:scale-[0.97] sm:w-auto"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.section>

        {/* ── Features Grid ─────────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-6xl px-4 pb-24"
        >
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary/70">
              Why SmartOrder AI
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to manage orders
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={cardVariant}
                custom={i}
                className="group cursor-pointer rounded-2xl border border-border/60 bg-surface/70 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-surface hover:shadow-xl hover:shadow-primary/[0.04]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-300 group-hover:from-primary/15 group-hover:to-primary/10 group-hover:scale-105">
                  <f.icon
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/55">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── How It Works ──────────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-4xl px-4 pb-24"
        >
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary/70">
              How it works
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              From paper to distributor in four steps
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={stepVariant}
                custom={i}
                className="relative cursor-pointer text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white shadow-lg shadow-primary/20 transition-transform duration-200 hover:scale-105">
                  {s.step}
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/55">
                  {s.desc}
                </p>
                {/* Connector line between steps (hidden on mobile, last item) */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute right-0 top-7 hidden h-px w-full translate-x-[calc(50%+1rem)] bg-gradient-to-r from-border to-border/20 lg:block"
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-3xl px-4 pb-24 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-primary/8 bg-surface/60 px-8 py-14 shadow-xl shadow-primary/[0.03] backdrop-blur-sm sm:px-16 sm:py-16"
          >
            {/* Decorative gradient blobs behind CTA content */}
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/[0.04] blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/[0.05] blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                Ready to stop typing orders by hand?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-foreground/55">
                Join supermarkets using SmartOrder AI to save hours every week
                on order processing.
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-bold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.97]"
              >
                Get started for free{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </motion.section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/40 bg-surface/30 px-4 py-8 text-center text-xs text-foreground/35">
        <p>
          &copy; {new Date().getFullYear()} SmartOrder AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
