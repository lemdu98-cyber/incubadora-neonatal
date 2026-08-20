import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { DeviceSensorsController } from './device-sensors.controller';
import { SensorsController } from './sensors.controller';
import { SensorsService } from './sensors.service';

@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [SensorsController, DeviceSensorsController],
  providers: [SensorsService],
  exports: [SensorsService],
})
export class SensorsModule {}
