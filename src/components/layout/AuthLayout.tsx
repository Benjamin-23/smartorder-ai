import type { ReactNode } from "react";
import { AnimatedBackground } from "../AnimatedBackground";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-heading text-2xl font-bold text-primary">SmartOrder AI</p>
        </div>
        <div className="rounded-2xl border border-border bg-white/90 p-8 shadow-lg backdrop-blur-sm">
          <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-foreground/60">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-foreground/60">{footer}</p>
      </div>
    </div>
  );
}
