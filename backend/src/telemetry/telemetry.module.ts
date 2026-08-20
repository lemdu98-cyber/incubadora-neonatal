import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { TelemetryIngestionService } from './telemetry-ingestion.service';
import { TelemetryRoutesController } from './telemetry-routes.controller';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [TelemetryController, TelemetryRoutesController],
  providers: [TelemetryService, TelemetryIngestionService],
  exports: [TelemetryService, TelemetryIngestionService],
})
export class TelemetryModule {}
