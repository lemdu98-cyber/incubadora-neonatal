import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseAdminConflictError } from '../supabase/errors/supabase-admin.errors';
import type { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const authUser = {
    id: '00000000-0000-4000-8000-000000000003',
    email: 'doctor@example.com',
  };
  const role = { id: 'role-doctor', code: 'DOCTOR' };
  const input: CreateUserDto = {
    email: authUser.email,
    firstName: 'Ana',
    lastName: 'Pérez',
    roles: ['DOCTOR'],
  };
  let prisma: {
    role: { findMany: jest.Mock };
    profile: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
    userRole: { count: jest.Mock };
  };
  let supabase: {
    createUser: jest.Mock;
    deleteUser: jest.Mock;
    getUserEmail: jest.Mock;
  };
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      role: { findMany: jest.fn().mockResolvedValue([role]) },
      profile: {
        create: jest.fn().mockResolvedValue({
          id: authUser.id,
          firstName: input.firstName,
          lastName: input.lastName,
          status: 'ACTIVE',
        }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
      },
      userRole: { count: jest.fn().mockResolvedValue(0) },
    };
    supabase = {
      createUser: jest.fn().mockResolvedValue(authUser),
      deleteUser: jest.fn().mockResolvedValue(undefined),
      getUserEmail: jest.fn().mockResolvedValue(authUser.email),
    };
    service = new UsersService(prisma as never, supabase as never);
  });

  it('rejects a role that does not exist before creating the Auth user', async () => {
    prisma.role.findMany.mockResolvedValue([]);

    await expect(service.create(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(supabase.createUser).not.toHaveBeenCalled();
  });

  it('maps an existing Auth email to HTTP 409', async () => {
    supabase.createUser.mockRejectedValue(new SupabaseAdminConflictError());

    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.profile.create).not.toHaveBeenCalled();
  });

  it('creates Auth, profile and roles and returns the password once', async () => {
    const result = await service.create(input);

    expect(supabase.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: expect.stringMatching(/^Aa1![-_A-Za-z0-9]{32}$/),
      }),
    );
    expect(prisma.profile.create).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        id: authUser.id,
        userRoles: { create: [{ role: { connect: { id: role.id } } }] },
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: authUser.id,
        email: authUser.email,
        roles: ['DOCTOR'],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        temporaryPassword: expect.any(String),
      }),
    );
  });

  it('deletes the Auth user when profile creation fails', async () => {
    prisma.profile.create.mockRejectedValue(new Error('profile failure'));

    await expect(service.create(input)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(supabase.deleteUser).toHaveBeenCalledWith(authUser.id);
  });

  it('deletes the Auth user when the nested role assignment fails', async () => {
    prisma.profile.create.mockRejectedValue(new Error('role failure'));

    await expect(service.create(input)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(supabase.deleteUser).toHaveBeenCalledWith(authUser.id);
  });

  it('compensates and returns 409 when the profile already exists', async () => {
    prisma.profile.create.mockRejectedValue({ code: 'P2002' });

    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(supabase.deleteUser).toHaveBeenCalledWith(authUser.id);
  });

  it('returns 404 when a profile is absent', async () => {
    prisma.profile.findUnique.mockResolvedValue(null);

    await expect(service.findOne(authUser.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
