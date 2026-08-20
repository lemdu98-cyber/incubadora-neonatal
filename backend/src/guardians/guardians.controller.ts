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
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { GuardiansService } from './guardians.service';

@Controller('guardians')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'DOCTOR', 'NURSE')
export class GuardiansController {
  constructor(private readonly guardians: GuardiansService) {}
  @Post() create(@Body() input: CreateGuardianDto) {
    return this.guardians.create(input);
  }
  @Get() findAll() {
    return this.guardians.findAll();
  }
  @Get(':id') findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.guardians.findOne(id);
  }
}
