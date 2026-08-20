import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdmissionsService } from './admissions.service';
@Controller()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'DOCTOR', 'NURSE')
export class AdmissionHistoryController {
  constructor(private readonly admissions: AdmissionsService) {}
  @Get('patients/:id/admissions') patientHistory(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.admissions.findForPatient(id);
  }
  @Get('patients/:id/active-admission') patientActive(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.admissions.activeForPatient(id);
  }
  @Get('incubators/:id/admissions') incubatorHistory(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.admissions.findForIncubator(id);
  }
  @Get('incubators/:id/active-admission')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN')
  incubatorActive(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.admissions.activeForIncubator(id);
  }
}
