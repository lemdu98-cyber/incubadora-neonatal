export type MqttMessageKind = 'telemetry' | 'heartbeat';
export type ParsedMqttTopic = { hardwareUid: string; kind: MqttMessageKind };
