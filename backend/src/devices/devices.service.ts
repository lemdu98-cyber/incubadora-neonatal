import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateDeviceDto } from './dto/create-device.dto';
import type { FindDevicesQueryDto } from './dto/find-devices-query.dto';
const incubatorSummary = {
  select: { id: true, code: true, name: true, location: true, status: true },
} as const;
@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(input: CreateDeviceDto) {
    if (
      !(await this.prisma.incubator.findUnique({
        where: { id: input.incubatorId },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Incubator not found');
    try {
      return await this.prisma.device.create({
        data: { ...input, status: 'ACTIVE', lastSeenAt: null },
        include: { incubator: incubatorSummary },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as { code?: unknown }).code === 'P2002'
      )
        throw new ConflictException(
          'Código o identificador de hardware ya registrado.',
        );
      throw error;
    }
  }
  findAll(query: FindDevicesQueryDto = {}) {
    return this.prisma.device.findMany({
      where: query,
      include: { incubator: incubatorSummary },
      orderBy: { code: 'asc' },
    });
  }
  async findOne(id: string) {
    const value = await this.prisma.device.findUnique({
      where: { id },
      include: { incubator: incubatorSummary },
    });
    if (!value) throw new NotFoundException('Device not found');
    return value;
  }
  async findForIncubator(incubatorId: string) {
    if (
      !(await this.prisma.incubator.findUnique({
        where: { id: incubatorId },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Incubator not found');
    return this.prisma.device.findMany({
      where: { incubatorId },
      include: { incubator: incubatorSummary },
      orderBy: { code: 'asc' },
    });
  }
}
