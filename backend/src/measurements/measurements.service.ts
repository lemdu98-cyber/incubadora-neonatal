import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MeasurementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.measurementDefinition.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: string) {
    const definition = await this.prisma.measurementDefinition.findUnique({
      where: { id },
    });
    if (!definition)
      throw new NotFoundException('Measurement definition not found');
    return definition;
  }

  async capabilities(sensorId: string) {
    await this.requireSensor(sensorId);
    const capabilities = await this.prisma.sensorCapability.findMany({
      where: { sensorId },
      include: { measurementDefinition: true },
      orderBy: { measurementDefinition: { code: 'asc' } },
    });
    return capabilities.map((capability) => capability.measurementDefinition);
  }

  async assign(sensorId: string, measurementDefinitionId: string) {
    await this.requireSensor(sensorId);
    if (
      !(await this.prisma.measurementDefinition.findUnique({
        where: { id: measurementDefinitionId },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Measurement definition not found');
    try {
      return await this.prisma.sensorCapability.create({
        data: { sensorId, measurementDefinitionId },
        include: { measurementDefinition: true },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as { code?: unknown }).code === 'P2002'
      )
        throw new ConflictException('La capacidad ya está asignada.');
      throw error;
    }
  }

  async remove(sensorId: string, measurementDefinitionId: string) {
    await this.requireSensor(sensorId);
    try {
      await this.prisma.sensorCapability.delete({
        where: {
          sensorId_measurementDefinitionId: {
            sensorId,
            measurementDefinitionId,
          },
        },
      });
      return { status: 'removed' };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        (error as { code?: unknown }).code === 'P2025'
      )
        throw new NotFoundException('Sensor capability not found');
      throw error;
    }
  }

  private async requireSensor(id: string) {
    if (
      !(await this.prisma.sensor.findUnique({
        where: { id },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Sensor not found');
  }
}
