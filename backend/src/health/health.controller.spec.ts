import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { HealthController } from './health.controller';
import { MqttService } from '../mqtt/mqtt.service';

describe('HealthController', () => {
  let controller: HealthController;
  const prismaService = {
    checkConnection: jest.fn<Promise<void>, []>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: prismaService },
        { provide: MqttService, useValue: { status: () => 'disabled' } },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('reports a connected database', async () => {
    prismaService.checkConnection.mockResolvedValue();

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
      mqtt: 'disabled',
    });
  });

  it('hides connection details when the database is unavailable', async () => {
    prismaService.checkConnection.mockRejectedValue(new Error('private error'));

    try {
      await controller.check();
      fail('Expected health check to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect((error as HttpException).getResponse()).toEqual({
        status: 'error',
        database: 'unavailable',
        mqtt: 'disabled',
      });
    }
  });
});
