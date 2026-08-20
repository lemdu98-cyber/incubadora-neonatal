import { ConflictException, NotFoundException } from '@nestjs/common';
import { GuardiansService } from './guardians.service';

describe('GuardiansService', () => {
  const patientId = '00000000-0000-4000-8000-000000000007';
  const guardianId = '00000000-0000-4000-8000-000000000008';
  const tx = {
    patient: { findUnique: jest.fn() },
    guardian: { findUnique: jest.fn(), create: jest.fn() },
    patientGuardian: { updateMany: jest.fn(), create: jest.fn() },
  };
  const prisma = {
    guardian: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    patient: { findUnique: jest.fn() },
    patientGuardian: { findMany: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const service = new GuardiansService(prisma as never);
  beforeEach(() => {
    jest.clearAllMocks();
    tx.patient.findUnique.mockResolvedValue({ id: patientId });
    tx.guardian.findUnique.mockResolvedValue({ id: guardianId });
    tx.patientGuardian.updateMany.mockResolvedValue({ count: 1 });
    tx.patientGuardian.create.mockResolvedValue({ patientId, guardianId });
  });
  it('replaces primary and links atomically', async () => {
    await service.link(patientId, {
      guardianId,
      relationship: 'MOTHER',
      isPrimaryContact: true,
    });
    expect(tx.patientGuardian.updateMany).toHaveBeenCalledWith({
      where: { patientId, isPrimaryContact: true },
      data: { isPrimaryContact: false },
    });
    expect(tx.patientGuardian.create).toHaveBeenCalled();
  });
  it('rejects an absent patient', async () => {
    tx.patient.findUnique.mockResolvedValue(null);
    await expect(
      service.link(patientId, {
        guardianId,
        relationship: 'MOTHER',
        isPrimaryContact: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('rejects an absent guardian', async () => {
    tx.guardian.findUnique.mockResolvedValue(null);
    await expect(
      service.link(patientId, {
        guardianId,
        relationship: 'MOTHER',
        isPrimaryContact: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
  it('maps duplicate relation to conflict', async () => {
    tx.patientGuardian.create.mockRejectedValue({ code: 'P2002' });
    await expect(
      service.link(patientId, {
        guardianId,
        relationship: 'MOTHER',
        isPrimaryContact: false,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('creates and links a new guardian in one transaction', async () => {
    tx.guardian.create.mockResolvedValue({
      id: guardianId,
      firstName: 'Maria',
      lastName: 'Perez',
    });
    tx.patientGuardian.create.mockResolvedValue({
      relationship: 'MOTHER',
      isPrimaryContact: true,
    });
    const result = await service.createAndLink(patientId, {
      guardian: { firstName: 'Maria', lastName: 'Perez' },
      relationship: 'MOTHER',
      isPrimaryContact: true,
    });
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        id: guardianId,
        relationship: 'MOTHER',
        isPrimaryContact: true,
      }),
    );
  });
  it('lists primary contact first and maps guardian data', async () => {
    prisma.patient.findUnique.mockResolvedValue({ id: patientId });
    prisma.patientGuardian.findMany.mockResolvedValue([
      {
        guardian: { id: guardianId, firstName: 'Maria' },
        relationship: 'MOTHER',
        isPrimaryContact: true,
        createdAt: new Date(),
      },
    ]);
    const result = await service.findForPatient(patientId);
    expect(prisma.patientGuardian.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ isPrimaryContact: 'desc' }, { createdAt: 'asc' }],
      }),
    );
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: guardianId,
        relationship: 'MOTHER',
        isPrimaryContact: true,
      }),
    );
  });
  it('unlinks only the relationship', async () => {
    prisma.patientGuardian.deleteMany.mockResolvedValue({ count: 1 });
    await expect(service.unlink(patientId, guardianId)).resolves.toEqual({
      status: 'ok',
    });
    expect(prisma.guardian.create).not.toHaveBeenCalled();
  });
  it('returns 404 unlinking an absent relation', async () => {
    prisma.patientGuardian.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.unlink(patientId, guardianId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
