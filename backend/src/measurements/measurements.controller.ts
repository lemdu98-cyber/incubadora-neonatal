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
import { MeasurementsService } from './measurements.service';

@Controller('measurement-definitions')
@UseGuards(AuthGuard, RolesGuard)
export class MeasurementsController {
  constructor(private readonly measurements: MeasurementsService) {}
  @Get() @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findAll() {
    return this.measurements.findAll();
  }
  @Get(':id') @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN') findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.measurements.findOne(id);
  }
}
