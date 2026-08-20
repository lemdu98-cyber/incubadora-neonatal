import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SensorStatusBadge } from "@/components/sensor-status-badge";
import { ApiError, getSensor, getSensorCapabilities, type MeasurementDefinition, type Sensor } from "@/lib/api";
import { requireSensorReader } from "@/lib/auth-context";
import { SENSOR_TYPE_LABELS } from "@/lib/sensor-options";
import { MEASUREMENT_CATEGORY_LABELS, MEASUREMENT_VALUE_TYPE_LABELS } from "@/lib/measurement-options";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const date = (value: string) =>
  new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { user, accessToken } = await requireSensorReader();
  let sensor: Sensor | null = null;
  let capabilities: MeasurementDefinition[] = [];
  try {
    const [sensorResult, capabilitiesResult] = await Promise.allSettled([getSensor(id, accessToken), getSensorCapabilities(id, accessToken)]);
    if (sensorResult.status === "rejected") throw sensorResult.reason;
    sensor = sensorResult.value;
    if (capabilitiesResult.status === "fulfilled") capabilities = capabilitiesResult.value;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 401)
      redirect("/auth/logout?reason=expired");
  }
  return (
    <AppShell user={user} active="sensors">
      {sensor ? (
        <SensorDetails sensor={sensor} capabilities={capabilities} canManage={user.roles.some(role=>role==='ADMIN'||role==='TECHNICIAN')} />
      ) : (
        <p role="alert">No fue posible cargar el sensor.</p>
      )}
    </AppShell>
  );
}
export function SensorDetails({ sensor, capabilities=[], canManage=false }: { sensor: Sensor; capabilities?:MeasurementDefinition[]; canManage?:boolean }) {
  const calibration = sensor.calibrationMetadata
    ? JSON.stringify(sensor.calibrationMetadata, null, 2)
    : "Sin datos de calibración";
  const values = [
    ["Código", sensor.code],
    ["Tipo", SENSOR_TYPE_LABELS[sensor.sensorType]],
    ["Dispositivo", sensor.device.code],
    [
      "Incubadora",
      `${sensor.device.incubator.code} · ${sensor.device.incubator.name}`,
    ],
    ["Canal", sensor.channel ?? "No registrado"],
    ["Notas", sensor.notes ?? "Sin notas técnicas"],
    ["Metadatos de calibración", calibration],
    ["Fecha de registro", date(sensor.createdAt)],
  ];
  return (
    <>
      <div className="flex gap-4">
        <h1 className="text-3xl font-bold">{sensor.code}</h1>
        <SensorStatusBadge status={sensor.status} />
      </div>
      <dl className="mt-7 grid gap-5 rounded-2xl border bg-white p-6 sm:grid-cols-2">
        {values.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd className="whitespace-pre-wrap font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-8">
        <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Magnitudes / capacidades</h2>{canManage&&<Link className="rounded-xl bg-cyan-700 px-4 py-2 font-semibold text-white" href={`/sensors/${sensor.id}/capabilities`}>Configurar capacidades</Link>}</div>
        {capabilities.length===0?<p className="mt-4 rounded-xl border border-dashed p-6">No hay capacidades configuradas.</p>:<div className="mt-4 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left"><thead><tr>{['Nombre','Código','Unidad','Categoría','Tipo de valor'].map(value=><th className="p-4" key={value}>{value}</th>)}</tr></thead><tbody>{capabilities.map(capability=><tr className="border-t" key={capability.id}><td className="p-4">{capability.name}</td><td className="p-4 font-mono">{capability.code}</td><td className="p-4">{capability.unitSymbol}</td><td className="p-4">{MEASUREMENT_CATEGORY_LABELS[capability.category]}</td><td className="p-4">{MEASUREMENT_VALUE_TYPE_LABELS[capability.valueType]}</td></tr>)}</tbody></table></div>}
      </section>
    </>
  );
}
