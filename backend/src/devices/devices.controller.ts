import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateDeviceDto } from './dto/create-device.dto';
import { FindDevicesQueryDto } from './dto/find-devices-query.dto';
import { DevicesService } from './devices.service';
@Controller('devices')
@UseGuards(AuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}
  @Post() @Roles('ADMIN', 'TECHNICIAN') create(@Body() input: CreateDeviceDto) {
    return this.devices.create(input);
  }
  @Get() @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findAll(
    @Query() query: FindDevicesQueryDto,
  ) {
    return this.devices.findAll(query);
  }
  @Get(':id') @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.devices.findOne(id);
  }
}
