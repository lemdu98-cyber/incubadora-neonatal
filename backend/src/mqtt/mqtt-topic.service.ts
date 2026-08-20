import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ParsedMqttTopic } from './interfaces/mqtt-message.interface';
@Injectable()
export class MqttTopicService {
  private readonly patterns: Array<{
    kind: ParsedMqttTopic['kind'];
    regex: RegExp;
  }>;
  constructor(config: ConfigService) {
    this.patterns = [
      {
        kind: 'telemetry',
        regex: this.pattern(config.getOrThrow('MQTT_TELEMETRY_TOPIC')),
      },
      {
        kind: 'heartbeat',
        regex: this.pattern(config.getOrThrow('MQTT_HEARTBEAT_TOPIC')),
      },
    ];
  }
  parse(topic: string): ParsedMqttTopic | null {
    for (const item of this.patterns) {
      const match = item.regex.exec(topic);
      if (match?.[1])
        return { hardwareUid: decodeURIComponent(match[1]), kind: item.kind };
    }
    return null;
  }
  private pattern(value: string) {
    const escaped = value
      .split('+')
      .map((part) => part.replace(/[.*?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`^${escaped[0]}([^/]+)${escaped[1]}$`);
  }
}
