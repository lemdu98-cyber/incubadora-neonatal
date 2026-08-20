import type { UserRoleCode, UserStatus } from "@/lib/api";

const STATUS_LABELS: Record<UserStatus, string> = { ACTIVE: "Activo", INACTIVE: "Inactivo", SUSPENDED: "Suspendido" };

export function StatusBadge({ status }: { status: UserStatus }) {
  const colors = status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : status === "SUSPENDED" ? "bg-red-50 text-red-700" : "bg-slate-200 text-slate-700";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}>{STATUS_LABELS[status]}</span>;
}

export function RoleBadges({ roles }: { roles: UserRoleCode[] }) {
  return <div className="flex flex-wrap gap-1.5">{roles.map((role) => <span key={role} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{role}</span>)}</div>;
}
