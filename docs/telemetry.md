# Telemetry

Cada fila representa una magnitud de un Sensor en un instante. Usa PK `BIGINT identity` para alto volumen y las respuestas convierten `id` y `sequence` a string para JSON.

`measuredAt` es el instante declarado por el dispositivo; `receivedAt` lo asigna PostgreSQL al recibir. No son intercambiables. Se omite `createdAt` porque duplicaría `receivedAt`.

El servicio interno resuelve Device, Sensor y MeasurementDefinition, valida pertenencia y SensorCapability, deriva `incubatorId` y busca Admission activa. En mantenimiento acepta lectura técnica con `admissionId = null`; DISABLED se rechaza. `GOOD` significa técnicamente aceptada, no clínicamente normal.

`POST /telemetry/ingest` es una herramienta temporal protegida para ADMIN/TECHNICIAN, no un endpoint para dispositivos en producción. Las consultas usan límite 100 por defecto y 1000 máximo mediante `/telemetry`, `/sensors/:id/telemetry` y la ruta clínica `/admissions/:id/telemetry`.

La idempotencia incluye Device, `bootId`, secuencia, Sensor y definición. `bootId` cambia en cada arranque. No se almacenan unidad, código de magnitud ni patientId duplicados.

No hay MQTT, WebSockets, SSE, polling, gráficas, Alarm Rules ni Alarm Engine. Por volumen futuro se evaluarán particionado, retención, downsampling y archivado.
