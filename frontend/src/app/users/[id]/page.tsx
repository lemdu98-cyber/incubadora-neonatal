import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RoleBadges, StatusBadge } from "@/components/user-badges";
import { ApiError, getUser, type AppUser } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-context";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_V4.test(id)) notFound();
  const { user: currentUser, accessToken } = await requireAdmin();
  let user: AppUser | null = null;
  try {
    user = await getUser(id, accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth/logout?reason=expired");
    if (error instanceof ApiError && error.status === 403) redirect("/dashboard");
    if (error instanceof ApiError && error.status === 404) notFound();
  }
  if (!user) return <AppShell user={currentUser} active="users"><section role="alert" className="rounded-2xl border border-red-200 bg-white p-8"><h1 className="text-2xl font-bold">No fue posible cargar el usuario.</h1><p className="mt-2 text-slate-600">Comprueba el backend e inténtalo nuevamente.</p></section></AppShell>;
  return <AppShell user={currentUser} active="users"><UserDetails user={user} /></AppShell>;
}

export function UserDetails({ user }: { user: AppUser }) { return <><p className="text-sm font-medium text-cyan-700"><Link href="/dashboard">Dashboard</Link> / <Link href="/users">Usuarios</Link> / {user.firstName} {user.lastName}</p><div className="mt-6 max-w-3xl"><div className="flex items-center gap-3"><h1 className="text-3xl font-bold text-slate-950">{user.firstName} {user.lastName}</h1><StatusBadge status={user.status} /></div><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Información del usuario</h2><dl className="mt-6 grid gap-6 sm:grid-cols-2"><Detail label="Nombre" value={user.firstName} /><Detail label="Apellido" value={user.lastName} /><Detail label="Correo" value={user.email ?? "No disponible"} /><div><dt className="text-sm font-medium text-slate-500">Roles</dt><dd className="mt-2"><RoleBadges roles={user.roles} /></dd></div><div className="sm:col-span-2"><dt className="text-sm font-medium text-slate-500">ID</dt><dd className="mt-1 break-all font-mono text-sm text-slate-600">{user.id}</dd></div></dl></section><Link href="/users" className="mt-6 inline-flex rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700">Volver a Usuarios</Link></div></>; }

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm font-medium text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>; }
