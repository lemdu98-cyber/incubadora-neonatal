import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { GuardiansController } from './guardians.controller';
import { GuardiansService } from './guardians.service';
import { PatientGuardiansController } from './patient-guardians.controller';

@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [GuardiansController, PatientGuardiansController],
  providers: [GuardiansService],
  exports: [GuardiansService],
})
export class GuardiansModule {}
