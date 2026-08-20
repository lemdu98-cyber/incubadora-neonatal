import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { AdmissionHistoryController } from './admission-history.controller';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';
@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [AdmissionsController, AdmissionHistoryController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
