import type { ProfileStatus } from '../../generated/prisma/enums';
import type { RoleCode } from '../../auth/decorators/roles.decorator';

export interface ProfileWithRoles {
  id: string;
  firstName: string;
  lastName: string;
  status: ProfileStatus;
  roles: RoleCode[];
}
