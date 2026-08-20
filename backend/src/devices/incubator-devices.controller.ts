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
import { DevicesService } from './devices.service';
@Controller('incubators/:id/devices')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN')
export class IncubatorDevicesController {
  constructor(private readonly devices: DevicesService) {}
  @Get() findAll(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.devices.findForIncubator(id);
  }
}
