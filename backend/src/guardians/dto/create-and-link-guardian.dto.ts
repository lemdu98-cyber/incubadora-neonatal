import { Type } from 'class-transformer';
import { IsBoolean, IsIn, ValidateNested } from 'class-validator';
import { CreateGuardianDto } from './create-guardian.dto';
import {
  GUARDIAN_RELATIONSHIPS,
  type GuardianRelationshipCode,
} from './link-guardian.dto';

export class CreateAndLinkGuardianDto {
  @ValidateNested() @Type(() => CreateGuardianDto) guardian!: CreateGuardianDto;
  @IsIn(GUARDIAN_RELATIONSHIPS) relationship!: GuardianRelationshipCode;
  @IsBoolean() isPrimaryContact!: boolean;
}
