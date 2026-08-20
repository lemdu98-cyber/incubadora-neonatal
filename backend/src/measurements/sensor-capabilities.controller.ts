import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AssignCapabilityDto } from './dto/assign-capability.dto';
import { MeasurementsService } from './measurements.service';

@Controller('sensors/:sensorId/capabilities')
@UseGuards(AuthGuard, RolesGuard)
export class SensorCapabilitiesController {
  constructor(private readonly measurements: MeasurementsService) {}
  @Get() @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findAll(
    @Param('sensorId', new ParseUUIDPipe({ version: '4' })) sensorId: string,
  ) {
    return this.measurements.capabilities(sensorId);
  }
  @Post() @Roles('ADMIN', 'TECHNICIAN') assign(
    @Param('sensorId', new ParseUUIDPipe({ version: '4' })) sensorId: string,
    @Body() input: AssignCapabilityDto,
  ) {
    return this.measurements.assign(sensorId, input.measurementDefinitionId);
  }
  @Delete(':measurementDefinitionId') @Roles('ADMIN', 'TECHNICIAN') remove(
    @Param('sensorId', new ParseUUIDPipe({ version: '4' })) sensorId: string,
    @Param('measurementDefinitionId', new ParseUUIDPipe({ version: '4' }))
    definitionId: string,
  ) {
    return this.measurements.remove(sensorId, definitionId);
  }
}
