import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireClinicalRole } from "@/lib/auth-context";
import { PatientForm } from "./patient-form";
export default async function NewPatientPage() { const { user } = await requireClinicalRole(); return <AppShell user={user} active="patients"><p className="text-sm font-medium text-cyan-700"><Link href="/patients">Pacientes</Link> / Nuevo</p><h1 className="mt-5 text-3xl font-bold">Nuevo paciente</h1><PatientForm /></AppShell>; }
