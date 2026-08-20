import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateAdmissionDto } from './dto/create-admission.dto';
import type { DischargeAdmissionDto } from './dto/discharge-admission.dto';
import type { FindAdmissionsQueryDto } from './dto/find-admissions-query.dto';

const includeSummary = {
  patient: {
    select: {
      id: true,
      medicalRecordNumber: true,
      firstName: true,
      lastName: true,
    },
  },
  incubator: {
    select: { id: true, code: true, name: true, location: true, status: true },
  },
} as const;

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAdmissionDto) {
    const admittedAt = new Date(input.admittedAt);
    if (admittedAt.getTime() > Date.now() + 24 * 60 * 60 * 1000)
      throw new BadRequestException('Admission date is too far in the future');
    try {
      return await this.prisma.$transaction(async (tx) => {
        const [patient, incubator, patientActive, incubatorActive] =
          await Promise.all([
            tx.patient.findUnique({
              where: { id: input.patientId },
              select: { id: true },
            }),
            tx.incubator.findUnique({
              where: { id: input.incubatorId },
              select: { id: true, status: true },
            }),
            tx.admission.findFirst({
              where: { patientId: input.patientId, status: 'ACTIVE' },
              select: { id: true },
            }),
            tx.admission.findFirst({
              where: { incubatorId: input.incubatorId, status: 'ACTIVE' },
              select: { id: true },
            }),
          ]);
        if (!patient) throw new NotFoundException('Patient not found');
        if (!incubator) throw new NotFoundException('Incubator not found');
        if (patientActive)
          throw new ConflictException(
            'Patient already has an active admission',
          );
        if (incubatorActive)
          throw new ConflictException('Incubator is occupied');
        if (incubator.status !== 'AVAILABLE')
          throw new ConflictException('Incubator is not available');
        const occupied = await tx.incubator.updateMany({
          where: { id: input.incubatorId, status: 'AVAILABLE' },
          data: { status: 'IN_USE' },
        });
        if (occupied.count !== 1)
          throw new ConflictException('Incubator is not available');
        return tx.admission.create({
          data: {
            patientId: input.patientId,
            incubatorId: input.incubatorId,
            admittedAt,
            notes: input.notes,
            status: 'ACTIVE',
          },
          include: includeSummary,
        });
      });
    } catch (error) {
      this.mapConcurrentConflict(error);
    }
  }

  findAll(query: FindAdmissionsQueryDto = {}) {
    return this.prisma.admission.findMany({
      where: query,
      include: includeSummary,
      orderBy: { admittedAt: 'desc' },
    });
  }
  async findOne(id: string) {
    const value = await this.prisma.admission.findUnique({
      where: { id },
      include: includeSummary,
    });
    if (!value) throw new NotFoundException('Admission not found');
    return value;
  }
  async findForPatient(patientId: string) {
    await this.ensurePatient(patientId);
    return this.prisma.admission.findMany({
      where: { patientId },
      include: includeSummary,
      orderBy: { admittedAt: 'desc' },
    });
  }
  async findForIncubator(incubatorId: string) {
    await this.ensureIncubator(incubatorId);
    return this.prisma.admission.findMany({
      where: { incubatorId },
      include: includeSummary,
      orderBy: { admittedAt: 'desc' },
    });
  }
  activeForPatient(patientId: string) {
    return this.prisma.admission.findFirst({
      where: { patientId, status: 'ACTIVE' },
      include: includeSummary,
    });
  }
  activeForIncubator(incubatorId: string) {
    return this.prisma.admission.findFirst({
      where: { incubatorId, status: 'ACTIVE' },
      include: includeSummary,
    });
  }

  async discharge(id: string, input: DischargeAdmissionDto) {
    const dischargedAt = new Date(input.dischargedAt);
    return this.prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUnique({ where: { id } });
      if (!admission) throw new NotFoundException('Admission not found');
      if (admission.status !== 'ACTIVE')
        throw new ConflictException('Admission is not active');
      if (dischargedAt < admission.admittedAt)
        throw new BadRequestException(
          'Discharge date cannot precede admission date',
        );
      const closed = await tx.admission.updateMany({
        where: { id, status: 'ACTIVE' },
        data: { status: input.status, dischargedAt },
      });
      if (closed.count !== 1)
        throw new ConflictException('Admission is not active');
      const released = await tx.incubator.updateMany({
        where: { id: admission.incubatorId, status: 'IN_USE' },
        data: { status: 'AVAILABLE' },
      });
      if (released.count !== 1)
        throw new ConflictException('Incubator status is inconsistent');
      return tx.admission.findUnique({
        where: { id },
        include: includeSummary,
      });
    });
  }

  private async ensurePatient(id: string) {
    if (
      !(await this.prisma.patient.findUnique({
        where: { id },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Patient not found');
  }
  private async ensureIncubator(id: string) {
    if (
      !(await this.prisma.incubator.findUnique({
        where: { id },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Incubator not found');
  }
  private mapConcurrentConflict(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      ['P2002', 'P2034'].includes(String((error as { code?: unknown }).code))
    )
      throw new ConflictException('Patient or incubator is not available');
    throw error;
  }
}
