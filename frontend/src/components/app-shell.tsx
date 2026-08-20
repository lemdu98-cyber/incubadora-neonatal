import Link from "next/link";
import type { ReactNode } from "react";
import type { CurrentUser } from "@/lib/api";
import { LogoutButton } from "./logout-button";

type Props = { user: CurrentUser; children: ReactNode; active?: "dashboard" | "users" };

export function AppShell({ user, children, active }: Props) {
  const name = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email;
  const admin = user.roles.includes("ADMIN");
  const nav = [
    { label: "Dashboard", href: "/dashboard", enabled: true, key: "dashboard" },
    { label: "Pacientes", enabled: false },
    { label: "Incubadoras", enabled: false },
    { label: "Alarmas", enabled: false },
    ...(admin ? [{ label: "Usuarios", href: "/users", enabled: true, key: "users" }] : []),
    { label: "Reportes", enabled: false },
  ];

  return <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
    <aside className="flex border-b border-slate-800 bg-slate-950 p-5 text-white lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex w-full items-center justify-between lg:block"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Sistema</p><p className="mt-1 text-lg font-bold">Incubadora Neonatal</p></div><nav aria-label="Navegación principal" className="hidden lg:mt-10 lg:block"><ul className="space-y-1">{nav.map((item) => <li key={item.label}>{item.enabled && item.href ? <Link className={`block rounded-xl px-4 py-3 text-sm ${active === item.key ? "bg-cyan-700 font-semibold text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`} href={item.href}>{item.label}</Link> : <span className="block rounded-xl px-4 py-3 text-sm text-slate-600">{item.label}</span>}</li>)}</ul></nav></div>
      <div className="hidden lg:mt-auto lg:block"><LogoutButton /></div>
    </aside>
    <main className="min-w-0"><header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8"><div><p className="text-sm text-slate-500">Sesión activa</p><p className="font-semibold text-slate-900">{name}</p></div><div className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">{user.roles.join(" · ")}</div></header><div className="p-5 sm:p-8">{children}<div className="mt-8 lg:hidden"><LogoutButton /></div></div></main>
  </div>;
}
