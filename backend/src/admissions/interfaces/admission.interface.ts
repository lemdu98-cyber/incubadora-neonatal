export const ADMISSION_STATUSES = [
  'ACTIVE',
  'DISCHARGED',
  'TRANSFERRED',
  'CANCELLED',
] as const;
export const FINAL_ADMISSION_STATUSES = [
  'DISCHARGED',
  'TRANSFERRED',
  'CANCELLED',
] as const;
export type AdmissionStatusValue = (typeof ADMISSION_STATUSES)[number];
