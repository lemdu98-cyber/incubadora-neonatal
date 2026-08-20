import { Transform } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DEVICE_TYPES } from '../interfaces/device.interface';
const upper = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  trim = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;
export class CreateDeviceDto {
  @Transform(upper)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  hardwareUid!: string;
  @Transform(upper) @IsString() @MinLength(1) @MaxLength(50) code!: string;
  @IsIn(DEVICE_TYPES) deviceType!: (typeof DEVICE_TYPES)[number];
  @IsUUID('4') incubatorId!: string;
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firmwareVersion?: string;
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  notes?: string;
}
