import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SensorStatusBadge } from '@/components/sensor-status-badge';
import { ApiError, getSensors, type CurrentUser, type Sensor } from '@/lib/api';
import { requireSensorReader } from '@/lib/auth-context';
import { SENSOR_TYPE_LABELS } from '@/lib/sensor-options';

export const canCreateSensor=(user:Pick<CurrentUser,'roles'>)=>user.roles.some(role=>role==='ADMIN'||role==='TECHNICIAN');
export default async function Page(){const{user,accessToken}=await requireSensorReader();let sensors:Sensor[]|null=null;try{sensors=await getSensors(accessToken)}catch(error){if(error instanceof ApiError&&error.status===401)redirect('/auth/logout?reason=expired')}const create=canCreateSensor(user);return <AppShell user={user} active="sensors"><div className="flex items-end justify-between"><div><h1 className="text-3xl font-bold">Sensores</h1><p className="mt-2 text-slate-600">Inventario técnico de sensores conectados.</p></div>{create&&<Link className="rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white" href="/sensors/new">Nuevo sensor</Link>}</div>{sensors===null?<SensorError/>:sensors.length===0?<SensorEmpty canCreate={create}/>:<SensorList sensors={sensors}/>}</AppShell>}
export function SensorList({sensors}:{sensors:Sensor[]}){return <div className="mt-8 overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left"><thead><tr>{['Código','Tipo','Dispositivo','Incubadora','Estado administrativo','Canal','Acción'].map(value=><th className="p-4" key={value}>{value}</th>)}</tr></thead><tbody>{sensors.map(sensor=><tr className="border-t" key={sensor.id}><td className="p-4 font-mono">{sensor.code}</td><td className="p-4">{SENSOR_TYPE_LABELS[sensor.sensorType]}</td><td className="p-4">{sensor.device.code}</td><td className="p-4">{sensor.device.incubator.code}</td><td className="p-4"><SensorStatusBadge status={sensor.status}/></td><td className="p-4">{sensor.channel??'No registrado'}</td><td className="p-4"><Link className="font-semibold text-cyan-700" href={`/sensors/${sensor.id}`}>Ver detalle</Link></td></tr>)}</tbody></table></div>}
export function SensorEmpty({canCreate}:{canCreate:boolean}){return <section className="mt-8 rounded-xl border border-dashed p-10 text-center"><h2>No hay sensores registrados.</h2>{canCreate&&<Link href="/sensors/new">Registrar primer sensor</Link>}</section>}
export function SensorError(){return <p role="alert">No fue posible cargar los sensores.</p>}
