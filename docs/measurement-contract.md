# Contrato conceptual de mediciones

Este documento define un evento normalizado futuro. No implementa MQTT, ingestión ni Telemetry.

```json
{
  "schemaVersion": 1,
  "deviceHardwareUid": "ABC123",
  "sensorCode": "MAX30205-001",
  "measurementCode": "BODY_TEMPERATURE",
  "value": 36.7,
  "measuredAt": "2026-08-20T20:15:30.123Z",
  "sequence": 1254
}
```

- `schemaVersion`: entero para evolucionar el payload; comienza conceptualmente en 1.
- `deviceHardwareUid`: corresponde a `Device.hardwareUid`; identifica, pero no autentica.
- `sensorCode`: corresponde a `Sensor.code`.
- `measurementCode`: corresponde a `MeasurementDefinition.code` y debe ser capacidad del sensor.
- `value`: número validado por backend según `valueType`.
- `measuredAt`: ISO 8601 UTC cercano a la medición. El futuro registro conservará también `received_at`.
- `sequence`: entero incremental por dispositivo o sesión para detectar duplicados, pérdidas y ordenar eventos.

La unidad no viaja en cada mensaje: se deriva de `measurementCode → MeasurementDefinition.unitSymbol`, evitando variantes inconsistentes. Tampoco se envían `patientId`, nombre, historia clínica, tutor ni `incubatorId`. El servidor deriva `Device → Incubator → Admission activa → Patient`; la capa IoT sólo maneja identidad técnica.

La futura Telemetry podrá clasificar calidad como `GOOD`, `SUSPECT` o `INVALID`, pero aún no se crea ese enum. Los umbrales clínicos pertenecerán a Alarm Rules, nunca a MeasurementDefinition.
