import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreatePatientDto) {
    const birthDate = new Date(`${input.birthDate}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (birthDate > today)
      throw new BadRequestException('Birth date cannot be in the future');
    try {
      return await this.prisma.patient.create({
        data: {
          ...input,
          birthDate,
          birthTime: input.birthTime
            ? new Date(`1970-01-01T${input.birthTime}:00.000Z`)
            : null,
          status: 'ACTIVE',
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          'A patient with this medical record number already exists',
        );
      }
      throw error;
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    return (error as { code?: unknown }).code === 'P2002';
  }

  findAll() {
    return this.prisma.patient.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }
}
