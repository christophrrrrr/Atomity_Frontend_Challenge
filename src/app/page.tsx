import { CostExplorerSection } from "@/components/CostExplorer/CostExplorerSection";
import { ThemeToggle } from "@/components/primitives/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-3">
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em] text-brand">
            Atomity
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-5xl px-5 pt-16 text-center sm:pt-24">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Cloud Cost Explorer
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-ink-2">
            Drill into Kubernetes spend across clusters, namespaces, and pods —
            with live data, smart caching, and motion that means something.
          </p>
        </section>

        <CostExplorerSection />
      </main>
    </div>
  );
}
