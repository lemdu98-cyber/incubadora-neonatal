import {
  IsDateString,
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class HeartbeatDto {
  @IsInt() @Min(1) schemaVersion!: number;
  @IsString() @MaxLength(100) deviceHardwareUid!: string;
  @IsUUID('4') bootId!: string;
  @IsInt() @Min(0) @Max(Number.MAX_SAFE_INTEGER) sequence!: number;
  @IsDateString({ strict: true }) sentAt!: string;
}
