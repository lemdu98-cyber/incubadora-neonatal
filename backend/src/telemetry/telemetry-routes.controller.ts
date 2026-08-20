import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FindSensorTelemetryQueryDto } from './dto/find-telemetry-query.dto';
import { TelemetryService } from './telemetry.service';
@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class TelemetryRoutesController {
  constructor(private readonly telemetry: TelemetryService) {}
  @Get('sensors/:id/telemetry')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN')
  sensor(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: FindSensorTelemetryQueryDto,
  ) {
    return this.telemetry.findForSensor(id, query);
  }
  @Get('admissions/:id/telemetry') @Roles('ADMIN', 'DOCTOR', 'NURSE') admission(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() query: FindSensorTelemetryQueryDto,
  ) {
    return this.telemetry.findForAdmission(id, query);
  }
}
