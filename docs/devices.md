# Devices

El módulo registra el inventario administrativo de dispositivos físicos asignados a incubadoras. Cada dispositivo tiene UUID, `hardwareUid` y código únicos, tipo (`ESP32`, `ESP8266` u `OTHER`), incubadora obligatoria, estado administrativo, versión de firmware opcional y notas técnicas. Device no representa un Sensor.

La asociación actual es directa `Device → Incubator`. Si los equipos se reasignan con frecuencia, una evolución futura podrá incorporar historial de asignaciones; esa tabla no forma parte de esta etapa.

## Acceso

Todos los roles autenticados pueden consultar dispositivos y verlos desde el detalle de una incubadora. Sólo `ADMIN` y `TECHNICIAN` pueden registrar uno nuevo; por ello únicamente esos roles ven Devices en la navegación y el panel. La API conserva los guards JWT y de roles.

Al crear, backend normaliza `hardwareUid` y `code` a mayúsculas, fuerza `ACTIVE` y deja `lastSeenAt` en `null`. El frontend no permite enviar estado ni última comunicación. Una incubadora inexistente produce 404 y duplicar UID o código produce 409. `hardwareUid` es un identificador, no una credencial ni un secreto; MQTT deberá usar credenciales o certificados independientes.

## Límites actuales

No hay edición ni eliminación. El detalle de Device muestra sus Sensors; las magnitudes se definen mediante el catálogo y SensorCapability. Todavía no existen MQTT, telemetría, heartbeat automático, alarmas, comandos ni control físico. `ACTIVE` expresa sólo inventario administrativo y “Sin comunicación registrada” no equivale a estado offline.
