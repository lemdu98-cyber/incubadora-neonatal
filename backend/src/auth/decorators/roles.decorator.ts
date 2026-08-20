import { SetMetadata } from '@nestjs/common';

export const ROLE_CODES = ['ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN'] as const;

export type RoleCode = (typeof ROLE_CODES)[number];
export const ROLES_KEY = 'required_roles';
export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);
