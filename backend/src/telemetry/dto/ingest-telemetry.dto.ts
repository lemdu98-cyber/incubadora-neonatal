import {
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class IngestTelemetryDto {
  @IsInt() @Min(1) schemaVersion!: number;
  @IsString() @MaxLength(100) deviceHardwareUid!: string;
  @IsString() @MaxLength(50) sensorCode!: string;
  @IsString() @MaxLength(60) measurementCode!: string;
  @IsNumber({ allowInfinity: false, allowNaN: false }) value!: number;
  @IsDateString({ strict: true }) measuredAt!: string;
  @IsInt() @Min(0) @Max(Number.MAX_SAFE_INTEGER) sequence!: number;
  @IsUUID('4') bootId!: string;
}
