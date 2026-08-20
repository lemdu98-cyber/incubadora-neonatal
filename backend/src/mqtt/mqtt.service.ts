import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IClientOptions, MqttClient } from 'mqtt';
import { MqttMessageHandlerService } from './mqtt-message-handler.service';
export const MQTT_CONNECT = Symbol('MQTT_CONNECT');
export type MqttConnect = (url: string, options: IClientOptions) => MqttClient;
@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client?: MqttClient;
  private state: 'disabled' | 'connected' | 'disconnected' = 'disabled';
  constructor(
    private readonly config: ConfigService,
    private readonly handler: MqttMessageHandlerService,
    @Inject(MQTT_CONNECT) private readonly connect: MqttConnect,
  ) {}
  onModuleInit() {
    if (!this.config.get<boolean>('MQTT_ENABLED', false)) return;
    this.state = 'disconnected';
    this.client = this.connect(this.config.getOrThrow('MQTT_BROKER_URL'), {
      clientId: this.config.getOrThrow('MQTT_CLIENT_ID'),
      username: this.config.get('MQTT_USERNAME') || undefined,
      password: this.config.get('MQTT_PASSWORD') || undefined,
      reconnectPeriod: 5000,
      clean: true,
    });
    this.client.on('connect', () => {
      this.state = 'connected';
      this.logger.log('MQTT connected');
      this.subscribe();
    });
    this.client.on('reconnect', () => this.logger.log('MQTT reconnecting'));
    this.client.on('offline', () => {
      this.state = 'disconnected';
      this.logger.warn('MQTT offline');
    });
    this.client.on('close', () => {
      this.state = 'disconnected';
      this.logger.warn('MQTT closed');
    });
    this.client.on('error', () => {
      this.state = 'disconnected';
      this.logger.error('MQTT connection error');
    });
    this.client.on(
      'message',
      (topic, payload) => void this.handler.handle(topic, payload),
    );
  }
  onModuleDestroy() {
    this.client?.end(true);
  }
  status() {
    return this.state;
  }
  private subscribe() {
    const telemetry = this.config.getOrThrow<string>('MQTT_TELEMETRY_TOPIC'),
      heartbeat = this.config.getOrThrow<string>('MQTT_HEARTBEAT_TOPIC'),
      qos = this.config.get<number>('MQTT_QOS', 1) as 0 | 1;
    this.client?.subscribe(telemetry, { qos }, (error) => {
      if (error) this.logger.error('MQTT telemetry subscription failed');
    });
    this.client?.subscribe(heartbeat, { qos: 0 }, (error) => {
      if (error) this.logger.error('MQTT heartbeat subscription failed');
    });
  }
}
