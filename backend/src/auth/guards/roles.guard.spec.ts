import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { ProfilesService } from '../../profiles/profiles.service';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const getAllAndOverride = jest.fn().mockReturnValue(['ADMIN']);
  const findRoleCodes = jest.fn();
  const guard = new RolesGuard(
    { getAllAndOverride } as unknown as Reflector,
    { findRoleCodes } as unknown as ProfilesService,
  );

  const request = {
    user: { id: '00000000-0000-4000-8000-000000000001' },
  } as AuthenticatedRequest;
  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  it('rejects an authenticated user without the required role', async () => {
    getAllAndOverride.mockReturnValue(['ADMIN']);
    findRoleCodes.mockResolvedValue(['NURSE']);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows a user whose database roles satisfy the requirement', async () => {
    getAllAndOverride.mockReturnValue(['ADMIN']);
    findRoleCodes.mockResolvedValue(['ADMIN']);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findRoleCodes).toHaveBeenCalledWith(request.user?.id);
  });
});
