import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FindTelemetryQueryDto } from './dto/find-telemetry-query.dto';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { TelemetryIngestionService } from './telemetry-ingestion.service';
import { TelemetryService } from './telemetry.service';
@Controller('telemetry')
@UseGuards(AuthGuard, RolesGuard)
export class TelemetryController {
  constructor(
    private readonly telemetry: TelemetryService,
    private readonly ingestion: TelemetryIngestionService,
  ) {}
  @Post('ingest') @Roles('ADMIN', 'TECHNICIAN') ingest(
    @Body() input: IngestTelemetryDto,
  ) {
    return this.ingestion.ingest(input);
  }
  @Get() @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findAll(
    @Query() query: FindTelemetryQueryDto,
  ) {
    return this.telemetry.findAll(query);
  }
}
