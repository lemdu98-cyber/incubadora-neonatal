import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const SEXES = ['MALE', 'FEMALE', 'UNSPECIFIED'] as const;
const BLOOD_TYPES = [
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
  'UNKNOWN',
] as const;

export class CreatePatientDto {
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  medicalRecordNumber!: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @IsDateString({ strict: true }) birthDate!: string;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) birthTime?: string;
  @IsIn(SEXES) sex!: (typeof SEXES)[number];
  @IsInt() @Min(1) @Max(20000) birthWeightGrams!: number;
  @IsInt() @Min(0) @Max(60) gestationalAgeWeeks!: number;
  @IsInt() @Min(0) @Max(6) gestationalAgeDays!: number;
  @IsIn(BLOOD_TYPES) bloodType!: (typeof BLOOD_TYPES)[number];
}
