import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SENSOR_TYPES } from '../interfaces/sensor.interface';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateSensorDto {
  @Transform(upper) @IsString() @MinLength(1) @MaxLength(50) code!: string;
  @IsIn(SENSOR_TYPES) sensorType!: (typeof SENSOR_TYPES)[number];
  @IsUUID('4') deviceId!: string;
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  channel?: string;
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  notes?: string;
}
