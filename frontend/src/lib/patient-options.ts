export const PATIENT_SEXES = ["MALE", "FEMALE", "UNSPECIFIED"] as const;
export type PatientSex = (typeof PATIENT_SEXES)[number];
export const SEX_LABELS: Record<PatientSex, string> = { MALE: "Masculino", FEMALE: "Femenino", UNSPECIFIED: "No especificado" };

export const BLOOD_TYPES = ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "UNKNOWN"] as const;
export type BloodType = (typeof BLOOD_TYPES)[number];
export const BLOOD_TYPE_LABELS: Record<BloodType, string> = { A_POSITIVE: "A+", A_NEGATIVE: "A−", B_POSITIVE: "B+", B_NEGATIVE: "B−", AB_POSITIVE: "AB+", AB_NEGATIVE: "AB−", O_POSITIVE: "O+", O_NEGATIVE: "O−", UNKNOWN: "Desconocido" };

export const PATIENT_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type PatientStatus = (typeof PATIENT_STATUSES)[number];
