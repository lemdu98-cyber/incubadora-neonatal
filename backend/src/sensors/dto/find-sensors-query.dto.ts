import { IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  SENSOR_STATUSES,
  SENSOR_TYPES,
  type SensorStatusValue,
  type SensorTypeValue,
} from '../interfaces/sensor.interface';

export class FindSensorsQueryDto {
  @IsOptional() @IsUUID('4') deviceId?: string;
  @IsOptional() @IsIn(SENSOR_TYPES) sensorType?: SensorTypeValue;
  @IsOptional() @IsIn(SENSOR_STATUSES) status?: SensorStatusValue;
}
