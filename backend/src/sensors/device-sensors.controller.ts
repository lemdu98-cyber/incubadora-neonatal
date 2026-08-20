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
import { SensorsService } from './sensors.service';

@Controller('devices/:deviceId/sensors')
@UseGuards(AuthGuard, RolesGuard)
export class DeviceSensorsController {
  constructor(private readonly sensors: SensorsService) {}
  @Get() @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findAll(
    @Param('deviceId', new ParseUUIDPipe({ version: '4' })) deviceId: string,
  ) {
    return this.sensors.findForDevice(deviceId);
  }
}
