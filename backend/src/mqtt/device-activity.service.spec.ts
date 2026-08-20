/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NotFoundException } from '@nestjs/common';
import { DeviceActivityService } from './device-activity.service';
describe('DeviceActivityService', () => {
  it('updates using server time and throttles per device', async () => {
    const prisma = {
      device: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const service = new DeviceActivityService(prisma as never);
    await service.touch('abc');
    await service.touch('ABC');
    expect(prisma.device.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.device.updateMany).toHaveBeenCalledWith({
      where: { hardwareUid: 'ABC', status: { not: 'DISABLED' } },
      data: { lastSeenAt: expect.any(Date) },
    });
  });
  it('rejects unknown or disabled device', async () => {
    const prisma = {
      device: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    await expect(
      new DeviceActivityService(prisma as never).touch('x'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
