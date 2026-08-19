# Incubadora Neonatal IoT

Base técnica para la reingeniería de un sistema educativo/prototipo de monitoreo de incubadoras neonatales. El proyecto no es un dispositivo médico ni está clínicamente validado.

## Arquitectura prevista

Los dispositivos ESP32/ESP8266 publicarán telemetría mediante MQTT hacia EMQX. NestJS será el único núcleo de validación, autorización, procesamiento y persistencia. Next.js consumirá exclusivamente la API REST del backend. PostgreSQL y Supabase se incorporarán en una etapa posterior.

```text
Sensores -> ESP32/ESP8266 -> EMQX -> NestJS -> PostgreSQL/Supabase -> Next.js
```

## Tecnologías

- Frontend: Next.js, React, TypeScript, App Router y Tailwind CSS.
- Backend: NestJS, TypeScript y API REST.
- Futuras integraciones: PostgreSQL, Supabase Auth, MQTT y EMQX.
- Firmware: Arduino IDE/C++ para ESP32 y ESP8266.

## Estructura

```text
.
├── backend/   # API y futura lógica de negocio
├── frontend/  # Aplicación web
├── firmware/  # Código futuro de microcontroladores
├── mqtt/      # Configuración y utilidades futuras de EMQX
├── database/  # Esquema y migraciones futuras
└── docs/      # Documentación técnica
```

## Estado inicial

La base de NestJS y Next.js está inicializada con configuración estricta, lint y builds independientes. Todavía no se implementaron autenticación, base de datos, pacientes, MQTT, sensores ni alarmas.

## Desarrollo local

Requiere Node.js y npm. Copia los archivos `.env.example` como `.env` sólo cuando necesites personalizar la configuración.

```bash
cd backend
npm install
npm run start:dev
```

```bash
cd frontend
npm install
npm run dev
```

