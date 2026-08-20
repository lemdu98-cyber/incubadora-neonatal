import { MqttMessageHandlerService } from './mqtt-message-handler.service';
describe('MqttMessageHandlerService', () => {
  const topics = { parse: jest.fn() },
    ingestion = { ingest: jest.fn() },
    activity = { touch: jest.fn() };
  const service = new MqttMessageHandlerService(
    topics as never,
    ingestion as never,
    activity as never,
  );
  const telemetry = {
    schemaVersion: 1,
    deviceHardwareUid: 'ABC123',
    sensorCode: 'S-1',
    measurementCode: 'BODY_TEMPERATURE',
    value: 36.7,
    measuredAt: '2026-08-20T20:15:30.123Z',
    sequence: '1254',
    bootId: '550e8400-e29b-41d4-a716-446655440000',
  };
  beforeEach(() => {
    jest.clearAllMocks();
    topics.parse.mockReturnValue({ hardwareUid: 'ABC123', kind: 'telemetry' });
    ingestion.ingest.mockResolvedValue({});
    activity.touch.mockResolvedValue(undefined);
  });
  it('validates and forwards telemetry once', async () => {
    await service.handle('topic', Buffer.from(JSON.stringify(telemetry)));
    expect(ingestion.ingest).toHaveBeenCalledTimes(1);
    expect(ingestion.ingest).toHaveBeenCalledWith(
      expect.objectContaining({ sequence: 1254 }),
    );
    expect(activity.touch).toHaveBeenCalledWith('ABC123');
  });
  it.each([
    ['invalid topic', null, JSON.stringify(telemetry)],
    ['bad json', { hardwareUid: 'ABC123', kind: 'telemetry' }, '{'],
    [
      'identity mismatch',
      { hardwareUid: 'OTHER', kind: 'telemetry' },
      JSON.stringify(telemetry),
    ],
    [
      'oversized',
      { hardwareUid: 'ABC123', kind: 'telemetry' },
      'x'.repeat(4097),
    ],
  ])('rejects %s without ingestion', async (_name, parsed, payload) => {
    topics.parse.mockReturnValue(parsed);
    await expect(
      service.handle('topic', Buffer.from(payload)),
    ).resolves.toBeUndefined();
    expect(ingestion.ingest).not.toHaveBeenCalled();
  });
  it('handles heartbeat and updates activity', async () => {
    topics.parse.mockReturnValue({ hardwareUid: 'ABC123', kind: 'heartbeat' });
    const heartbeat = {
      schemaVersion: 1,
      deviceHardwareUid: 'ABC123',
      bootId: '550e8400-e29b-41d4-a716-446655440000',
      sequence: 27,
      sentAt: '2026-08-20T20:15:30.123Z',
    };
    await service.handle('topic', Buffer.from(JSON.stringify(heartbeat)));
    expect(ingestion.ingest).not.toHaveBeenCalled();
    expect(activity.touch).toHaveBeenCalledWith('ABC123');
  });
  it('contains ingestion errors and continues', async () => {
    ingestion.ingest.mockRejectedValue(new Error('rejected'));
    await expect(
      service.handle('topic', Buffer.from(JSON.stringify(telemetry))),
    ).resolves.toBeUndefined();
  });
});
