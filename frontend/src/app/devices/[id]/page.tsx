import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import { ApiError, getDevice, type Device } from "@/lib/api";
import { requireDeviceReader } from "@/lib/auth-context";
import { DEVICE_TYPE_LABELS } from "@/lib/device-options";

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
  try {
    device = await getDevice(id, accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 401) redirect("/auth/logout?reason=expired");
  }
  return <AppShell user={user} active="devices">{device ? <DeviceDetails device={device} /> : <p role="alert">No fue posible cargar el dispositivo.</p>}</AppShell>;
}

export function DeviceDetails({ device }: { device: Device }) {
  const values = [
    ["Código", device.code], ["Hardware UID", device.hardwareUid],
    ["Tipo", DEVICE_TYPE_LABELS[device.deviceType]], ["Incubadora", `${device.incubator.code} · ${device.incubator.name}`],
    ["Ubicación", device.incubator.location], ["Firmware", device.firmwareVersion ?? "No registrada"],
    ["Última comunicación", format(device.lastSeenAt)], ["Notas", device.notes ?? "Sin notas técnicas"],
    ["Fecha de registro", format(device.createdAt)],
  ];
  return <><div className="flex gap-4"><h1 className="text-3xl font-bold">{device.code}</h1><DeviceStatusBadge status={device.status} /></div><dl className="mt-7 grid gap-5 rounded-2xl border bg-white p-6 sm:grid-cols-2">{values.map(([key, value]) => <div key={key}><dt>{key}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></>;
}
