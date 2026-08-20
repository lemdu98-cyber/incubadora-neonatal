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
import { CreateSensorDto } from './dto/create-sensor.dto';
import { FindSensorsQueryDto } from './dto/find-sensors-query.dto';
import { SensorsService } from './sensors.service';

@Controller('sensors')
@UseGuards(AuthGuard, RolesGuard)
export class SensorsController {
  constructor(private readonly sensors: SensorsService) {}
  @Post() @Roles('ADMIN', 'TECHNICIAN') create(@Body() input: CreateSensorDto) {
    return this.sensors.create(input);
  }
  @Get() @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findAll(
    @Query() query: FindSensorsQueryDto,
  ) {
    return this.sensors.findAll(query);
  }
  @Get(':id') @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.sensors.findOne(id);
  }
}
