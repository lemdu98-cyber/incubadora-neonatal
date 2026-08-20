import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireIncubatorCreator } from "@/lib/auth-context";
import { IncubatorForm } from "../incubator-form";

export default async function NewIncubatorPage() {
  const { user } = await requireIncubatorCreator();
  return <AppShell user={user} active="incubators"><p className="text-sm font-medium text-cyan-700"><Link href="/incubators">Incubadoras</Link> / Nueva</p><h1 className="mt-5 text-3xl font-bold">Nueva incubadora</h1><p className="mt-2 text-slate-600">Registra el equipo; su estado inicial será Disponible.</p><IncubatorForm /></AppShell>;
}
