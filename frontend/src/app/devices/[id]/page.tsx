import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import Link from "next/link";
import { ApiError, getDevice, getDeviceSensors, type Device, type Sensor } from "@/lib/api";
import { requireDeviceReader } from "@/lib/auth-context";
import { DEVICE_TYPE_LABELS } from "@/lib/device-options";
import { SENSOR_TYPE_LABELS, SENSOR_STATUS_LABELS } from "@/lib/sensor-options";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const format = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "Sin comunicación registrada";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { user, accessToken } = await requireDeviceReader();
  let device: Device | null = null;
  let sensors: Sensor[] = [];
  try {
    const [deviceResult, sensorsResult] = await Promise.allSettled([getDevice(id, accessToken), getDeviceSensors(id, accessToken)]);
    if (deviceResult.status === "rejected") throw deviceResult.reason;
    device = deviceResult.value;
    if (sensorsResult.status === "fulfilled") sensors = sensorsResult.value;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 401) redirect("/auth/logout?reason=expired");
  }
  const canManageSensors=user.roles.some(role=>role==='ADMIN'||role==='TECHNICIAN');
  return <AppShell user={user} active="devices">{device ? <DeviceDetails device={device} sensors={sensors} canManageSensors={canManageSensors} /> : <p role="alert">No fue posible cargar el dispositivo.</p>}</AppShell>;
}

export function DeviceDetails({ device, sensors=[], canManageSensors=false }: { device: Device; sensors?:Sensor[]; canManageSensors?:boolean }) {
  const values = [
    ["Código", device.code], ["Hardware UID", device.hardwareUid],
    ["Tipo", DEVICE_TYPE_LABELS[device.deviceType]], ["Incubadora", `${device.incubator.code} · ${device.incubator.name}`],
    ["Ubicación", device.incubator.location], ["Firmware", device.firmwareVersion ?? "No registrada"],
    ["Última comunicación", format(device.lastSeenAt)], ["Notas", device.notes ?? "Sin notas técnicas"],
    ["Fecha de registro", format(device.createdAt)],
  ];
  return <><div className="flex gap-4"><h1 className="text-3xl font-bold">{device.code}</h1><DeviceStatusBadge status={device.status} /></div><dl className="mt-7 grid gap-5 rounded-2xl border bg-white p-6 sm:grid-cols-2">{values.map(([key, value]) => <div key={key}><dt>{key}</dt><dd className="font-semibold">{value}</dd></div>)}</dl><section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Sensores</h2>{canManageSensors&&<Link className="rounded-xl bg-cyan-700 px-4 py-2 font-semibold text-white" href={`/sensors/new?deviceId=${device.id}`}>Registrar sensor</Link>}</div>{sensors.length===0?<p className="mt-4 rounded-xl border border-dashed p-6">No hay sensores registrados.</p>:<div className="mt-4 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left"><thead><tr>{['Código','Tipo','Estado','Canal'].map(value=><th className="p-4" key={value}>{value}</th>)}</tr></thead><tbody>{sensors.map(sensor=><tr className="border-t" key={sensor.id}><td className="p-4"><Link className="font-semibold text-cyan-700" href={`/sensors/${sensor.id}`}>{sensor.code}</Link></td><td className="p-4">{SENSOR_TYPE_LABELS[sensor.sensorType]}</td><td className="p-4">{SENSOR_STATUS_LABELS[sensor.status]}</td><td className="p-4">{sensor.channel??'No registrado'}</td></tr>)}</tbody></table></div>}</section></>;
}
