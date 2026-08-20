# Admissions — historial paciente–incubadora

Admissions conserva cada intervalo de asignación sin añadir `patients.incubator_id`. La relación histórica es `Patient → Admission → Incubator`.

## Estados

- `ACTIVE`: asignación actual; no tiene fecha de salida.
- `DISCHARGED`: estancia finalizada.
- `TRANSFERRED`: salida previa a una asignación en otra incubadora.
- `CANCELLED`: ingreso invalidado administrativamente.

Una transferencia se realiza en dos operaciones explícitas: cerrar el ingreso actual con `TRANSFERRED` y crear otro ingreso. No existe un endpoint combinado.

## Integridad y concurrencia

La base garantiza como máximo un `ACTIVE` por paciente y otro por incubadora mediante índices únicos parciales. Las FKs hacia pacientes e incubadoras usan `ON DELETE RESTRICT`. Los checks garantizan `discharged_at >= admitted_at` y coherencia entre estado activo/final y fecha de salida.

NestJS comprueba disponibilidad y usa transacciones para crear/cerrar el ingreso junto con el cambio de estado de incubadora. Las violaciones concurrentes `P2002`/`P2034` se convierten en 409 sin exponer errores Prisma.

No se añadió `btree_gist`: impedir cualquier solapamiento histórico requiere definir antes cómo tratar cancelaciones y correcciones administrativas. Los índices parciales cubren la exclusión operativa inicial.

`Patient.status` no se modifica automáticamente porque es administrativo. Admissions gobierna `Incubator.status` entre `AVAILABLE` e `IN_USE`. No existe todavía endpoint para gestionar `MAINTENANCE` o `OUT_OF_SERVICE`.

## API y permisos

ADMIN, DOCTOR y NURSE pueden listar, consultar, crear y cerrar ingresos, además de consultar historiales y asignaciones activas. TECHNICIAN sólo puede consultar la ocupación activa de una incubadora; no accede al módulo clínico.

- `POST /admissions`
- `GET /admissions`
- `GET /admissions/:id`
- `POST /admissions/:id/discharge`
- `GET /patients/:id/admissions`
- `GET /patients/:id/active-admission`
- `GET /incubators/:id/admissions`
- `GET /incubators/:id/active-admission`

Los endpoints de ingreso activo devuelven el objeto o `null` cuando no hay asignación.

## Límites

No existen Devices, Sensors, MQTT, Telemetry, Alarm Rules, motor de alarmas ni control físico. Las notas son administrativas y no sustituyen una historia clínica.
