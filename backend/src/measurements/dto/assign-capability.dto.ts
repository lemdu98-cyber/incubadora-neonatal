import { IsUUID } from 'class-validator';
export class AssignCapabilityDto {
  @IsUUID('4') measurementDefinitionId!: string;
}
