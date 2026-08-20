# MQTT y EMQX

```text
ESP32 / ESP8266
     │ MQTT: telemetría QoS 1, retain false
     ▼
    EMQX
     │ SUB sin wildcard global
     ▼
 NestJS MqttService
     ▼
 MqttMessageHandler
     ▼
 TelemetryIngestionService
     ▼
 PostgreSQL
```

## Topics y payloads

- `incubadora/devices/{hardwareUid}/telemetry`: QoS 1, nunca retained.
- `incubadora/devices/{hardwareUid}/heartbeat`: QoS 0, nunca retained.

El backend se suscribe únicamente a `incubadora/devices/+/telemetry` y `incubadora/devices/+/heartbeat`. El topic sólo contiene identidad técnica. El hardware UID extraído debe coincidir exactamente con el payload; después se reutiliza `TelemetryIngestionService`.

Heartbeat recomendado cada 30 segundos. Un heartbeat o telemetría válidos actualizan `lastSeenAt` con hora del servidor, como máximo una vez cada 15 segundos por Device. `lastSeenAt` permite calcular conectividad más adelante, pero no crea estado ONLINE/OFFLINE.

`MQTT_ENABLED=false` mantiene MQTT totalmente desactivado. Cuando está activo, MQTT.js reconecta cada cinco segundos y vuelve a suscribir en `connect`. Una indisponibilidad del broker no impide iniciar NestJS; `/health` informa `connected`, `disconnected` o `disabled` sin revelar configuración.

El endpoint JWT `/telemetry/ingest` permanece como herramienta de desarrollo y queda deprecado para dispositivos cuando MQTT esté activo. No hay ACK aplicativo, LWT, shared subscriptions, comandos ni publicación desde backend. Una futura escala horizontal deberá usar shared subscriptions.

## EMQX local

1. Copiar `mqtt/.env.example` como `mqtt/.env` y definir una contraseña local fuerte.
2. Ejecutar `docker compose --env-file mqtt/.env -f mqtt/compose.yml up -d`.
3. Abrir el dashboard sólo local en `http://127.0.0.1:18083`.
4. Crear autenticador username/password, una credencial exclusiva del backend y una por Device.
5. Crear las ACL descritas en `mqtt-security.md`.

El listener MQTT queda enlazado a loopback en este compose. Producción debe usar `mqtts://`, certificados válidos, dashboard no expuesto a Internet y secretos administrados fuera de Git.
