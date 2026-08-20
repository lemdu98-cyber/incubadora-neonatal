/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TelemetryIngestionService } from './telemetry-ingestion.service';
describe('TelemetryIngestionService', () => {
  const tx = {
    device: { findUnique: jest.fn() },
    sensor: { findUnique: jest.fn() },
    measurementDefinition: { findUnique: jest.fn() },
    sensorCapability: { findUnique: jest.fn() },
    admission: { findFirst: jest.fn() },
    telemetry: { create: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const service = new TelemetryIngestionService(prisma as never);
  const input = {
    schemaVersion: 1,
    deviceHardwareUid: 'HW-1',
    sensorCode: 'S-1',
    measurementCode: 'BODY_TEMPERATURE',
    value: 36.7,
    measuredAt: '2026-08-20T20:00:00.000Z',
    sequence: 1,
    bootId: '00000000-0000-4000-8000-000000000020',
  };
  beforeEach(() => {
    jest.clearAllMocks();
    tx.device.findUnique.mockResolvedValue({
      id: 'd',
      status: 'ACTIVE',
      incubatorId: 'i',
    });
    tx.sensor.findUnique.mockResolvedValue({
      id: 's',
      deviceId: 'd',
      status: 'ACTIVE',
    });
    tx.measurementDefinition.findUnique.mockResolvedValue({
      id: 'm',
      valueType: 'FLOAT',
    });
    tx.sensorCapability.findUnique.mockResolvedValue({ sensorId: 's' });
    tx.admission.findFirst.mockResolvedValue({ id: 'a' });
    tx.telemetry.create.mockResolvedValue({
      id: 1n,
      sequence: 1n,
      receivedAt: new Date(),
      measurementDefinition: { unitSymbol: '°C' },
    });
  });
  it('derives context, server fields and serializes BigInt', async () => {
    const result = await service.ingest(input);
    expect(tx.telemetry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deviceId: 'd',
          sensorId: 's',
          incubatorId: 'i',
          admissionId: 'a',
          quality: 'GOOD',
          sequence: 1n,
        }),
      }),
    );
    expect(result).toEqual(expect.objectContaining({ id: '1', sequence: '1' }));
  });
  it('associates no admission when none exists', async () => {
    tx.admission.findFirst.mockResolvedValue(null);
    await service.ingest(input);
    expect(tx.telemetry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ admissionId: null }),
      }),
    );
  });
  it('accepts maintenance technically without clinical admission', async () => {
    tx.device.findUnique.mockResolvedValue({
      id: 'd',
      status: 'MAINTENANCE',
      incubatorId: 'i',
    });
    await service.ingest(input);
    expect(tx.admission.findFirst).not.toHaveBeenCalled();
    expect(tx.telemetry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ admissionId: null }),
      }),
    );
  });
  it('rejects absent or disabled device', async () => {
    tx.device.findUnique.mockResolvedValue(null);
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    tx.device.findUnique.mockResolvedValue({
      id: 'd',
      status: 'DISABLED',
      incubatorId: 'i',
    });
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('rejects absent, foreign or disabled sensor', async () => {
    tx.sensor.findUnique.mockResolvedValue(null);
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    tx.sensor.findUnique.mockResolvedValue({
      id: 's',
      deviceId: 'other',
      status: 'ACTIVE',
    });
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    tx.sensor.findUnique.mockResolvedValue({
      id: 's',
      deviceId: 'd',
      status: 'DISABLED',
    });
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('rejects absent definition and capability', async () => {
    tx.measurementDefinition.findUnique.mockResolvedValue(null);
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    tx.measurementDefinition.findUnique.mockResolvedValue({
      id: 'm',
      valueType: 'FLOAT',
    });
    tx.sensorCapability.findUnique.mockResolvedValue(null);
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
  it('validates INTEGER and BOOLEAN representations', async () => {
    tx.measurementDefinition.findUnique.mockResolvedValue({
      id: 'm',
      valueType: 'INTEGER',
    });
    await expect(
      service.ingest({ ...input, value: 138 }),
    ).resolves.toBeDefined();
    await expect(
      service.ingest({ ...input, value: 138.7 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    tx.measurementDefinition.findUnique.mockResolvedValue({
      id: 'm',
      valueType: 'BOOLEAN',
    });
    await expect(service.ingest({ ...input, value: 1 })).resolves.toBeDefined();
    await expect(service.ingest({ ...input, value: 2 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
  it('rejects unsupported schema and future time', async () => {
    await expect(
      service.ingest({ ...input, schemaVersion: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.ingest({
        ...input,
        measuredAt: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('maps duplicate to conflict', async () => {
    tx.telemetry.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.ingest(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
