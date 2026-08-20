import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class JwtVerificationService {
  private readonly issuer: string;
  private readonly jwks: Promise<
    ReturnType<(typeof import('jose'))['createRemoteJWKSet']>
  >;

  constructor(configService: ConfigService) {
    const supabaseUrl = configService
      .getOrThrow<string>('SUPABASE_URL')
      .replace(/\/+$/, '');

    this.issuer = `${supabaseUrl}/auth/v1`;
    const jwksUrl = new URL(`${this.issuer}/.well-known/jwks.json`);

    this.jwks = import('jose').then(({ createRemoteJWKSet }) =>
      createRemoteJWKSet(jwksUrl),
    );
  }

  async verify(token: string): Promise<AuthenticatedUser> {
    try {
      const [{ jwtVerify }, jwks] = await Promise.all([
        import('jose'),
        this.jwks,
      ]);
      const { payload } = await jwtVerify(token, jwks, {
        algorithms: ['ES256', 'RS256'],
        issuer: this.issuer,
        audience: 'authenticated',
      });

      if (
        typeof payload.sub !== 'string' ||
        !UUID_PATTERN.test(payload.sub) ||
        payload.role !== 'authenticated' ||
        payload.is_anonymous === true
      ) {
        throw new UnauthorizedException();
      }

      return {
        id: payload.sub,
        ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
      };
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
