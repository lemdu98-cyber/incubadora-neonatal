import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateAndLinkGuardianDto } from './dto/create-and-link-guardian.dto';
import type { CreateGuardianDto } from './dto/create-guardian.dto';
import type { LinkGuardianDto } from './dto/link-guardian.dto';

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}
  create(input: CreateGuardianDto) {
    return this.prisma.guardian.create({ data: input });
  }
  findAll() {
    return this.prisma.guardian.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async findOne(id: string) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
      include: {
        patients: {
          include: { patient: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!guardian) throw new NotFoundException('Guardian not found');
    return guardian;
  }
  async findForPatient(patientId: string) {
    await this.ensurePatient(patientId);
    const links = await this.prisma.patientGuardian.findMany({
      where: { patientId },
      include: { guardian: true },
      orderBy: [{ isPrimaryContact: 'desc' }, { createdAt: 'asc' }],
    });
    return links.map(
      ({ guardian, relationship, isPrimaryContact, createdAt }) => ({
        ...guardian,
        relationship,
        isPrimaryContact,
        linkedAt: createdAt,
      }),
    );
  }
  async link(patientId: string, input: LinkGuardianDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const [patient, guardian] = await Promise.all([
          tx.patient.findUnique({
            where: { id: patientId },
            select: { id: true },
          }),
          tx.guardian.findUnique({
            where: { id: input.guardianId },
            select: { id: true },
          }),
        ]);
        if (!patient) throw new NotFoundException('Patient not found');
        if (!guardian) throw new NotFoundException('Guardian not found');
        if (input.isPrimaryContact)
          await tx.patientGuardian.updateMany({
            where: { patientId, isPrimaryContact: true },
            data: { isPrimaryContact: false },
          });
        return tx.patientGuardian.create({
          data: { patientId, ...input },
          include: { guardian: true },
        });
      });
    } catch (error) {
      this.mapConflict(error);
    }
  }
  async createAndLink(patientId: string, input: CreateAndLinkGuardianDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const patient = await tx.patient.findUnique({
          where: { id: patientId },
          select: { id: true },
        });
        if (!patient) throw new NotFoundException('Patient not found');
        if (input.isPrimaryContact)
          await tx.patientGuardian.updateMany({
            where: { patientId, isPrimaryContact: true },
            data: { isPrimaryContact: false },
          });
        const guardian = await tx.guardian.create({ data: input.guardian });
        const link = await tx.patientGuardian.create({
          data: {
            patientId,
            guardianId: guardian.id,
            relationship: input.relationship,
            isPrimaryContact: input.isPrimaryContact,
          },
        });
        return {
          ...guardian,
          relationship: link.relationship,
          isPrimaryContact: link.isPrimaryContact,
        };
      });
    } catch (error) {
      this.mapConflict(error);
    }
  }
  async unlink(patientId: string, guardianId: string) {
    const result = await this.prisma.patientGuardian.deleteMany({
      where: { patientId, guardianId },
    });
    if (result.count === 0)
      throw new NotFoundException('Patient guardian relationship not found');
    return { status: 'ok' };
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
  private mapConflict(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: unknown }).code === 'P2002'
    )
      throw new ConflictException('Guardian relationship already exists');
    throw error;
  }
}
