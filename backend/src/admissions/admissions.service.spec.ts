import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AdmissionsService } from './admissions.service';

describe('AdmissionsService', () => {
  const patientId = '00000000-0000-4000-8000-000000000007',
    incubatorId = '00000000-0000-4000-8000-000000000009',
    id = '00000000-0000-4000-8000-000000000010';
  const input = {
    patientId,
    incubatorId,
    admittedAt: '2026-08-20T14:30:00-04:00',
    notes: 'Ingreso',
  };
  const tx = {
    patient: { findUnique: jest.fn() },
    incubator: { findUnique: jest.fn(), updateMany: jest.fn() },
    admission: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const prisma = {
    ...tx,
    $transaction: jest.fn((callback: (value: typeof tx) => unknown) =>
      callback(tx),
    ),
    admission: { ...tx.admission, findMany: jest.fn() },
  };
  const service = new AdmissionsService(prisma as never);
  beforeEach(() => {
    jest.clearAllMocks();
    tx.patient.findUnique.mockResolvedValue({ id: patientId });
    tx.incubator.findUnique.mockResolvedValue({
      id: incubatorId,
      status: 'AVAILABLE',
    });
    tx.admission.findFirst.mockResolvedValue(null);
    tx.incubator.updateMany.mockResolvedValue({ count: 1 });
    tx.admission.create.mockResolvedValue({ id, status: 'ACTIVE' });
  });
  it('creates ACTIVE and changes incubator to IN_USE transactionally', async () => {
    await service.create(input);
    expect(tx.incubator.updateMany).toHaveBeenCalledWith({
      where: { id: incubatorId, status: 'AVAILABLE' },
      data: { status: 'IN_USE' },
    });
    expect(tx.admission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
  });
  it('rejects absent patient', async () => {
    tx.patient.findUnique.mockResolvedValue(null);
    await expect(service.create(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('rejects absent incubator', async () => {
    tx.incubator.findUnique.mockResolvedValue(null);
    await expect(service.create(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('rejects patient with active admission', async () => {
    tx.admission.findFirst.mockResolvedValueOnce({ id });
    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('rejects occupied incubator', async () => {
    tx.admission.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id });
    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it.each(['MAINTENANCE', 'OUT_OF_SERVICE', 'IN_USE'])(
    'rejects incubator status %s',
    async (status) => {
      tx.incubator.findUnique.mockResolvedValue({ id: incubatorId, status });
      await expect(service.create(input)).rejects.toBeInstanceOf(
        ConflictException,
      );
    },
  );
  it('maps concurrent unique violation to 409', async () => {
    (prisma.$transaction as jest.Mock).mockRejectedValueOnce({ code: 'P2002' });
    await expect(service.create(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('lists admissions ordered by admittedAt', async () => {
    prisma.admission.findMany.mockResolvedValue([]);
    await service.findAll({ status: 'ACTIVE' });
    expect(prisma.admission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'ACTIVE' },
        orderBy: { admittedAt: 'desc' },
      }),
    );
  });
  it('returns active admission or null', async () => {
    tx.admission.findFirst.mockResolvedValue(null);
    await expect(service.activeForPatient(patientId)).resolves.toBeNull();
  });
  it('rejects absent admission on discharge', async () => {
    tx.admission.findUnique.mockResolvedValue(null);
    await expect(
      service.discharge(id, {
        dischargedAt: '2026-08-20T19:00:00-04:00',
        status: 'DISCHARGED',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('rejects discharge of non-active admission', async () => {
    tx.admission.findUnique.mockResolvedValue({ id, status: 'DISCHARGED' });
    await expect(
      service.discharge(id, {
        dischargedAt: '2026-08-20T19:00:00-04:00',
        status: 'DISCHARGED',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('rejects discharge before admission', async () => {
    tx.admission.findUnique.mockResolvedValue({
      id,
      status: 'ACTIVE',
      admittedAt: new Date('2026-08-20T18:30:00Z'),
    });
    await expect(
      service.discharge(id, {
        dischargedAt: '2026-08-20T18:00:00Z',
        status: 'DISCHARGED',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('closes admission and returns incubator to AVAILABLE', async () => {
    tx.admission.findUnique
      .mockResolvedValueOnce({
        id,
        status: 'ACTIVE',
        admittedAt: new Date('2026-08-20T18:30:00Z'),
        incubatorId,
      })
      .mockResolvedValueOnce({ id, status: 'DISCHARGED' });
    tx.admission.updateMany.mockResolvedValue({ count: 1 });
    tx.incubator.updateMany.mockResolvedValue({ count: 1 });
    await service.discharge(id, {
      dischargedAt: '2026-08-20T19:00:00Z',
      status: 'DISCHARGED',
    });
    expect(tx.incubator.updateMany).toHaveBeenCalledWith({
      where: { id: incubatorId, status: 'IN_USE' },
      data: { status: 'AVAILABLE' },
    });
  });
});
