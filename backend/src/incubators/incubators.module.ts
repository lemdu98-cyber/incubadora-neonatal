import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { IncubatorsController } from './incubators.controller';
import { IncubatorsService } from './incubators.service';

@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [IncubatorsController],
  providers: [IncubatorsService],
  exports: [IncubatorsService],
})
export class IncubatorsModule {}
