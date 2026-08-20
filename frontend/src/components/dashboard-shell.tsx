import Link from "next/link";
import type { CurrentUser } from "@/lib/api";
import { AppShell } from "./app-shell";

type Props = { user: CurrentUser; backendConnected: boolean; databaseConnected: boolean };

export function DashboardShell({ user, backendConnected, databaseConnected }: Props) {
  const name = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email;
  const admin = user.roles.includes("ADMIN");
  const modules = [
    { name: "Pacientes" },
    { name: "Incubadoras", href: "/incubators" },
    { name: "Alarmas" },
    ...(admin ? [{ name: "Usuarios" }] : []),
    { name: "Reportes" },
  ];

  return (
    <AppShell user={user} active="dashboard">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Bienvenido, {name}</h1>
          <p className="mt-2 text-slate-600">Panel administrativo y estado general del sistema.</p>
          <section aria-labelledby="system-status" className="mt-8 grid gap-4 sm:grid-cols-2"><h2 id="system-status" className="sr-only">Estado del sistema</h2><StatusCard label="Backend" connected={backendConnected} /><StatusCard label="Base de datos" connected={databaseConnected} /></section>
          <section aria-labelledby="modules" className="mt-10"><h2 id="modules" className="text-lg font-bold text-slate-900">Módulos</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map((module) => <article key={module.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">{module.href ? <Link className="text-cyan-700 hover:underline" href={module.href}>{module.name}</Link> : module.name}</h3><p className="mt-2 text-sm text-slate-500">{module.href ? "Abrir inventario de equipos." : "Disponible en una próxima etapa."}</p></article>)}</div></section>
    </AppShell>
  );
}

function StatusCard({ label, connected }: { label: string; connected: boolean }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><div className={`mt-3 flex items-center gap-2 font-semibold ${connected ? "text-emerald-700" : "text-red-700"}`}><span className={`size-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} aria-hidden="true" />{connected ? "Conectado" : "No disponible"}</div></article>;
}
