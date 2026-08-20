import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const roles = [
  { code: 'ADMIN', name: 'Administrador' },
  { code: 'DOCTOR', name: 'Médico' },
  { code: 'NURSE', name: 'Enfermería' },
  { code: 'TECHNICIAN', name: 'Técnico' },
] as const;

const measurementDefinitions = [
  {
    code: 'AIR_TEMPERATURE',
    name: 'Temperatura ambiente',
    unitSymbol: '°C',
    valueType: 'FLOAT',
    category: 'ENVIRONMENTAL',
    decimalPlaces: 1,
    description: 'Medición de temperatura del ambiente de la incubadora.',
  },
  {
    code: 'RELATIVE_HUMIDITY',
    name: 'Humedad relativa',
    unitSymbol: '%',
    valueType: 'FLOAT',
    category: 'ENVIRONMENTAL',
    decimalPlaces: 1,
    description: 'Medición de humedad relativa del ambiente de la incubadora.',
  },
  {
    code: 'HEART_RATE',
    name: 'Frecuencia cardíaca',
    unitSymbol: 'bpm',
    valueType: 'INTEGER',
    category: 'PHYSIOLOGICAL',
    decimalPlaces: 0,
    description: 'Medición de frecuencia cardíaca.',
  },
  {
    code: 'SPO2',
    name: 'Saturación de oxígeno',
    unitSymbol: '%',
    valueType: 'FLOAT',
    category: 'PHYSIOLOGICAL',
    decimalPlaces: 1,
    description: 'Medición de saturación periférica de oxígeno.',
  },
  {
    code: 'BODY_TEMPERATURE',
    name: 'Temperatura corporal',
    unitSymbol: '°C',
    valueType: 'FLOAT',
    category: 'PHYSIOLOGICAL',
    decimalPlaces: 1,
    description: 'Medición de temperatura corporal.',
  },
] as const;

async function main(): Promise<void> {
  await prisma.$transaction([
    ...roles.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: role,
      }),
    ),
    ...measurementDefinitions.map((definition) =>
      prisma.measurementDefinition.upsert({
        where: { code: definition.code },
        update: definition,
        create: definition,
      }),
    ),
  ]);
}

void main().finally(async () => {
  await prisma.$disconnect();
});
