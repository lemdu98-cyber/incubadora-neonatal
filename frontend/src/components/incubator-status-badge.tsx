import { INCUBATOR_STATUS_LABELS, type IncubatorStatus } from "@/lib/incubator-options";

const styles: Record<IncubatorStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  IN_USE: "bg-cyan-100 text-cyan-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  OUT_OF_SERVICE: "bg-slate-200 text-slate-700",
};

export function IncubatorStatusBadge({ status }: { status: IncubatorStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>{INCUBATOR_STATUS_LABELS[status]}</span>;
}
