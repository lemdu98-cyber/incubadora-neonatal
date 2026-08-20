import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfilesService } from '../profiles/profiles.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.profilesService.findByUserId(user.id);

    return {
      id: user.id,
      ...(user.email ? { email: user.email } : {}),
      profile,
      roles: profile?.roles ?? [],
    };
  }

  @Get('admin-test')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminTest() {
    return { status: 'ok' };
  }
}
