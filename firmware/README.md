# Firmware IoT mínimo

Firmware Arduino/C++ para validar el transporte seguro entre un ESP físico y EMQX. En esta etapa sólo conecta Wi-Fi, sincroniza UTC por NTP, autentica el Device en MQTT y publica heartbeat. No lee sensores ni publica telemetría real.

## Estructura

```text
firmware/
  common/IoTFirmware.h       lógica compartida
  esp32/esp32.ino            sketch ESP32
  esp32/secrets.example.h    plantilla local
  esp8266/esp8266.ino        sketch ESP8266
  esp8266/secrets.example.h  plantilla local
```

Cada sketch incluye el mismo módulo común. Los `secrets.h` reales están ignorados por Git.

## Requisitos

Instalar desde Arduino IDE, sin descargar librerías manualmente desde fuentes desconocidas:

1. Board package **esp32 by Espressif Systems** (core 3.x) para ESP32.
2. Board package **esp8266 by ESP8266 Community** (core 3.x) para ESP8266.
3. Library Manager: **espMqttClient 1.7.3** de Bert Melis.
4. Library Manager: **ArduinoJson 7.x** de Benoit Blanchon.

`espMqttClient` 1.7.3 declara soporte para Arduino ESP32/ESP8266, TCP/TLS y todos los niveles QoS. La llamada futura es `publish(topic, 1, false, payload)`: devuelve el packet ID para QoS 1 y `0` si no pudo encolar el mensaje. Heartbeat usa `publish(topic, 0, false, payload)`.

## Configuración

En el directorio de la placa piloto:

1. Copiar `secrets.example.h` como `secrets.h`.
2. Completar Wi-Fi, hostname/puerto EMQX, hardware UID, ClientId, username y una contraseña MQTT exclusiva.
3. Verificar esta igualdad exacta:

```text
Device.hardwareUid en PostgreSQL
= DEVICE_HARDWARE_UID en secrets.h
= hardwareUid del topic
= deviceHardwareUid del JSON
```

`MQTT_PASSWORD` nunca debe ser el hardware UID. `MQTT_CLIENT_ID` debe ser único, por ejemplo `device-ABC123`.

Para una red local controlada usar `MQTT_USE_TLS 0` y el listener TCP local. Para producción usar `MQTT_USE_TLS 1`, puerto MQTTS y pegar sólo la Root CA pública en `MQTT_ROOT_CA`. No se incluye clave privada, no existe `setInsecure()` y el broker debe configurarse mediante un hostname que coincida con el certificado; no usar una IP si el certificado no la contiene.

## Arduino IDE

1. Abrir `firmware/esp32/esp32.ino` (piloto recomendado) o `firmware/esp8266/esp8266.ino`.
2. Elegir la placa y puerto correctos en **Tools**.
3. Ejecutar **Sketch → Verify/Compile**.
4. Revisar warnings, memoria dinámica, tamaño de sketch y espacio libre antes de cargar.
5. Ejecutar **Upload** y abrir Serial Monitor a `115200` baud.

Serial muestra cambios de Wi-Fi/MQTT, espera NTP, publicaciones y errores técnicos. Nunca imprime SSID passwords, MQTT passwords ni certificados.

## Comportamiento

- `bootId` es un UUID v4 generado con el RNG de la placa una vez por boot y no se persiste.
- `sequence` empieza en cero y aumenta sólo cuando una publicación se acepta en la cola MQTT.
- NTP usa UTC mediante `configTime(0, 0, ...)`; no publica hasta disponer de una fecha válida.
- Heartbeat se publica cada 30 segundos, sin `delay(30000)`, con comparaciones resistentes al overflow de `millis()`.
- Wi-Fi y MQTT reintentan con backoff 1, 2, 4, 8, 16 y máximo 30 segundos.
- LWT publica `offline` con QoS 1 y retain; al conectar publica `online` con QoS 1 y retain.
- El Device no se suscribe a ningún topic.
- `publishTelemetry(...)` queda preparada con QoS 1, pero no se invoca en esta etapa.

## Provisionamiento EMQX del piloto

Para `ABC123`, crear manualmente una credencial propia y una contraseña distinta del UID. Fijar el ClientId `device-ABC123` y una ACL que sólo permita:

```text
PUB incubadora/devices/ABC123/heartbeat
PUB incubadora/devices/ABC123/telemetry
PUB incubadora/devices/ABC123/status
```

Denegar otros PUB y todos los SUB. Con un cliente de prueba autenticado como el Device, intentar publicar a `incubadora/devices/OTRO/heartbeat`: EMQX debe denegarlo. Luego probar topic `ABC123` con `deviceHardwareUid: XYZ999`: NestJS debe rechazarlo por mismatch y no actualizar `lastSeenAt`.

## Prueba end-to-end

1. Levantar EMQX y NestJS.
2. Provisionar el Device en PostgreSQL/aplicación y su credencial/ACL en EMQX.
3. Encender primero un único ESP32 piloto.
4. Confirmar por Serial: Wi-Fi conectado, NTP sincronizado, MQTT conectado y heartbeat publicado.
5. Confirmar en NestJS que el mensaje fue aceptado y que `Device.lastSeenAt` cambia.
6. Confirmar que `/health` reporta MQTT `connected`.
7. Reiniciar router, EMQX y NestJS por separado. El ESP debe recuperar Wi-Fi/MQTT; EMQX no depende de que NestJS esté activo.

No existe almacenamiento offline todavía: un heartbeat fallido se reintenta en un ciclo posterior.
