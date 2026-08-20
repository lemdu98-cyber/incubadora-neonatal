import { ConfigService } from '@nestjs/config';
import { MqttTopicService } from './mqtt-topic.service';
describe('MqttTopicService', () => {
  const config = {
    getOrThrow: (key: string) =>
      key.includes('TELEMETRY')
        ? 'incubadora/devices/+/telemetry'
        : 'incubadora/devices/+/heartbeat',
  };
  const service = new MqttTopicService(config as ConfigService);
  it('parses telemetry and heartbeat identities', () => {
    expect(service.parse('incubadora/devices/ABC123/telemetry')).toEqual({
      hardwareUid: 'ABC123',
      kind: 'telemetry',
    });
    expect(service.parse('incubadora/devices/ABC123/heartbeat')).toEqual({
      hardwareUid: 'ABC123',
      kind: 'heartbeat',
    });
  });
  it('rejects unrelated topics', () =>
    expect(service.parse('other/ABC123/telemetry')).toBeNull());
});
