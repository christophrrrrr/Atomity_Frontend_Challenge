export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-xl">
        <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-emerald-600">
          Atomity
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Cloud Cost Explorer
        </h1>
        <p className="mt-4 text-balance text-base text-neutral-500">
          A scroll-triggered, animated view into Kubernetes spend across
          clusters, namespaces, and pods. Coming together piece by piece.
        </p>
      </div>
    </main>
  );
}
