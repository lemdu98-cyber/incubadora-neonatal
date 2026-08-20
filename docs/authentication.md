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

La contraseña temporal se genera con entropía criptográfica, se entrega sólo en la respuesta exitosa de creación y no se registra ni persiste en tablas de aplicación. Es una solución transitoria; una futura entrega por invitación requerirá configurar previamente URL de redirección y plantilla de correo. Aún no existen edición, eliminación, restablecimiento de contraseña ni pantalla frontend de administración de usuarios.

## Primer administrador

El bootstrap es deliberadamente manual y no forma parte del arranque ni del seed. Sólo puede ejecutarse cuando no existe ninguna asignación `ADMIN` y exige la confirmación `BOOTSTRAP_ADMIN_CONFIRM=CREATE_FIRST_ADMIN`, además del correo, nombre y apellido en las variables `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_FIRST_NAME` y `BOOTSTRAP_ADMIN_LAST_NAME`.

Se invoca manualmente con `npm run bootstrap:admin`. El comando muestra la contraseña temporal una sola vez; no debe ejecutarse en logs compartidos ni automatizaciones que conserven la salida. Este repositorio no ejecuta el bootstrap automáticamente.

## Flujo del frontend

```text
email/password
  -> Supabase Auth
  -> access_token
  -> Authorization: Bearer <access_token>
  -> NestJS AuthGuard
  -> ProfilesService / RolesGuard
```

La Publishable Key está destinada al frontend. `SUPABASE_SECRET_KEY`, `DATABASE_URL` y cualquier credencial administrativa permanecen exclusivamente en el backend.

## Sesión web en Next.js

El frontend usa `@supabase/ssr` con App Router. El cliente browser realiza `signInWithPassword` y `signOut`, mientras que el cliente server lee la misma sesión desde cookies. `src/proxy.ts` valida/refresca los claims para `/login` y `/dashboard`; no existe una copia manual del JWT en `localStorage`.

El dashboard vuelve a validar la sesión en el servidor, obtiene el access token de la sesión actual y lo envía a NestJS exclusivamente como `Authorization: Bearer <token>` al consultar `/auth/me`. Los nombres, estado y roles mostrados proceden de NestJS/PostgreSQL, no de valores de autorización guardados en el navegador.

Si no hay sesión, `/dashboard` redirige a `/login`. Si NestJS rechaza el JWT, la ruta `/auth/logout` invalida la sesión Supabase y limpia sus cookies antes de redirigir. Un fallo de red o backend muestra un estado indisponible y no conserva un dashboard con información anterior.

El bundle sólo utiliza `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `NEXT_PUBLIC_API_URL`. Las credenciales administrativas y de base de datos no forman parte del frontend.

## Administración web de usuarios

Las rutas `/users`, `/users/new` y `/users/[id]` requieren una sesión Supabase válida y que `/auth/me` devuelva `ADMIN`. Esta comprobación mejora la experiencia, pero NestJS continúa aplicando la autorización definitiva mediante `RolesGuard` en cada endpoint.

La capa `frontend/src/lib/api.ts` centraliza `GET /users`, `GET /users/:id` y `POST /users`. Cada llamada recibe el access token de la sesión actual y lo transmite exclusivamente en el header Bearer. El frontend no usa la Admin API de Supabase ni implementa signup público.

La contraseña temporal devuelta después de `POST /users` existe sólo en estado React mientras se muestra el diálogo de éxito. No se guarda en cookies, Web Storage, URL, logs ni analytics; desaparece al cerrar el diálogo, navegar o recargar. El usuario administrador debe copiarla antes de abandonar esa pantalla.
