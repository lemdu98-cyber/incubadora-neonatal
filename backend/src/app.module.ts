import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { GuardiansModule } from './guardians/guardians.module';
import { IncubatorsModule } from './incubators/incubators.module';
import { AdmissionsModule } from './admissions/admissions.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        FRONTEND_URL: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .required(),
        PORT: Joi.number().port().default(3001),
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        SUPABASE_URL: Joi.string().uri().required(),
        SUPABASE_PUBLISHABLE_KEY: Joi.string().required(),
        SUPABASE_SECRET_KEY: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    AuthModule,
    AdmissionsModule,
    DevicesModule,
    DatabaseModule,
    HealthModule,
    GuardiansModule,
    IncubatorsModule,
    PatientsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
