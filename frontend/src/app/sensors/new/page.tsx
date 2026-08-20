import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { getDevices } from '@/lib/api';
import { requireSensorCreator } from '@/lib/auth-context';
import { SensorForm } from '../sensor-form';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export default async function Page({searchParams}:{searchParams:Promise<{deviceId?:string}>}){const{user,accessToken}=await requireSensorCreator();const devices=await getDevices(accessToken),{deviceId}=await searchParams,initial=deviceId&&UUID.test(deviceId)&&devices.some(device=>device.id===deviceId)?deviceId:undefined;return <AppShell user={user} active="sensors"><p><Link href="/sensors">Sensores</Link> / Nuevo</p><h1 className="mt-5 text-3xl font-bold">Nuevo sensor</h1><SensorForm devices={devices} initialDeviceId={initial}/></AppShell>}
