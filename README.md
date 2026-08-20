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
- Integraciones: PostgreSQL/Supabase, Supabase Auth y adaptador MQTT para EMQX.
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

## Estado actual

El sistema incluye identidad, módulos clínicos/técnicos, Telemetry normalizada y consumo MQTT opcional. Todavía no existen tiempo real web, Alarm Rules, Alarm Engine ni firmware completo.

EMQX local y su provisionamiento seguro se documentan en `docs/mqtt.md` y `docs/mqtt-security.md`. MQTT permanece deshabilitado por defecto.

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
