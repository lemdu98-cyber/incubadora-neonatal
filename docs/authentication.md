# Autenticación y autorización

## Responsabilidades

- **Supabase Auth** autentica al personal autorizado y emite el access token.
- **NestJS** verifica criptográficamente el JWT y aplica autorización.
- **PostgreSQL** es la fuente de verdad para perfiles y roles de aplicación.
- **Next.js** enviará el token en `Authorization: Bearer <access_token>`; no decidirá permisos por sí solo.

No existe registro público. La futura creación de cuentas será una operación administrativa para `ADMIN`, `DOCTOR`, `NURSE` o `TECHNICIAN`.

## Verificación JWT

El backend deriva estos valores de `SUPABASE_URL`:

```text
issuer = {SUPABASE_URL}/auth/v1
jwks   = {SUPABASE_URL}/auth/v1/.well-known/jwks.json
audience = authenticated
```

El JWKS contiene sólo claves públicas y se usa mediante `jose`. Se validan firma asimétrica, algoritmo permitido, expiración, issuer, audience y `sub` UUID. También se exige rol Supabase `authenticated` y se rechazan usuarios anónimos. La Secret Key no participa en esta validación.

El proyecto actualmente publica una clave asimétrica ES256. Si se cambiara a la firma simétrica heredada, JWKS no bastaría y habría que validar cada token mediante el endpoint de usuario de Supabase; nunca se debe reutilizar la Secret Key como secreto JWT.

## Perfil y roles

`profiles.id` coincide exactamente con `auth.users.id`, tomado del claim verificado `sub`. `ProfilesService` carga el perfil y los roles mediante `user_roles`; nunca acepta identidad o roles desde el body del cliente.

Se eligió crear perfiles desde el backend después de una futura alta administrativa, no mediante trigger. Esa operación deberá crear el usuario de Supabase Auth y luego hacer un `upsert` idempotente de `profiles` con el mismo UUID, asignando roles en una operación controlada y auditada. Esta etapa todavía no implementa creación de cuentas ni perfiles automáticos.

## Flujo futuro del frontend

```text
email/password
  -> Supabase Auth
  -> access_token
  -> Authorization: Bearer <access_token>
  -> NestJS AuthGuard
  -> ProfilesService / RolesGuard
```

La Publishable Key podrá estar en el frontend. `SUPABASE_SECRET_KEY`, `DATABASE_URL` y cualquier credencial administrativa permanecen exclusivamente en el backend.
