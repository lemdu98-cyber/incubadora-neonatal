export const DEVICE_TYPES = ['ESP32', 'ESP8266', 'OTHER'] as const;
export const DEVICE_STATUSES = ['ACTIVE', 'MAINTENANCE', 'DISABLED'] as const;
export type DeviceTypeValue = (typeof DEVICE_TYPES)[number];
export type DeviceStatusValue = (typeof DEVICE_STATUSES)[number];
