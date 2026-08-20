import { Module } from '@nestjs/common';
import { ProfilesModule } from '../profiles/profiles.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtVerificationService } from './services/jwt-verification.service';

@Module({
  imports: [ProfilesModule],
  controllers: [AuthController],
  providers: [JwtVerificationService, AuthGuard, RolesGuard],
  exports: [JwtVerificationService, AuthGuard, RolesGuard],
})
export class AuthModule {}
