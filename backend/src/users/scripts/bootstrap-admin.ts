import { NestFactory } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AppModule } from '../../app.module';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';

async function bootstrap(): Promise<void> {
  if (process.env.BOOTSTRAP_ADMIN_CONFIRM !== 'CREATE_FIRST_ADMIN') {
    throw new Error(
      'Bootstrap blocked. Set BOOTSTRAP_ADMIN_CONFIRM=CREATE_FIRST_ADMIN explicitly.',
    );
  }

  const input = plainToInstance(CreateUserDto, {
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME,
    lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME,
    roles: ['ADMIN'],
  });
  await validateOrReject(input, { whitelist: true });

  process.stdout.write(
    'WARNING: this command will create the first ADMIN in Supabase Auth and PostgreSQL.\n',
  );

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const result = await app.get(UsersService).bootstrapFirstAdmin(input);
    process.stdout.write(`ADMIN created: ${result.id}\n`);
    process.stdout.write(
      `Temporary password (shown once): ${result.temporaryPassword}\n`,
    );
  } finally {
    await app.close();
  }
}

void bootstrap();
