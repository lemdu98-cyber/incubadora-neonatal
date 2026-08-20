import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RoleBadges, StatusBadge } from "@/components/user-badges";
import { ApiError, getUsers, type AppUser } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-context";

export default async function UsersPage() {
  const { user, accessToken } = await requireAdmin();
  let users: AppUser[] | null = null;
  try {
    users = await getUsers(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth/logout?reason=expired");
    if (error instanceof ApiError && error.status === 403) redirect("/dashboard");
  }
  if (!users) return <AppShell user={user} active="users"><ErrorState /></AppShell>;
  return <AppShell user={user} active="users"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-cyan-700"><Link href="/dashboard">Dashboard</Link> / Usuarios</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Usuarios</h1><p className="mt-2 text-slate-600">Personal autorizado para acceder al sistema.</p></div><Link href="/users/new" className="inline-flex justify-center rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white hover:bg-cyan-800">Nuevo usuario</Link></div>{users.length === 0 ? <EmptyUsers /> : <UsersTable users={users} />}</AppShell>;
}

export function UsersTable({ users }: { users: AppUser[] }) {
  return <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Nombre", "Correo", "Estado", "Roles", "Acciones"].map((title) => <th key={title} className="px-5 py-4 font-semibold">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{users.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold text-slate-900">{item.firstName} {item.lastName}</td><td className="px-5 py-4 text-slate-600">{item.email ?? "No disponible"}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4"><RoleBadges roles={item.roles} /></td><td className="px-5 py-4"><Link className="font-semibold text-cyan-700 hover:text-cyan-900" href={`/users/${item.id}`}>Ver detalle</Link></td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{users.map((item) => <article className="p-5" key={item.id}><h2 className="font-bold text-slate-900">{item.firstName} {item.lastName}</h2><p className="mt-1 break-all text-sm text-slate-600">{item.email ?? "No disponible"}</p><div className="mt-4 flex items-center justify-between gap-3"><StatusBadge status={item.status} /><Link className="font-semibold text-cyan-700" href={`/users/${item.id}`}>Ver detalle</Link></div><div className="mt-3"><RoleBadges roles={item.roles} /></div></article>)}</div></div>;
}

export function EmptyUsers() { return <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-bold text-slate-900">No hay usuarios registrados.</h2><p className="mt-2 text-sm text-slate-600">Crea el primer usuario autorizado desde esta pantalla.</p></section>; }
export function ErrorState() { return <section role="alert" className="rounded-2xl border border-red-200 bg-white p-8"><h1 className="text-2xl font-bold text-slate-950">No fue posible cargar los usuarios.</h1><p className="mt-2 text-slate-600">Comprueba la conexión con el backend e inténtalo nuevamente.</p></section>; }
