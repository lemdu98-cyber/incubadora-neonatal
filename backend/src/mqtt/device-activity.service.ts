import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
@Injectable()
export class DeviceActivityService {
  private readonly lastWrite = new Map<string, number>();
  private readonly throttleMs = 15_000;
  constructor(private readonly prisma: PrismaService) {}
  async touch(hardwareUid: string) {
    const key = hardwareUid.trim().toUpperCase(),
      now = Date.now(),
      last = this.lastWrite.get(key);
    if (last !== undefined && now - last < this.throttleMs) return;
    const result = await this.prisma.device.updateMany({
      where: { hardwareUid: key, status: { not: 'DISABLED' } },
      data: { lastSeenAt: new Date(now) },
    });
    if (result.count !== 1)
      throw new NotFoundException('Active MQTT device not found');
    this.lastWrite.set(key, now);
  }
}
