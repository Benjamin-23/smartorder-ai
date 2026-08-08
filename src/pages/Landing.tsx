import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useAuth } from "../lib/auth-context";
import { getHomePathForRole } from "../lib/roles";
import { LoadingScreen } from "../components/LoadingScreen";
import { AnimatedBackground } from "../components/AnimatedBackground";
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
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: "easeOut" as const },
  }),
};

const stepVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
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
  { step: "01", title: "Upload", desc: "Snap a photo or upload a PDF of your order sheet." },
  { step: "02", title: "Review", desc: "AI extracts the line items. Edit or add anything in seconds.", },
  { step: "03", title: "Approve", desc: "A manager reviews and approves — one click.", },
  { step: "04", title: "Deliver", desc: "The distributor is notified instantly via email.", },
];

/* -------------------------------------------------------------------------- */
/*  Landing Page                                                              */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  const { session, profile, loading } = useAuth();

  // Still determining auth state — show a clean spinner
  if (loading) return <LoadingScreen />;

  // Already logged in — redirect to role-specific home
  if (session && profile) {
    return <Navigate to={getHomePathForRole(profile.role)} replace />;
  }
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <AnimatedBackground />

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-md focus:ring-2 focus:ring-primary/20"
      >
        Skip to main content
      </a>

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <span className="font-heading text-lg font-bold text-primary">SmartOrder AI</span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors duration-150 hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <main id="main-content">
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:pt-24 lg:pt-32"
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary"
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            From paper to approved in under 2 minutes
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Turn paper order sheets
            <br />
            into{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              structured orders
            </span>{" "}
            in seconds.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base text-foreground/60 sm:text-lg"
          >
            SmartOrder AI uses vision AI to scan handwritten order sheets, extract every line
            item, and route approved orders to your distributor — automatically.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.97] sm:w-auto"
            >
              Start your free account <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 py-3.5 text-base font-semibold text-primary transition-all duration-200 hover:bg-primary/5 active:scale-[0.97] sm:w-auto"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.section>

        {/* Features grid */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-6xl px-4 pb-24"
        >
          <motion.div variants={fadeUp} className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              Why SmartOrder AI
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to manage orders
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={cardVariant}
                custom={i}
                className="group rounded-2xl border border-border bg-white p-6 transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200 group-hover:bg-primary/15">
                  <f.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-4xl px-4 pb-24"
        >
          <motion.div variants={fadeUp} className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              How it works
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              From paper to distributor in four steps
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={stepVariant}
                custom={i}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-on-primary">
                  {s.step}
                </div>
                <h3 className="font-heading text-base font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">{s.desc}</p>
                {/* Connector line between steps (hidden on mobile, last item) */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-7 hidden h-0.5 w-full translate-x-[calc(50%+1rem)] bg-border lg:block" aria-hidden="true" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="relative z-10 mx-auto max-w-3xl px-4 pb-24 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="rounded-3xl border border-primary/10 bg-white/80 px-8 py-12 shadow-lg backdrop-blur-sm sm:px-16 sm:py-16"
          >
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Ready to stop typing orders by hand?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-foreground/60">
              Join supermarkets using SmartOrder AI to save hours every week on order processing.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-8 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.97]"
            >
              Get started for free <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-white/50 px-4 py-8 text-center text-xs text-foreground/40">
        <p>&copy; {new Date().getFullYear()} SmartOrder AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
