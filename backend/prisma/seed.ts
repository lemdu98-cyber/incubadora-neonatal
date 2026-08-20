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

async function main(): Promise<void> {
  await prisma.$transaction(
    roles.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: role,
      }),
    ),
  );
}

void main().finally(async () => {
  await prisma.$disconnect();
});
