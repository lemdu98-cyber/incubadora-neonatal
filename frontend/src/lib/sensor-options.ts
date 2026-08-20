export const SENSOR_TYPES = ['DHT11', 'DHT22', 'MAX30100', 'MAX30205', 'OTHER'] as const;
export type SensorType = (typeof SENSOR_TYPES)[number];
export const SENSOR_TYPE_LABELS: Record<SensorType,string> = { DHT11:'DHT11', DHT22:'DHT22', MAX30100:'MAX30100 (SpO₂ / FC)', MAX30205:'MAX30205 (Temperatura corporal)', OTHER:'Otro' };
export const SENSOR_STATUSES = ['ACTIVE', 'MAINTENANCE', 'DISABLED'] as const;
export type SensorStatus = (typeof SENSOR_STATUSES)[number];
export const SENSOR_STATUS_LABELS: Record<SensorStatus,string> = { ACTIVE:'Activo', MAINTENANCE:'Mantenimiento', DISABLED:'Deshabilitado' };
