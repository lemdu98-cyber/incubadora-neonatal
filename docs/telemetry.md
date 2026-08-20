# Telemetry

Cada fila representa una magnitud de un Sensor en un instante. Usa PK `BIGINT identity` para alto volumen y las respuestas convierten `id` y `sequence` a string para JSON.

`measuredAt` es el instante declarado por el dispositivo; `receivedAt` lo asigna PostgreSQL al recibir. No son intercambiables. Se omite `createdAt` porque duplicaría `receivedAt`.

El servicio interno resuelve Device, Sensor y MeasurementDefinition, valida pertenencia y SensorCapability, deriva `incubatorId` y busca Admission activa. En mantenimiento acepta lectura técnica con `admissionId = null`; DISABLED se rechaza. `GOOD` significa técnicamente aceptada, no clínicamente normal.

MQTT entrega mensajes al mismo `TelemetryIngestionService`. `POST /telemetry/ingest` permanece como herramienta temporal protegida para ADMIN/TECHNICIAN y está deprecado para dispositivos. Las consultas usan límite 100 por defecto y 1000 máximo.

La idempotencia incluye Device, `bootId`, secuencia, Sensor y definición. `bootId` cambia en cada arranque. No se almacenan unidad, código de magnitud ni patientId duplicados.

No hay WebSockets, SSE, polling, gráficas, Alarm Rules ni Alarm Engine. Por volumen futuro se evaluarán particionado, retención, downsampling y archivado.
