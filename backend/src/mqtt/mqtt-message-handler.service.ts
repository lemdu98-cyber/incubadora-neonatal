import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TelemetryIngestionService } from '../telemetry/telemetry-ingestion.service';
import { IngestTelemetryDto } from '../telemetry/dto/ingest-telemetry.dto';
import { DeviceActivityService } from './device-activity.service';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { MqttTopicService } from './mqtt-topic.service';
@Injectable()
export class MqttMessageHandlerService {
  private readonly logger = new Logger(MqttMessageHandlerService.name);
  private readonly maxPayloadBytes = 4096;
  constructor(
    private readonly topics: MqttTopicService,
    private readonly ingestion: TelemetryIngestionService,
    private readonly activity: DeviceActivityService,
  ) {}
  async handle(topic: string, payload: Buffer) {
    try {
      if (payload.byteLength > this.maxPayloadBytes)
        throw new BadRequestException('MQTT payload too large');
      const parsedTopic = this.topics.parse(topic);
      if (!parsedTopic) throw new BadRequestException('Invalid MQTT topic');
      let raw: unknown;
      try {
        raw = JSON.parse(payload.toString('utf8'));
      } catch {
        throw new BadRequestException('Invalid MQTT JSON');
      }
      if (typeof raw !== 'object' || raw === null)
        throw new BadRequestException('Invalid MQTT payload');
      const candidate = raw as Record<string, unknown>;
      if (
        typeof candidate.sequence === 'string' &&
        /^\d+$/.test(candidate.sequence)
      )
        candidate.sequence = Number(candidate.sequence);
      if (candidate.deviceHardwareUid !== parsedTopic.hardwareUid)
        throw new BadRequestException('MQTT topic identity mismatch');
      if (parsedTopic.kind === 'telemetry') {
        const input = plainToInstance(IngestTelemetryDto, candidate);
        await this.validate(input);
        await this.ingestion.ingest(input);
        await this.activity.touch(parsedTopic.hardwareUid);
      } else {
        const heartbeat = plainToInstance(HeartbeatDto, candidate);
        await this.validate(heartbeat);
        if (heartbeat.schemaVersion !== 1)
          throw new BadRequestException('Unsupported heartbeat schema');
        await this.activity.touch(parsedTopic.hardwareUid);
      }
    } catch (error) {
      this.logger.warn(
        `MQTT message rejected: ${error instanceof Error ? error.name : 'UnknownError'}`,
      );
    }
  }
  private async validate(value: object) {
    if (
      (await validate(value, { whitelist: true, forbidNonWhitelisted: true }))
        .length
    )
      throw new BadRequestException('Invalid MQTT payload');
  }
}
