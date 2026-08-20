import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { IncubatorDevicesController } from './incubator-devices.controller';
@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [DevicesController, IncubatorDevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
