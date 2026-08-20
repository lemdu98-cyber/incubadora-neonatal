import { IsBoolean, IsIn, IsUUID } from 'class-validator';

export const GUARDIAN_RELATIONSHIPS = [
  'MOTHER',
  'FATHER',
  'LEGAL_GUARDIAN',
  'GRANDMOTHER',
  'GRANDFATHER',
  'OTHER',
] as const;
export type GuardianRelationshipCode = (typeof GUARDIAN_RELATIONSHIPS)[number];

export class LinkGuardianDto {
  @IsUUID('4') guardianId!: string;
  @IsIn(GUARDIAN_RELATIONSHIPS) relationship!: GuardianRelationshipCode;
  @IsBoolean() isPrimaryContact!: boolean;
}
