# Tutores y contactos

`guardians` almacena datos personales básicos de padres, madres o tutores. Documento, teléfono, correo y dirección son opcionales. Ninguno es unique: todavía no existen tipo y país de documento, y los contactos familiares pueden compartirse.

`patient_guardians` representa la relación N:M mediante PK (`patient_id`, `guardian_id`) y enum `guardian_relationship`. La FK de paciente usa cascade sólo sobre la relación; la FK de tutor usa restrict. No existe borrado global de tutores.

Sólo `ADMIN`, `DOCTOR` y `NURSE` acceden a los endpoints `/guardians` y `/patients/:patientId/guardians`. `TECHNICIAN` recibe 403. La creación y vinculación combinada usa una transacción Prisma.

Existe como máximo un contacto principal por paciente. NestJS desmarca el contacto anterior dentro de la misma transacción y PostgreSQL refuerza la invariancia mediante un índice único parcial. El endpoint DELETE de relación nunca elimina el tutor.

El frontend ofrece `/guardians`, `/guardians/new`, `/guardians/[id]` y `/patients/[id]/guardians/add`. No conserva datos personales en Web Storage y todas las operaciones pasan por NestJS.

La lista completa de tutores aún no tiene búsqueda/paginación; deberá incorporarse antes de manejar volúmenes grandes.
