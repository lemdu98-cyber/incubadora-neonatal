import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdmissionStatusBadge } from "@/components/admission-status-badge";
import { AppShell } from "@/components/app-shell";
import { IncubatorStatusBadge } from "@/components/incubator-status-badge";
import {
  ApiError,
  getIncubator,
  getIncubatorActiveAdmission,
  getIncubatorAdmissions,
  getIncubatorDevices,
  type Admission,
  type Device,
  type Incubator,
} from "@/lib/api";
import { requireIncubatorReader } from "@/lib/auth-context";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const format = (value: string) =>
  new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export async function loadIncubatorDetail(
  id: string,
  accessToken: string,
  includeHistory: boolean,
) {
  // The incubator is the required resource. Admission data is supplementary and
  // must not hide a valid incubator when that module is temporarily unavailable.
  const incubator = await getIncubator(id, accessToken);
  const [activeResult, historyResult, devicesResult] = await Promise.allSettled([
    getIncubatorActiveAdmission(id, accessToken),
    includeHistory
      ? getIncubatorAdmissions(id, accessToken)
      : Promise.resolve([]),
    getIncubatorDevices(id, accessToken),
  ]);

  for (const result of [activeResult, historyResult, devicesResult]) {
    if (
      result.status === "rejected" &&
      result.reason instanceof ApiError &&
      result.reason.status === 401
    ) {
      throw result.reason;
    }
  }

  return {
    incubator,
    activeAdmission:
      activeResult.status === "fulfilled" ? activeResult.value : null,
    admissions:
      historyResult.status === "fulfilled" ? historyResult.value : [],
    admissionsUnavailable:
      activeResult.status === "rejected" || historyResult.status === "rejected",
    devices: devicesResult.status === "fulfilled" ? devicesResult.value : [],
    devicesUnavailable: devicesResult.status === "rejected",
  };
}

export default async function IncubatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 16 dynamic params are asynchronous.
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { user, accessToken } = await requireIncubatorReader();
  let detail: Awaited<ReturnType<typeof loadIncubatorDetail>> | null = null;
  try {
    detail = await loadIncubatorDetail(
      id,
      accessToken,
      user.roles.some((role) => ["ADMIN", "DOCTOR", "NURSE"].includes(role)),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 401)
      redirect("/auth/logout?reason=expired");
  }
  if (!detail) {
    return (
      <AppShell user={user} active="incubators">
        <p role="alert">No fue posible cargar la incubadora.</p>
      </AppShell>
    );
  }
  return (
    <AppShell user={user} active="incubators">
      <IncubatorDetails {...detail} canManageDevices={user.roles.some((role) => ["ADMIN", "TECHNICIAN"].includes(role))} />
    </AppShell>
  );
}

export function IncubatorDetails({
  incubator,
  activeAdmission = null,
  admissions = [],
  admissionsUnavailable = false,
  devices = [],
  devicesUnavailable = false,
  canManageDevices = false,
}: {
  incubator: Incubator;
  activeAdmission?: Admission | null;
  admissions?: Admission[];
  admissionsUnavailable?: boolean;
  devices?: Device[];
  devicesUnavailable?: boolean;
  canManageDevices?: boolean;
}) {
  const values = [
    ["Código", incubator.code],
    ["Nombre", incubator.name],
    ["Ubicación", incubator.location],
    ["Número de serie", incubator.serialNumber],
    ["Fabricante", incubator.manufacturer],
    ["Modelo", incubator.model],
    ["Notas", incubator.notes],
    [
      "Fecha de registro",
      new Intl.DateTimeFormat("es-BO", { dateStyle: "long" }).format(
        new Date(incubator.createdAt),
      ),
    ],
  ];
  return (
    <>
      <p className="text-sm font-medium text-cyan-700">
        <Link href="/incubators">Incubadoras</Link> / Detalle
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold">{incubator.name}</h1>
        <IncubatorStatusBadge status={incubator.status} />
      </div>
      <dl className="mt-7 grid gap-5 rounded-2xl border bg-white p-6 sm:grid-cols-2">
        {values.map(([label, value]) => (
          <div className={label === "Notas" ? "sm:col-span-2" : ""} key={label}>
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="mt-1 font-medium">{value || "No registrado"}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-8">
        <h2 className="text-xl font-bold">Ocupación actual</h2>
        {admissionsUnavailable ? (
          <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
            La información de ocupación no está disponible temporalmente.
          </p>
        ) : activeAdmission ? (
          <article className="mt-4 rounded-xl border bg-white p-5">
            <Link className="font-bold text-cyan-700" href={`/patients/${activeAdmission.patient.id}`}>
              {activeAdmission.patient.medicalRecordNumber} · {activeAdmission.patient.firstName} {activeAdmission.patient.lastName}
            </Link>
            <p>Ingresó {format(activeAdmission.admittedAt)}</p>
          </article>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed p-5">Sin paciente asignado.</p>
        )}
        <h2 className="mt-8 text-xl font-bold">Historial de ingresos</h2>
        {admissions.length === 0 ? (
          <p className="mt-4">Sin ingresos registrados.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {admissions.map((admission) => (
              <article className="flex justify-between rounded-xl border bg-white p-4" key={admission.id}>
                <Link className="font-semibold text-cyan-700" href={`/admissions/${admission.id}`}>
                  {admission.patient.medicalRecordNumber} · {admission.patient.firstName} {admission.patient.lastName}
                </Link>
                <AdmissionStatusBadge status={admission.status} />
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="mt-8">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Dispositivos</h2>{canManageDevices&&<Link className="rounded-xl bg-cyan-700 px-4 py-2 font-semibold text-white" href={`/devices/new?incubatorId=${incubator.id}`}>Registrar dispositivo</Link>}</div>
        {devicesUnavailable?<p role="status" className="mt-4">La información de dispositivos no está disponible temporalmente.</p>:devices.length===0?<p className="mt-4">Sin dispositivos asociados.</p>:<div className="mt-4 space-y-3">{devices.map((device)=><article className="rounded-xl border bg-white p-4" key={device.id}><Link className="font-bold text-cyan-700" href={`/devices/${device.id}`}>{device.code}</Link><p>{device.deviceType} · {device.status} · {device.firmwareVersion??'Firmware no registrado'} · {device.lastSeenAt?format(device.lastSeenAt):'Sin comunicación registrada'}</p></article>)}</div>}
      </section>
    </>
  );
}
