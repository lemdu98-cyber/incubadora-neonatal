import { EventEmitter } from 'events';
import { MqttService } from './mqtt.service';
describe('MqttService', () => {
  function setup(enabled: boolean) {
    const client = Object.assign(new EventEmitter(), {
      subscribe: jest.fn(
        (_topic: unknown, _options: unknown, callback: () => void) =>
          callback(),
      ),
      end: jest.fn(),
    });
    const config = {
      get: (key: string, fallback?: unknown) =>
        key === 'MQTT_ENABLED'
          ? enabled
          : key === 'MQTT_QOS'
            ? 1
            : key === 'MQTT_USERNAME' || key === 'MQTT_PASSWORD'
              ? ''
              : fallback,
      getOrThrow: (key: string) =>
        (
          ({
            MQTT_BROKER_URL: 'mqtt://localhost:1883',
            MQTT_CLIENT_ID: 'backend-test',
            MQTT_TELEMETRY_TOPIC: 'incubadora/devices/+/telemetry',
            MQTT_HEARTBEAT_TOPIC: 'incubadora/devices/+/heartbeat',
          }) as Record<string, string>
        )[key],
    };
    const handler = { handle: jest.fn().mockResolvedValue(undefined) },
      connect = jest.fn().mockReturnValue(client);
    return {
      service: new MqttService(config as never, handler as never, connect),
      client,
      handler,
      connect,
    };
  }
  it('stays disabled without broker connection', () => {
    const { service, connect } = setup(false);
    service.onModuleInit();
    expect(service.status()).toBe('disabled');
    expect(connect).not.toHaveBeenCalled();
  });
  it('connects, subscribes with QoS and forwards messages', async () => {
    const { service, client, handler, connect } = setup(true);
    service.onModuleInit();
    expect(connect).toHaveBeenCalledWith(
      'mqtt://localhost:1883',
      expect.objectContaining({
        clientId: 'backend-test',
        reconnectPeriod: 5000,
      }),
    );
    client.emit('connect');
    expect(service.status()).toBe('connected');
    expect(client.subscribe).toHaveBeenCalledWith(
      'incubadora/devices/+/telemetry',
      { qos: 1 },
      expect.any(Function),
    );
    expect(client.subscribe).toHaveBeenCalledWith(
      'incubadora/devices/+/heartbeat',
      { qos: 0 },
      expect.any(Function),
    );
    client.emit('message', 'topic', Buffer.from('{}'));
    await Promise.resolve();
    expect(handler.handle).toHaveBeenCalled();
    client.emit('offline');
    expect(service.status()).toBe('disconnected');
    service.onModuleDestroy();
    expect(client.end).toHaveBeenCalledWith(true);
  });
});
