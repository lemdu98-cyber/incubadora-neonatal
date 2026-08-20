import type { CurrentUser } from "@/lib/api";
import { LogoutButton } from "./logout-button";

type Props = { user: CurrentUser; backendConnected: boolean; databaseConnected: boolean };

export function DashboardShell({ user, backendConnected, databaseConnected }: Props) {
  const name = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email;
  const admin = user.roles.includes("ADMIN");
  const navigation = ["Dashboard", "Pacientes", "Incubadoras", "Alarmas", ...(admin ? ["Usuarios"] : []), "Reportes"];
  const modules = ["Pacientes", "Incubadoras", "Alarmas", ...(admin ? ["Usuarios"] : []), "Reportes"];

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex border-b border-slate-800 bg-slate-950 p-5 text-white lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex w-full items-center justify-between lg:block">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Sistema</p><p className="mt-1 text-lg font-bold">Incubadora Neonatal</p></div>
          <nav aria-label="Navegación principal" className="hidden lg:mt-10 lg:block"><ul className="space-y-1">{navigation.map((item, index) => <li key={item}><span className={`block rounded-xl px-4 py-3 text-sm ${index === 0 ? "bg-cyan-700 font-semibold text-white" : "text-slate-400"}`}>{item}</span></li>)}</ul></nav>
        </div>
        <div className="hidden lg:mt-auto lg:block"><LogoutButton /></div>
      </aside>
      <main className="min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8"><div><p className="text-sm text-slate-500">Sesión activa</p><p className="font-semibold text-slate-900">{name}</p></div><div className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">{user.roles.join(" · ")}</div></header>
        <div className="p-5 sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Bienvenido, {name}</h1>
          <p className="mt-2 text-slate-600">Panel administrativo y estado general del sistema.</p>
          <section aria-labelledby="system-status" className="mt-8 grid gap-4 sm:grid-cols-2"><h2 id="system-status" className="sr-only">Estado del sistema</h2><StatusCard label="Backend" connected={backendConnected} /><StatusCard label="Base de datos" connected={databaseConnected} /></section>
          <section aria-labelledby="modules" className="mt-10"><h2 id="modules" className="text-lg font-bold text-slate-900">Módulos</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map((module) => <article key={module} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">{module}</h3><p className="mt-2 text-sm text-slate-500">Disponible en una próxima etapa.</p></article>)}</div></section>
          <div className="mt-8 lg:hidden"><LogoutButton /></div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ label, connected }: { label: string; connected: boolean }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><div className={`mt-3 flex items-center gap-2 font-semibold ${connected ? "text-emerald-700" : "text-red-700"}`}><span className={`size-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} aria-hidden="true" />{connected ? "Conectado" : "No disponible"}</div></article>;
}
