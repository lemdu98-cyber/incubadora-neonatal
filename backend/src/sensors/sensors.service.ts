import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { CreateSensorDto } from './dto/create-sensor.dto';
import type { FindSensorsQueryDto } from './dto/find-sensors-query.dto';

const deviceSummary = {
  select: {
    id: true,
    code: true,
    deviceType: true,
    status: true,
    incubator: { select: { id: true, code: true, name: true, location: true } },
  },
} as const;

@Injectable()
export class SensorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSensorDto) {
    if (
      !(await this.prisma.device.findUnique({
        where: { id: input.deviceId },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Device not found');
    try {
      return await this.prisma.sensor.create({
        data: { ...input, status: 'ACTIVE' },
        include: { device: deviceSummary },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as { code?: unknown }).code === 'P2002'
      )
        throw new ConflictException('Ya existe un sensor con ese código.');
      throw error;
    }
  }

  findAll(query: FindSensorsQueryDto = {}) {
    return this.prisma.sensor.findMany({
      where: query,
      include: { device: deviceSummary },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const sensor = await this.prisma.sensor.findUnique({
      where: { id },
      include: { device: deviceSummary },
    });
    if (!sensor) throw new NotFoundException('Sensor not found');
    return sensor;
  }

  async findForDevice(deviceId: string) {
    if (
      !(await this.prisma.device.findUnique({
        where: { id: deviceId },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Device not found');
    return this.prisma.sensor.findMany({
      where: { deviceId },
      include: { device: deviceSummary },
      orderBy: { code: 'asc' },
    });
  }
}
