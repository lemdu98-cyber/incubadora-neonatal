import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { JwtVerificationService } from '../services/jwt-verification.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtVerificationService: JwtVerificationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer ([^\s]+)$/);

    if (!match) {
      throw new UnauthorizedException('Unauthorized');
    }

    request.user = await this.jwtVerificationService.verify(match[1]);
    return true;
  }
}
