import { SENSOR_STATUS_LABELS, type SensorStatus } from '@/lib/sensor-options';
const styles:Record<SensorStatus,string>={ACTIVE:'bg-emerald-100 text-emerald-800',MAINTENANCE:'bg-amber-100 text-amber-800',DISABLED:'bg-slate-200 text-slate-700'};
export function SensorStatusBadge({status}:{status:SensorStatus}){return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${styles[status]}`}>{SENSOR_STATUS_LABELS[status]}</span>}
