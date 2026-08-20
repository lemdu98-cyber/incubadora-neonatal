# Base de datos

Esta carpeta contiene el diseño revisable de PostgreSQL/Supabase. Identidad, pacientes, tutores, incubadoras, historial de ingresos y dispositivos están desplegados mediante migraciones aditivas versionadas.

## Conectividad implementada

```text
NestJS -> Prisma ORM -> adaptador PostgreSQL -> Supabase PostgreSQL
```

El backend dispone de un cliente Prisma compartido y un `GET /health` que ejecuta únicamente `SELECT 1`. La migración versionada de `profiles`, `roles` y `user_roles` fue aplicada correctamente con `prisma migrate deploy`. Nunca se utilizó `db push` y todavía no existen modelos clínicos.

## Identidad y Supabase Auth

`profiles.id` no genera un UUID propio: recibirá exactamente el UUID de `auth.users.id`. Prisma administra `public.profiles`, pero no modela ni modifica `auth.users`. La migración versionada añade una FK SQL explícita `profiles(id) -> auth.users(id) ON DELETE CASCADE`; esta relación queda fuera del grafo de Prisma porque el schema `auth` pertenece a Supabase.

Los roles permanecen como tabla catálogo y se relacionan N:M con perfiles mediante `user_roles`, cuya PK es (`profile_id`, `role_id`). El seed idempotente fue ejecutado y existen `ADMIN`, `DOCTOR`, `NURSE` y `TECHNICIAN`.

Supabase Auth, login, validación JWT mediante JWKS y guards de roles ya están implementados. Los perfiles y roles de aplicación se administran desde NestJS; el frontend nunca recibe una clave privilegiada de Supabase.

PostgreSQL genera `created_at` y `assigned_at` con `now()`. `updated_at` también tiene default de PostgreSQL y Prisma lo actualiza mediante `@updatedAt` cuando una escritura pasa por Prisma.

`DATABASE_URL` se usa tanto en ejecución como en la configuración CLI inicial. La URL actual corresponde a una conexión directa, apropiada para un backend persistente cuando el entorno alcanza IPv6 (o dispone de IPv4). Si en el futuro se usa un pooler para la aplicación, deberá evaluarse una URL directa separada para migraciones; no se inventará ni cambiará ninguna URL automáticamente.

## Contenido

- [`schema.md`](./schema.md): modelo lógico propuesto, relaciones, restricciones e índices.
- Las migraciones ejecutables y versionadas viven en `backend/prisma/migrations/`. La migración de incubadoras crea únicamente `incubator_status`, `incubators` y sus índices/constraints; no crea datos ni relaciona pacientes.
- La migración de Admissions crea `admission_status`, `admissions`, FKs restrictivas, checks temporales e índices únicos parciales para un solo ingreso activo por paciente e incubadora.
- La migración de Devices crea `device_type`, `device_status`, `devices`, sus unicidades, índices y la FK restrictiva hacia `incubators`; no crea dispositivos ni datos de ejemplo.

## Convenciones propuestas

- `uuid` para identidades de dominio y claves expuestas por API.
- `bigint generated always as identity` para flujos append-only de gran volumen (`telemetry` y `audit_logs`).
- `timestamptz` almacenado en UTC para eventos; `date` y `time` para datos civiles de nacimiento.
- Nombres `snake_case`, timestamps `created_at`/`updated_at` y borrado lógico mediante `status` cuando exista información sensible o histórica.

No deben agregarse credenciales, dumps con datos personales ni datos clínicos reales al repositorio.
