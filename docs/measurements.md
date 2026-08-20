# Measurement Definitions y Sensor Capabilities

`MeasurementDefinition` describe una magnitud estable: código técnico, nombre, unidad canónica, tipo de valor, categoría y decimales de presentación. No contiene límites normales ni umbrales de alarma. `decimalPlaces` no representa precisión médica certificada.

`SensorCapability` relaciona explícitamente un Sensor físico con una magnitud que puede producir. Es configuración, no una lectura. Las recomendaciones por tipo sólo ayudan en la interfaz y nunca crean relaciones automáticamente.

El catálogo base contiene `AIR_TEMPERATURE`, `RELATIVE_HUMIDITY`, `HEART_RATE`, `SPO2` y `BODY_TEMPERATURE`. Se mantiene mediante upsert idempotente. Todos los roles pueden consultarlo y consultar capacidades; sólo ADMIN/TECHNICIAN pueden asignar o desvincular.

Cuando exista Telemetry, deberá preservar el contexto histórico y podría restringir cambios de capacidades ya utilizadas. Esa política no se implementa todavía.
