import { Module } from '@nestjs/common';
import { connect } from 'mqtt';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { DeviceActivityService } from './device-activity.service';
import { MqttMessageHandlerService } from './mqtt-message-handler.service';
import { MQTT_CONNECT, MqttService } from './mqtt.service';
import { MqttTopicService } from './mqtt-topic.service';
@Module({
  imports: [TelemetryModule],
  providers: [
    MqttService,
    MqttMessageHandlerService,
    MqttTopicService,
    DeviceActivityService,
    { provide: MQTT_CONNECT, useValue: connect },
  ],
  exports: [MqttService],
})
export class MqttModule {}
