export const GUARDIAN_RELATIONSHIPS = ['MOTHER','FATHER','LEGAL_GUARDIAN','GRANDMOTHER','GRANDFATHER','OTHER'] as const;
export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIPS)[number];
export const GUARDIAN_RELATIONSHIP_LABELS: Record<GuardianRelationship,string> = { MOTHER:'Madre', FATHER:'Padre', LEGAL_GUARDIAN:'Tutor legal', GRANDMOTHER:'Abuela', GRANDFATHER:'Abuelo', OTHER:'Otro' };
