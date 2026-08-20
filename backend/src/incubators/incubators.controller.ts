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
import { CreateIncubatorDto } from './dto/create-incubator.dto';
import { IncubatorsService } from './incubators.service';

@Controller('incubators')
@UseGuards(AuthGuard, RolesGuard)
export class IncubatorsController {
  constructor(private readonly incubators: IncubatorsService) {}

  @Post()
  @Roles('ADMIN', 'TECHNICIAN')
  create(@Body() input: CreateIncubatorDto) {
    return this.incubators.create(input);
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN')
  findAll() {
    return this.incubators.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.incubators.findOne(id);
  }
}
