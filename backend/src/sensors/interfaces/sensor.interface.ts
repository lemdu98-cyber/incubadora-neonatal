export const SENSOR_TYPES = [
  'DHT11',
  'DHT22',
  'MAX30100',
  'MAX30205',
  'OTHER',
] as const;
export const SENSOR_STATUSES = ['ACTIVE', 'MAINTENANCE', 'DISABLED'] as const;
export type SensorTypeValue = (typeof SENSOR_TYPES)[number];
export type SensorStatusValue = (typeof SENSOR_STATUSES)[number];
