import type { PatientStatus } from "@/lib/patient-options";
export { BLOOD_TYPE_LABELS, SEX_LABELS } from "@/lib/patient-options";
export function PatientStatusBadge({ status }: { status: PatientStatus }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{status === "ACTIVE" ? "Activo" : "Inactivo"}</span>; }
export function formatDate(value: string) { return new Intl.DateTimeFormat("es-BO", { timeZone: "UTC" }).format(new Date(value)); }
export function formatTime(value: string | null) { if (!value) return "No registrada"; return value.includes("T") ? value.slice(11, 16) : value.slice(0, 5); }
