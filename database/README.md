# Base de datos

Esta carpeta contiene el diseño revisable de PostgreSQL/Supabase. En esta etapa no existen tablas remotas, migraciones SQL ejecutables ni integración desde NestJS.

## Contenido

- [`schema.md`](./schema.md): modelo lógico propuesto, relaciones, restricciones e índices.
- [`migrations/`](./migrations/): ubicación reservada para migraciones aprobadas en una etapa posterior.

## Convenciones propuestas

- `uuid` para identidades de dominio y claves expuestas por API.
- `bigint generated always as identity` para flujos append-only de gran volumen (`telemetry` y `audit_logs`).
- `timestamptz` almacenado en UTC para eventos; `date` y `time` para datos civiles de nacimiento.
- Nombres `snake_case`, timestamps `created_at`/`updated_at` y borrado lógico mediante `status` cuando exista información sensible o histórica.

No deben agregarse credenciales, dumps con datos personales ni datos clínicos reales al repositorio.
