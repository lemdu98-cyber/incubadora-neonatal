/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TelemetryService } from './telemetry.service';
describe('TelemetryService', () => {
  const prisma = { telemetry: { findMany: jest.fn() } };
  const service = new TelemetryService(prisma as never);
  beforeEach(() =>
    prisma.telemetry.findMany.mockResolvedValue([
      { id: 9n, sequence: 2n, measuredAt: new Date() },
    ]),
  );
  it('uses default limit, descending order and serializes BigInt', async () => {
    await expect(service.findAll()).resolves.toEqual([
      expect.objectContaining({ id: '9', sequence: '2' }),
    ]);
    expect(prisma.telemetry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100, orderBy: { measuredAt: 'desc' } }),
    );
  });
  it('applies filters and dates', async () => {
    await service.findAll({
      sensorId: 's',
      from: '2026-08-01T00:00:00Z',
      to: '2026-08-20T00:00:00Z',
      limit: 10,
    });
    expect(prisma.telemetry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sensorId: 's',
          measuredAt: { gte: expect.any(Date), lte: expect.any(Date) },
        }),
        take: 10,
      }),
    );
  });
  it('scopes sensor and admission routes', async () => {
    await service.findForSensor('s', { limit: 20 });
    expect(prisma.telemetry.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sensorId: 's' }),
      }),
    );
    await service.findForAdmission('a', { limit: 20 });
    expect(prisma.telemetry.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ admissionId: 'a' }),
      }),
    );
  });
});
