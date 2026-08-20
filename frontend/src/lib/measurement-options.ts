import type { SensorType } from './sensor-options';
export const MEASUREMENT_VALUE_TYPES=['FLOAT','INTEGER','BOOLEAN'] as const;export type MeasurementValueType=(typeof MEASUREMENT_VALUE_TYPES)[number];
export const MEASUREMENT_VALUE_TYPE_LABELS:Record<MeasurementValueType,string>={FLOAT:'Decimal',INTEGER:'Entero',BOOLEAN:'Booleano'};
export const MEASUREMENT_CATEGORIES=['ENVIRONMENTAL','PHYSIOLOGICAL','TECHNICAL'] as const;export type MeasurementCategory=(typeof MEASUREMENT_CATEGORIES)[number];
export const MEASUREMENT_CATEGORY_LABELS:Record<MeasurementCategory,string>={ENVIRONMENTAL:'Ambiental',PHYSIOLOGICAL:'Fisiológica',TECHNICAL:'Técnica'};
export const SENSOR_MEASUREMENT_RECOMMENDATIONS:Record<SensorType,readonly string[]>={DHT11:['AIR_TEMPERATURE','RELATIVE_HUMIDITY'],DHT22:['AIR_TEMPERATURE','RELATIVE_HUMIDITY'],MAX30100:['HEART_RATE','SPO2'],MAX30205:['BODY_TEMPERATURE'],OTHER:[]};
