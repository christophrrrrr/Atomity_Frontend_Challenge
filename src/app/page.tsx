import { ThemeToggle } from "@/components/primitives/ThemeToggle";

export default function Home() {
  return (
    <main className="relative min-h-dvh">
      <div className="absolute end-5 top-5">
        <ThemeToggle />
      </div>

      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="max-w-xl">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-brand">
            Atomity
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Cloud Cost Explorer
          </h1>
          <p className="mt-4 text-balance text-ink-2">
            A scroll-triggered, animated view into Kubernetes spend across
            clusters, namespaces, and pods. Coming together piece by piece.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-strong">
              Design tokens
            </span>
            <span className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-2 shadow-card">
              Dark mode ready
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
