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
import { CreateAndLinkGuardianDto } from './dto/create-and-link-guardian.dto';
import { LinkGuardianDto } from './dto/link-guardian.dto';
import { GuardiansService } from './guardians.service';

@Controller('patients/:patientId/guardians')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'DOCTOR', 'NURSE')
export class PatientGuardiansController {
  constructor(private readonly guardians: GuardiansService) {}
  @Get() findAll(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
  ) {
    return this.guardians.findForPatient(patientId);
  }
  @Post() link(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Body() input: LinkGuardianDto,
  ) {
    return this.guardians.link(patientId, input);
  }
  @Post('new') createAndLink(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Body() input: CreateAndLinkGuardianDto,
  ) {
    return this.guardians.createAndLink(patientId, input);
  }
  @Delete(':guardianId') unlink(
    @Param('patientId', new ParseUUIDPipe({ version: '4' })) patientId: string,
    @Param('guardianId', new ParseUUIDPipe({ version: '4' }))
    guardianId: string,
  ) {
    return this.guardians.unlink(patientId, guardianId);
  }
}
