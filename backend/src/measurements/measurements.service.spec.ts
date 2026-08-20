import { ConflictException, NotFoundException } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
describe('MeasurementsService', () => {
  const prisma = {
    measurementDefinition: { findMany: jest.fn(), findUnique: jest.fn() },
    sensor: { findUnique: jest.fn() },
    sensorCapability: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new MeasurementsService(prisma as never);
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.sensor.findUnique.mockResolvedValue({ id: 's' });
    prisma.measurementDefinition.findUnique.mockResolvedValue({ id: 'm' });
  });
  it('orders definitions by category and code', async () => {
    prisma.measurementDefinition.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(prisma.measurementDefinition.findMany).toHaveBeenCalledWith({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });
  });
  it('returns definition 404', async () => {
    prisma.measurementDefinition.findUnique.mockResolvedValue(null);
    await expect(service.findOne('m')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('reads capabilities as definitions', async () => {
    prisma.sensorCapability.findMany.mockResolvedValue([
      { measurementDefinition: { code: 'SPO2' } },
    ]);
    await expect(service.capabilities('s')).resolves.toEqual([
      { code: 'SPO2' },
    ]);
  });
  it('rejects missing sensor and definition', async () => {
    prisma.sensor.findUnique.mockResolvedValue(null);
    await expect(service.assign('s', 'm')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    prisma.sensor.findUnique.mockResolvedValue({ id: 's' });
    prisma.measurementDefinition.findUnique.mockResolvedValue(null);
    await expect(service.assign('s', 'm')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('maps duplicate assignment to 409', async () => {
    prisma.sensorCapability.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.assign('s', 'm')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('removes only capability', async () => {
    prisma.sensorCapability.delete.mockResolvedValue({});
    await expect(service.remove('s', 'm')).resolves.toEqual({
      status: 'removed',
    });
  });
  it('maps absent capability to 404', async () => {
    prisma.sensorCapability.delete.mockRejectedValue({ code: 'P2025' });
    await expect(service.remove('s', 'm')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
