import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';

describe('PatientsService', () => {
  const input = {
    medicalRecordNumber: 'RN-2026-000001',
    firstName: 'Mateo',
    lastName: 'Perez',
    birthDate: '2026-08-20',
    birthTime: '03:15',
    sex: 'MALE' as const,
    birthWeightGrams: 2450,
    gestationalAgeWeeks: 36,
    gestationalAgeDays: 4,
    bloodType: 'O_POSITIVE' as const,
  };
  const prisma = {
    patient: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  };
  const service = new PatientsService(prisma as never);
  beforeEach(() => jest.clearAllMocks());
  it('creates an ACTIVE patient with normalized date/time', async () => {
    prisma.patient.create.mockResolvedValue({
      id: 'id',
      ...input,
      status: 'ACTIVE',
    });
    await service.create(input);
    expect(prisma.patient.create).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: expect.objectContaining({
        status: 'ACTIVE',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        birthDate: expect.any(Date),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        birthTime: expect.any(Date),
      }),
    });
  });
  it('rejects a future birth date', async () => {
    await expect(
      service.create({ ...input, birthDate: '2999-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('maps duplicate medical record to 409', async () => {
    prisma.patient.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('returns 404 for an absent patient', async () => {
    prisma.patient.findUnique.mockResolvedValue(null);
    await expect(service.findOne('id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
