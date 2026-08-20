import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { IncubatorStatusBadge } from "@/components/incubator-status-badge";
import { ApiError, getIncubators, type CurrentUser, type Incubator } from "@/lib/api";
import { requireIncubatorReader } from "@/lib/auth-context";

export default async function IncubatorsPage() {
  const { user, accessToken } = await requireIncubatorReader();
  let incubators: Incubator[] | null = null;
  try { incubators = await getIncubators(accessToken); }
  catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth/logout?reason=expired");
    if (error instanceof ApiError && error.status === 403) redirect("/dashboard");
  }
  const canCreate = canCreateIncubator(user);
  return <AppShell user={user} active="incubators"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-cyan-700"><Link href="/dashboard">Dashboard</Link> / Incubadoras</p><h1 className="mt-2 text-3xl font-bold">Incubadoras</h1><p className="mt-2 text-slate-600">Inventario físico y administrativo de equipos.</p></div>{canCreate && <Link href="/incubators/new" className="rounded-xl bg-cyan-700 px-4 py-3 text-center font-semibold text-white">Nueva incubadora</Link>}</div>{incubators === null ? <IncubatorError /> : incubators.length === 0 ? <IncubatorEmpty canCreate={canCreate} /> : <IncubatorList incubators={incubators} />}</AppShell>;
}

export function canCreateIncubator(user: Pick<CurrentUser, "roles">) { return user.roles.some((role) => role === "ADMIN" || role === "TECHNICIAN"); }
export function IncubatorList({ incubators }: { incubators: Incubator[] }) { return <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Código","Nombre","Ubicación","Estado","Fabricante / modelo","Acción"].map((x)=><th className="px-4 py-4" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{incubators.map((item)=><tr key={item.id}><td className="px-4 py-4 font-mono text-sm">{item.code}</td><td className="px-4 py-4 font-semibold">{item.name}</td><td className="px-4 py-4">{item.location}</td><td className="px-4 py-4"><IncubatorStatusBadge status={item.status}/></td><td className="px-4 py-4">{[item.manufacturer,item.model].filter(Boolean).join(" · ") || "No registrado"}</td><td className="px-4 py-4"><Link href={`/incubators/${item.id}`} className="font-semibold text-cyan-700">Ver detalle</Link></td></tr>)}</tbody></table></div><div className="divide-y md:hidden">{incubators.map((item)=><article className="p-5" key={item.id}><p className="font-mono text-xs text-slate-500">{item.code}</p><h2 className="mt-1 font-bold">{item.name}</h2><p className="mt-2 text-sm text-slate-600">{item.location}</p><div className="mt-4 flex justify-between"><IncubatorStatusBadge status={item.status}/><Link href={`/incubators/${item.id}`} className="font-semibold text-cyan-700">Ver detalle</Link></div></article>)}</div></div>; }
export function IncubatorEmpty({ canCreate }: { canCreate: boolean }) { return <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-bold">No hay incubadoras registradas.</h2>{canCreate && <Link href="/incubators/new" className="mt-5 inline-flex rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white">Registrar primera incubadora</Link>}</section>; }
export function IncubatorError() { return <section role="alert" className="mt-8 rounded-2xl border border-red-200 bg-white p-8"><h2 className="font-bold">No fue posible cargar las incubadoras.</h2></section>; }
