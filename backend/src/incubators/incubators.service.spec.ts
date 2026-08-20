import { ConflictException, NotFoundException } from '@nestjs/common';
import { IncubatorsService } from './incubators.service';

describe('IncubatorsService', () => {
  const input = { code: 'INC-001', name: 'Incubadora 1', location: 'UCIN' };
  const prisma = {
    incubator: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const service = new IncubatorsService(prisma as never);
  beforeEach(() => jest.clearAllMocks());

  it('creates an AVAILABLE incubator', async () => {
    prisma.incubator.create.mockResolvedValue({
      id: 'id',
      ...input,
      status: 'AVAILABLE',
    });
    await service.create(input);
    expect(prisma.incubator.create).toHaveBeenCalledWith({
      data: { ...input, status: 'AVAILABLE' },
    });
  });
  it.each(['code', 'serialNumber'])('maps duplicate %s to 409', async () => {
    prisma.incubator.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('orders the list by code', async () => {
    prisma.incubator.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(prisma.incubator.findMany).toHaveBeenCalledWith({
      orderBy: { code: 'asc' },
    });
  });
  it('returns 404 for an absent incubator', async () => {
    prisma.incubator.findUnique.mockResolvedValue(null);
    await expect(service.findOne('id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
