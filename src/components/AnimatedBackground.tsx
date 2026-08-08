/**
 * Subtle animated backdrop for auth/marketing screens ONLY.
 * Never use this on data-dense screens (order tables, approval queues, dashboards) —
 * per MASTER.md, those must stay flat and highly readable.
 */
export function AnimatedBackground() {
  return (
    <div
      className="auth-bg pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-[-8rem] h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse" />
      <div className="absolute bottom-[-6rem] right-[-4rem] h-72 w-72 rounded-full bg-secondary/10 blur-3xl motion-safe:animate-pulse [animation-delay:1s]" />
    </div>
  );
}
