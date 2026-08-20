import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
export class FindTelemetryQueryDto {
  @IsOptional() @IsUUID('4') sensorId?: string;
  @IsOptional() @IsUUID('4') measurementDefinitionId?: string;
  @IsOptional() @IsUUID('4') deviceId?: string;
  @IsOptional() @IsUUID('4') incubatorId?: string;
  @IsOptional() @IsUUID('4') admissionId?: string;
  @IsOptional() @IsDateString({ strict: true }) from?: string;
  @IsOptional() @IsDateString({ strict: true }) to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) limit = 100;
}
export class FindSensorTelemetryQueryDto {
  @IsOptional() @IsUUID('4') measurementDefinitionId?: string;
  @IsOptional() @IsDateString({ strict: true }) from?: string;
  @IsOptional() @IsDateString({ strict: true }) to?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) limit = 100;
}
