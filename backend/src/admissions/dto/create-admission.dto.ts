import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
export class CreateAdmissionDto {
  @IsUUID('4') patientId!: string;
  @IsUUID('4') incubatorId!: string;
  @IsDateString({ strict: true }) admittedAt!: string;
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  notes?: string;
}
