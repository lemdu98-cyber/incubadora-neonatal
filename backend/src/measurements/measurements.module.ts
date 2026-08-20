import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { SensorCapabilitiesController } from './sensor-capabilities.controller';
@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [MeasurementsController, SensorCapabilitiesController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
