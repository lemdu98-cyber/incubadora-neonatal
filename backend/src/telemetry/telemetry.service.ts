import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  FindSensorTelemetryQueryDto,
  FindTelemetryQueryDto,
} from './dto/find-telemetry-query.dto';
import { serializeTelemetry } from './telemetry.serializer';
const include = {
  measurementDefinition: {
    select: {
      id: true,
      code: true,
      name: true,
      unitSymbol: true,
      valueType: true,
      category: true,
      decimalPlaces: true,
    },
  },
  sensor: { select: { id: true, code: true } },
  device: { select: { id: true, code: true, hardwareUid: true } },
} as const;
@Injectable()
export class TelemetryService {
  constructor(private readonly prisma: PrismaService) {}
  findAll(query: FindTelemetryQueryDto = { limit: 100 }) {
    return this.query(query);
  }
  findForSensor(sensorId: string, query: FindSensorTelemetryQueryDto) {
    return this.query({ ...query, sensorId });
  }
  findForAdmission(admissionId: string, query: FindSensorTelemetryQueryDto) {
    return this.query({ ...query, admissionId });
  }
  private async query(query: FindTelemetryQueryDto) {
    const { from, to, limit = 100, ...ids } = query;
    const rows = await this.prisma.telemetry.findMany({
      where: {
        ...ids,
        measuredAt:
          from || to
            ? {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              }
            : undefined,
      },
      include,
      orderBy: { measuredAt: 'desc' },
      take: limit,
    });
    return rows.map(serializeTelemetry);
  }
}
