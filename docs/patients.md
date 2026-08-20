# Módulo de pacientes

`patients` registra recién nacidos sin implementar todavía tutores, ingresos o incubadoras. El número de historia clínica es explícito, normalizado y único. El peso se almacena como gramos enteros y la edad gestacional como semanas enteras más días entre 0 y 6.

Los enums son `patient_sex` (`MALE`, `FEMALE`, `UNSPECIFIED`), `blood_type` (ABO/Rh más `UNKNOWN`) y `patient_status` (`ACTIVE`, `INACTIVE`). Este último es administrativo, no describe salud ni riesgo.

`GET /patients`, `GET /patients/:id` y `POST /patients` requieren JWT y uno de los roles `ADMIN`, `DOCTOR` o `NURSE`. `TECHNICIAN` recibe 403. Next.js usa la sesión SSR y envía el Bearer a NestJS; nunca accede a la tabla directamente ni conserva datos clínicos en Web Storage.

No existen edición, eliminación, tutores, admisiones ni relación con incubadoras en esta etapa.
