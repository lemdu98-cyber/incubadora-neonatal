import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ROLE_CODES, type RoleCode } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../database/prisma.service';
import {
  SupabaseAdminConflictError,
  SupabaseAdminUnavailableError,
} from '../supabase/errors/supabase-admin.errors';
import { SupabaseAdminService } from '../supabase/supabase-admin.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type {
  CreatedUserResponse,
  UserResponse,
} from './interfaces/user-response.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly supabaseAdminService: SupabaseAdminService,
  ) {}

  async create(input: CreateUserDto): Promise<CreatedUserResponse> {
    const roles = [...new Set(input.roles)];
    const roleRecords = await this.prismaService.role.findMany({
      where: { code: { in: roles } },
      select: { id: true, code: true },
    });

    if (roleRecords.length !== roles.length) {
      throw new BadRequestException('One or more roles are invalid');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    let authUser: { id: string; email: string };

    try {
      authUser = await this.supabaseAdminService.createUser({
        email: input.email,
        password: temporaryPassword,
        firstName: input.firstName,
        lastName: input.lastName,
      });
    } catch (error) {
      if (error instanceof SupabaseAdminConflictError) {
        throw new ConflictException('A user with this email already exists');
      }
      if (error instanceof SupabaseAdminUnavailableError) {
        throw new BadGatewayException('Identity provider unavailable');
      }
      throw error;
    }

    try {
      const profile = await this.prismaService.profile.create({
        data: {
          id: authUser.id,
          firstName: input.firstName,
          lastName: input.lastName,
          status: 'ACTIVE',
          userRoles: {
            create: roleRecords.map(({ id }) => ({
              role: { connect: { id } },
            })),
          },
        },
      });

      // AUDIT: USER_CREATED and ROLE_ASSIGNED will be recorded here later.
      return {
        id: profile.id,
        email: authUser.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        status: profile.status,
        roles: this.toRoleCodes(roleRecords.map(({ code }) => code)),
        temporaryPassword,
      };
    } catch (error) {
      // AUDIT: USER_CREATION_FAILED will be recorded here later.
      await this.compensateAuthUser(authUser.id);
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('A profile for this user already exists');
      }
      throw new InternalServerErrorException('User creation failed');
    }
  }

  async findAll(): Promise<UserResponse[]> {
    const profiles = await this.prismaService.profile.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: {
        userRoles: {
          include: { role: true },
          orderBy: { role: { code: 'asc' } },
        },
      },
    });

    return Promise.all(
      profiles.map(async (profile) => ({
        id: profile.id,
        email: await this.getUserEmail(profile.id),
        firstName: profile.firstName,
        lastName: profile.lastName,
        status: profile.status,
        roles: this.toRoleCodes(profile.userRoles.map(({ role }) => role.code)),
      })),
    );
  }

  async findOne(userId: string): Promise<UserResponse> {
    const profile = await this.prismaService.profile.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
          orderBy: { role: { code: 'asc' } },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return {
      id: profile.id,
      email: await this.getUserEmail(profile.id),
      firstName: profile.firstName,
      lastName: profile.lastName,
      status: profile.status,
      roles: this.toRoleCodes(profile.userRoles.map(({ role }) => role.code)),
    };
  }

  async bootstrapFirstAdmin(
    input: CreateUserDto,
  ): Promise<CreatedUserResponse> {
    const adminAssignments = await this.prismaService.userRole.count({
      where: { role: { code: 'ADMIN' } },
    });
    if (adminAssignments > 0) {
      throw new ConflictException('An ADMIN already exists');
    }

    return this.create({ ...input, roles: ['ADMIN'] });
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      return await this.supabaseAdminService.getUserEmail(userId);
    } catch {
      throw new BadGatewayException('Identity provider unavailable');
    }
  }

  private async compensateAuthUser(userId: string): Promise<void> {
    try {
      await this.supabaseAdminService.deleteUser(userId);
    } catch {
      this.logger.error(
        `Compensation failed for Auth user ${userId}; manual intervention required`,
      );
      throw new InternalServerErrorException(
        'User creation failed and cleanup requires intervention',
      );
    }
  }

  private generateTemporaryPassword(): string {
    return `Aa1!${randomBytes(24).toString('base64url')}`;
  }

  private isUniqueConstraintError(error: unknown): error is { code: 'P2002' } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }

  private toRoleCodes(codes: string[]): RoleCode[] {
    return codes.filter((code): code is RoleCode =>
      ROLE_CODES.includes(code as RoleCode),
    );
  }
}
