import type { ProfileStatus } from '../../generated/prisma/enums';
import type { RoleCode } from '../../auth/decorators/roles.decorator';

export interface UserResponse {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  status: ProfileStatus;
  roles: RoleCode[];
}

export interface CreatedUserResponse extends UserResponse {
  email: string;
  temporaryPassword: string;
}
