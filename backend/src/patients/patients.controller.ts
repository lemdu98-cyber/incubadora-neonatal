import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'DOCTOR', 'NURSE')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}
  @Post() create(@Body() input: CreatePatientDto) {
    return this.patients.create(input);
  }
  @Get() findAll() {
    return this.patients.findAll();
  }
  @Get(':id') findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.patients.findOne(id);
  }
}
