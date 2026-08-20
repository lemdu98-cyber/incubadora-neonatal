"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, createIncubator, type CreateIncubatorInput } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const fields: Array<{ name: keyof CreateIncubatorInput; label: string; required: boolean; maxLength: number }> = [
  { name: "code", label: "Código", required: true, maxLength: 50 },
  { name: "name", label: "Nombre", required: true, maxLength: 120 },
  { name: "location", label: "Ubicación", required: true, maxLength: 150 },
  { name: "serialNumber", label: "Número de serie (opcional)", required: false, maxLength: 100 },
  { name: "manufacturer", label: "Fabricante (opcional)", required: false, maxLength: 100 },
  { name: "model", label: "Modelo (opcional)", required: false, maxLength: 100 },
];

export function IncubatorForm() {
  const router = useRouter(); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); const form = new FormData(event.currentTarget); const value = (name: string) => String(form.get(name) ?? "").trim();
    const data: CreateIncubatorInput = { code: value("code").toUpperCase(), name: value("name"), location: value("location"), serialNumber: value("serialNumber") || undefined, manufacturer: value("manufacturer") || undefined, model: value("model") || undefined, notes: value("notes") || undefined };
    if (!data.code || !data.name || !data.location) { setError("Revisa los datos de la incubadora."); return; }
    setBusy(true);
    try { const supabase = createClient(); const { data: session } = await supabase.auth.getSession(); const token = session.session?.access_token; if (!token) { router.replace("/login"); return; } const incubator = await createIncubator(data, token); router.push(`/incubators/${incubator.id}`); router.refresh(); }
    catch (caught) { const messages: Record<number,string> = { 400:"Revisa los datos de la incubadora.", 401:"Tu sesión expiró.", 403:"No tienes permisos para realizar esta acción.", 404:"Incubadora no encontrada.", 409:"Ya existe una incubadora con ese código o número de serie.", 500:"No fue posible completar la operación." }; if (caught instanceof ApiError && caught.status === 401) { await createClient().auth.signOut(); router.replace("/login"); return; } setError(caught instanceof ApiError ? messages[caught.status] ?? "No fue posible completar la operación." : "No fue posible completar la operación."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-7 grid max-w-3xl gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">{fields.map((field)=><label className="text-sm font-semibold" key={field.name}>{field.label}<input aria-label={field.label} className="mt-2 w-full rounded-xl border border-slate-300 p-3" maxLength={field.maxLength} name={field.name} required={field.required}/></label>)}<label className="text-sm font-semibold sm:col-span-2">Notas (opcional)<textarea aria-label="Notas (opcional)" className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 p-3" maxLength={2000} name="notes"/></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700 sm:col-span-2">{error}</p>}<button disabled={busy} className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white disabled:opacity-60 sm:col-span-2">{busy ? "Registrando…" : "Registrar incubadora"}</button></form>;
}
