import { ConflictException, NotFoundException } from '@nestjs/common';
import { DevicesService } from './devices.service';
describe('DevicesService', () => {
  const input = {
    hardwareUid: 'A4-C1',
    code: 'ESP32-001',
    deviceType: 'ESP32' as const,
    incubatorId: 'i',
  };
  const prisma = {
    incubator: { findUnique: jest.fn() },
    device: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  };
  const service = new DevicesService(prisma as never);
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.incubator.findUnique.mockResolvedValue({ id: 'i' });
  });
  it('creates ACTIVE with null lastSeenAt', async () => {
    prisma.device.create.mockResolvedValue({ id: 'd' });
    await service.create(input);
    expect(prisma.device.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { ...input, status: 'ACTIVE', lastSeenAt: null },
      }),
    );
  });
  it('rejects absent incubator', async () => {
    prisma.incubator.findUnique.mockResolvedValue(null);
    await expect(service.create(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it.each(['hardwareUid', 'code'])('maps duplicate %s to 409', async () => {
    prisma.device.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('orders filtered list', async () => {
    prisma.device.findMany.mockResolvedValue([]);
    await service.findAll({ deviceType: 'ESP32' });
    expect(prisma.device.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deviceType: 'ESP32' },
        orderBy: { code: 'asc' },
      }),
    );
  });
  it('returns 404 for absent detail', async () => {
    prisma.device.findUnique.mockResolvedValue(null);
    await expect(service.findOne('d')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('lists devices for incubator', async () => {
    prisma.device.findMany.mockResolvedValue([]);
    await service.findForIncubator('i');
    expect(prisma.device.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { incubatorId: 'i' } }),
    );
  });
});
