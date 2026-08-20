import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { serializeTelemetry } from './telemetry.serializer';
@Injectable()
export class TelemetryIngestionService {
  constructor(private readonly prisma: PrismaService) {}
  async ingest(input: IngestTelemetryDto) {
    if (input.schemaVersion !== 1)
      throw new BadRequestException('Unsupported schema version');
    const measuredAt = new Date(input.measuredAt);
    if (measuredAt.getTime() > Date.now() + 5 * 60 * 1000)
      throw new BadRequestException(
        'Measurement timestamp is too far in the future',
      );
    return this.prisma.$transaction(async (tx) => {
      const device = await tx.device.findUnique({
        where: { hardwareUid: input.deviceHardwareUid.trim().toUpperCase() },
        select: { id: true, status: true, incubatorId: true },
      });
      if (!device) throw new NotFoundException('Device not found');
      if (device.status === 'DISABLED')
        throw new ConflictException('Device is disabled');
      const sensor = await tx.sensor.findUnique({
        where: { code: input.sensorCode.trim().toUpperCase() },
        select: { id: true, deviceId: true, status: true },
      });
      if (!sensor) throw new NotFoundException('Sensor not found');
      if (sensor.deviceId !== device.id)
        throw new BadRequestException('Sensor does not belong to device');
      if (sensor.status === 'DISABLED')
        throw new ConflictException('Sensor is disabled');
      const definition = await tx.measurementDefinition.findUnique({
        where: { code: input.measurementCode.trim().toUpperCase() },
        select: { id: true, valueType: true },
      });
      if (!definition)
        throw new NotFoundException('Measurement definition not found');
      if (
        !(await tx.sensorCapability.findUnique({
          where: {
            sensorId_measurementDefinitionId: {
              sensorId: sensor.id,
              measurementDefinitionId: definition.id,
            },
          },
          select: { sensorId: true },
        }))
      )
        throw new BadRequestException('Sensor capability is not configured');
      this.validateValue(input.value, definition.valueType);
      const admission =
        device.status === 'MAINTENANCE' || sensor.status === 'MAINTENANCE'
          ? null
          : await tx.admission.findFirst({
              where: { incubatorId: device.incubatorId, status: 'ACTIVE' },
              select: { id: true },
            });
      try {
        const row = await tx.telemetry.create({
          data: {
            deviceId: device.id,
            sensorId: sensor.id,
            measurementDefinitionId: definition.id,
            incubatorId: device.incubatorId,
            admissionId: admission?.id ?? null,
            value: input.value,
            measuredAt,
            sequence: BigInt(input.sequence),
            bootId: input.bootId,
            quality: 'GOOD',
          },
          include: { measurementDefinition: true },
        });
        return serializeTelemetry(row);
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          (error as { code?: unknown }).code === 'P2002'
        )
          throw new ConflictException('Telemetry event already ingested');
        throw error;
      }
    });
  }
  private validateValue(value: number, type: 'FLOAT' | 'INTEGER' | 'BOOLEAN') {
    if (!Number.isFinite(value))
      throw new BadRequestException('Value must be finite');
    if (type === 'INTEGER' && !Number.isInteger(value))
      throw new BadRequestException('Value must be an integer');
    if (type === 'BOOLEAN' && value !== 0 && value !== 1)
      throw new BadRequestException('Boolean value must be 0 or 1');
  }
}
