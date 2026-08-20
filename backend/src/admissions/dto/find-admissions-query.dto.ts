import { IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  ADMISSION_STATUSES,
  type AdmissionStatusValue,
} from '../interfaces/admission.interface';
export class FindAdmissionsQueryDto {
  @IsOptional() @IsIn(ADMISSION_STATUSES) status?: AdmissionStatusValue;
  @IsOptional() @IsUUID('4') patientId?: string;
  @IsOptional() @IsUUID('4') incubatorId?: string;
}
