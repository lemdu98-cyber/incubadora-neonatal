import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { JwtVerificationService } from '../services/jwt-verification.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const verify = jest.fn<Promise<AuthenticatedUser>, [string]>();
  const guard = new AuthGuard({
    verify,
  } as unknown as JwtVerificationService);

  beforeEach(() => jest.clearAllMocks());

  function createContext(authorization?: string): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } {
    const request = {
      headers: authorization ? { authorization } : {},
    } as AuthenticatedRequest;

    return {
      request,
      context: {
        switchToHttp: () => ({ getRequest: () => request }),
      } as ExecutionContext,
    };
  }

  it('rejects a request without a token', async () => {
    const { context } = createContext();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a malformed Bearer header', async () => {
    const { context } = createContext('Basic token');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid JWT', async () => {
    verify.mockRejectedValue(new UnauthorizedException());
    const { context } = createContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches only the verified user and allows access', async () => {
    const user = {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'user@example.com',
    };
    verify.mockResolvedValue(user);
    const { context, request } = createContext('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(user);
    expect(request.user).not.toHaveProperty('token');
  });
});
