import { ConflictException, NotFoundException } from '@nestjs/common';
import { SensorsService } from './sensors.service';

describe('SensorsService', () => {
  const input = {
    code: 'DHT11-001',
    sensorType: 'DHT11' as const,
    deviceId: 'd',
  };
  const prisma = {
    device: { findUnique: jest.fn() },
    sensor: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  };
  const service = new SensorsService(prisma as never);
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.device.findUnique.mockResolvedValue({ id: 'd' });
  });
  it('creates ACTIVE without client-controlled calibration metadata', async () => {
    prisma.sensor.create.mockResolvedValue({ id: 's' });
    await service.create(input);
    expect(prisma.sensor.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ...input, status: 'ACTIVE' } }),
    );
  });
  it('rejects absent device', async () => {
    prisma.device.findUnique.mockResolvedValue(null);
    await expect(service.create(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('maps duplicate code to 409', async () => {
    prisma.sensor.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('orders a filtered list', async () => {
    prisma.sensor.findMany.mockResolvedValue([]);
    await service.findAll({ sensorType: 'DHT11' });
    expect(prisma.sensor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sensorType: 'DHT11' },
        orderBy: { code: 'asc' },
      }),
    );
  });
  it('returns 404 for absent detail', async () => {
    prisma.sensor.findUnique.mockResolvedValue(null);
    await expect(service.findOne('s')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('lists sensors for device', async () => {
    prisma.sensor.findMany.mockResolvedValue([]);
    await service.findForDevice('d');
    expect(prisma.sensor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deviceId: 'd' },
        orderBy: { code: 'asc' },
      }),
    );
  });
});
