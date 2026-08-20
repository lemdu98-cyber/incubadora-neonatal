# Autenticación y autorización

## Responsabilidades

- **Supabase Auth** autentica al personal autorizado y emite el access token.
- **NestJS** verifica criptográficamente el JWT y aplica autorización.
- **PostgreSQL** es la fuente de verdad para perfiles y roles de aplicación.
- **Next.js** enviará el token en `Authorization: Bearer <access_token>`; no decidirá permisos por sí solo.

No existe registro público. La creación de cuentas es una operación exclusiva de un usuario con rol `ADMIN`; los roles asignables son `ADMIN`, `DOCTOR`, `NURSE` y `TECHNICIAN`.

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

Se eligió crear perfiles desde el backend después del alta administrativa, no mediante trigger. `POST /users` crea primero el usuario en Supabase Auth y luego crea `profiles` y `user_roles` en una única operación de Prisma. Si falla la persistencia, elimina como compensación el usuario recién creado en Auth. Si también falla esa limpieza, registra únicamente el UUID afectado y devuelve un error que exige intervención manual.

El correo sigue siendo propiedad de Supabase Auth y no se duplica en `profiles`. `GET /users` y `GET /users/:id` lo resuelven mediante la API administrativa. Los tres endpoints `/users` requieren JWT válido y rol `ADMIN` obtenido de PostgreSQL.

La contraseña temporal se genera con entropía criptográfica, se entrega sólo en la respuesta exitosa de creación y no se registra ni persiste en tablas de aplicación. Es una solución transitoria; una futura entrega por invitación requerirá configurar previamente URL de redirección y plantilla de correo. Aún no existen edición, eliminación, restablecimiento de contraseña ni frontend para este flujo.

## Primer administrador

El bootstrap es deliberadamente manual y no forma parte del arranque ni del seed. Sólo puede ejecutarse cuando no existe ninguna asignación `ADMIN` y exige la confirmación `BOOTSTRAP_ADMIN_CONFIRM=CREATE_FIRST_ADMIN`, además del correo, nombre y apellido en las variables `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_FIRST_NAME` y `BOOTSTRAP_ADMIN_LAST_NAME`.

Se invoca manualmente con `npm run bootstrap:admin`. El comando muestra la contraseña temporal una sola vez; no debe ejecutarse en logs compartidos ni automatizaciones que conserven la salida. Este repositorio no ejecuta el bootstrap automáticamente.

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
