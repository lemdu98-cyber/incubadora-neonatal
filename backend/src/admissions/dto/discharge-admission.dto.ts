import { IsDateString, IsIn } from 'class-validator';
import { FINAL_ADMISSION_STATUSES } from '../interfaces/admission.interface';
export class DischargeAdmissionDto {
  @IsDateString({ strict: true }) dischargedAt!: string;
  @IsIn(FINAL_ADMISSION_STATUSES)
  status!: (typeof FINAL_ADMISSION_STATUSES)[number];
}
