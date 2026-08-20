# Sensors

Sensors registra el inventario técnico de sensores conectados a cada Device. La relación es `Sensor → Device → Incubator`; Sensor no se relaciona directamente con Patient ni Admission y no representa lecturas en vivo.

## Modelo y decisiones

Los tipos iniciales son `DHT11`, `DHT22`, `MAX30100`, `MAX30205` y `OTHER`. El estado `ACTIVE`, `MAINTENANCE` o `DISABLED` es exclusivamente administrativo, no conectividad.

No se modela una única unidad porque un mismo sensor puede producir varias magnitudes. Las unidades canónicas se resuelven mediante sus MeasurementDefinitions y capacidades explícitas.

`channel` es un dato técnico informativo, no una credencial. `calibrationMetadata` es JSON técnico nullable, permanece sin edición desde el frontend y no debe contener información clínica ni calibraciones inventadas.

## Acceso y límites

Todos los roles autenticados pueden consultar. Sólo `ADMIN` y `TECHNICIAN` pueden registrar sensores y ven la navegación principal; DOCTOR/NURSE acceden desde Device. Incubator no carga directamente todos sus sensores para evitar duplicar una jerarquía potencialmente pesada.

El detalle permite consultar capacidades y ADMIN/TECHNICIAN pueden asignarlas o retirarlas. Telemetry existe como almacenamiento/API sin vista en vivo; no hay MQTT, polling, gráficas, heartbeat, alarmas ni control físico.
