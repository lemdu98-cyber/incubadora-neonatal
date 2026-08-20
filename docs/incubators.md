# Incubadoras

El módulo administra el inventario físico y lógico de incubadoras. No controla equipos ni expresa una asignación clínica.

## Modelo

`incubators` usa UUID generado automáticamente. `code` es el identificador visible, requerido, normalizado a mayúsculas y único. `name` y `location` son requeridos. `serial_number` es nullable y único cuando existe; PostgreSQL permite múltiples valores nulos. Fabricante, modelo y notas técnicas son opcionales.

El enum `incubator_status` contiene:

- `AVAILABLE`: disponible.
- `IN_USE`: en uso.
- `MAINTENANCE`: mantenimiento.
- `OUT_OF_SERVICE`: fuera de servicio.

Toda creación recibe `AVAILABLE` desde NestJS. El cliente no puede enviar `status` y todavía no existe endpoint para cambiarlo. `IN_USE` no se automatiza hasta implementar Admissions.

## API y permisos

| Endpoint | ADMIN | DOCTOR | NURSE | TECHNICIAN |
|---|---:|---:|---:|---:|
| `GET /incubators` | Sí | Sí | Sí | Sí |
| `GET /incubators/:id` | Sí | Sí | Sí | Sí |
| `POST /incubators` | Sí | No | No | Sí |

Los endpoints requieren JWT y pasan por `AuthGuard` y `RolesGuard`. El POST valida una lista cerrada de propiedades. Código o número de serie duplicado devuelve `409 Conflict` sin exponer errores internos de Prisma.

No existen PATCH, PUT ni DELETE. Tampoco se permite asignar pacientes o cambiar el estado desde esta API.

## Frontend

- `/incubators`: listado para los cuatro roles.
- `/incubators/new`: creación SSR restringida a ADMIN y TECHNICIAN.
- `/incubators/[id]`: detalle administrativo para los cuatro roles.

El frontend se comunica exclusivamente con NestJS y no guarda datos en Web Storage. Los tipos runtime y etiquetas de estados viven en `frontend/src/lib/incubator-options.ts`.

## Límites de esta etapa

El detalle muestra los dispositivos administrativos asociados. No existen sensores, MQTT, telemetría, alarmas ni control físico, y esas capacidades no deben inferirse a partir de un dispositivo `ACTIVE`.
