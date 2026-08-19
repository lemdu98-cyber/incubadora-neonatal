export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-2xl rounded-3xl border border-cyan-400/20 bg-slate-900 p-8 shadow-2xl shadow-cyan-950/30 sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Base del proyecto
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Incubadora Neonatal IoT
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
          Frontend preparado con Next.js, TypeScript, App Router y Tailwind CSS.
          Los módulos clínicos y de telemetría se incorporarán de forma incremental.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-300" aria-hidden="true" />
          Base técnica inicializada
        </div>
      </section>
    </main>
  );
}
