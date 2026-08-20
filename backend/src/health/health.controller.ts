import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MqttService } from '../mqtt/mqtt.service';

type HealthResponse = {
  status: 'ok';
  database: 'connected';
  mqtt: 'disabled' | 'connected' | 'disconnected';
};

@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mqttService: MqttService,
  ) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.prismaService.checkConnection();

      return {
        status: 'ok',
        database: 'connected',
        mqtt: this.mqttService.status(),
      };
    } catch {
      throw new HttpException(
        {
          status: 'error',
          database: 'unavailable',
          mqtt: this.mqttService.status(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
