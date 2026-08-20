import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { IncubatorStatusBadge } from "@/components/incubator-status-badge";
import { ApiError, getIncubator, type Incubator } from "@/lib/api";
import { requireIncubatorReader } from "@/lib/auth-context";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function IncubatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!UUID.test(id)) notFound(); const { user, accessToken } = await requireIncubatorReader(); let incubator: Incubator;
  try { incubator = await getIncubator(id, accessToken); } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); if (error instanceof ApiError && error.status === 401) redirect("/auth/logout?reason=expired"); if (error instanceof ApiError && error.status === 403) redirect("/dashboard"); return <AppShell user={user} active="incubators"><p role="alert">No fue posible cargar la incubadora.</p></AppShell>; }
  return <AppShell user={user} active="incubators"><IncubatorDetails incubator={incubator}/></AppShell>;
}

export function IncubatorDetails({ incubator }: { incubator: Incubator }) { const values = [["Código",incubator.code],["Nombre",incubator.name],["Ubicación",incubator.location],["Número de serie",incubator.serialNumber],["Fabricante",incubator.manufacturer],["Modelo",incubator.model],["Notas",incubator.notes],["Fecha de registro",new Intl.DateTimeFormat("es-BO",{dateStyle:"long"}).format(new Date(incubator.createdAt))]]; return <><p className="text-sm font-medium text-cyan-700"><Link href="/incubators">Incubadoras</Link> / Detalle</p><div className="mt-5 flex flex-wrap items-center gap-4"><h1 className="text-3xl font-bold">{incubator.name}</h1><IncubatorStatusBadge status={incubator.status}/></div><dl className="mt-7 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">{values.map(([label,value])=><div className={label === "Notas" ? "sm:col-span-2" : ""} key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-medium text-slate-900">{value || "No registrado"}</dd></div>)}</dl></>; }
