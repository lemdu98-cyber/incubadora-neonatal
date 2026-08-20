import { Injectable } from '@nestjs/common';
import type { RoleCode } from '../auth/decorators/roles.decorator';
import { ROLE_CODES } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../database/prisma.service';
import type { ProfileWithRoles } from './interfaces/profile-with-roles.interface';

@Injectable()
export class ProfilesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByUserId(userId: string): Promise<ProfileWithRoles | null> {
    const profile = await this.prismaService.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        userRoles: {
          select: { role: { select: { code: true } } },
          orderBy: { role: { code: 'asc' } },
        },
      },
    });

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      status: profile.status,
      roles: this.toRoleCodes(profile.userRoles.map(({ role }) => role.code)),
    };
  }

  async findRoleCodes(userId: string): Promise<RoleCode[]> {
    const assignments = await this.prismaService.userRole.findMany({
      where: { profileId: userId },
      select: { role: { select: { code: true } } },
      orderBy: { role: { code: 'asc' } },
    });

    return this.toRoleCodes(assignments.map(({ role }) => role.code));
  }

  private toRoleCodes(codes: string[]): RoleCode[] {
    return codes.filter((code): code is RoleCode =>
      ROLE_CODES.includes(code as RoleCode),
    );
  }
}
