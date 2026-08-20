import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

type HealthResponse = {
  status: 'ok';
  database: 'connected';
};

@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    try {
      await this.prismaService.checkConnection();

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      throw new HttpException(
        {
          status: 'error',
          database: 'unavailable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
