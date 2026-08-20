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
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { DischargeAdmissionDto } from './dto/discharge-admission.dto';
import { FindAdmissionsQueryDto } from './dto/find-admissions-query.dto';
import { AdmissionsService } from './admissions.service';
@Controller('admissions')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'DOCTOR', 'NURSE')
export class AdmissionsController {
  constructor(private readonly admissions: AdmissionsService) {}
  @Post() create(@Body() input: CreateAdmissionDto) {
    return this.admissions.create(input);
  }
  @Get() findAll(@Query() query: FindAdmissionsQueryDto) {
    return this.admissions.findAll(query);
  }
  @Get(':id') findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.admissions.findOne(id);
  }
  @Post(':id/discharge') discharge(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() input: DischargeAdmissionDto,
  ) {
    return this.admissions.discharge(id, input);
  }
}
