export const ADMISSION_STATUSES=['ACTIVE','DISCHARGED','TRANSFERRED','CANCELLED'] as const;
export type AdmissionStatus=(typeof ADMISSION_STATUSES)[number];
export const ADMISSION_STATUS_LABELS:Record<AdmissionStatus,string>={ACTIVE:'Activo',DISCHARGED:'Finalizado',TRANSFERRED:'Transferido',CANCELLED:'Cancelado'};
export const FINAL_ADMISSION_STATUS_LABELS={DISCHARGED:'Alta',TRANSFERRED:'Transferencia',CANCELLED:'Cancelación'} as const;
