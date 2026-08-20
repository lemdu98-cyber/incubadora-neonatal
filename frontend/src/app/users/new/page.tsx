import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth-context";
import { NewUserForm } from "./user-form";

export default async function NewUserPage() {
  const { user } = await requireAdmin();
  return <AppShell user={user} active="users"><p className="text-sm font-medium text-cyan-700"><Link href="/dashboard">Dashboard</Link> / <Link href="/users">Usuarios</Link> / Nuevo usuario</p><div className="mt-6 max-w-2xl"><h1 className="text-3xl font-bold text-slate-950">Nuevo usuario</h1><p className="mt-2 text-slate-600">Crea una cuenta autorizada y asigna sus roles iniciales.</p><NewUserForm /></div></AppShell>;
}
