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
import { SensorsModule } from './sensors/sensors.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { MqttModule } from './mqtt/mqtt.module';

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
        MQTT_ENABLED: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        MQTT_BROKER_URL: Joi.string()
          .uri({ scheme: ['mqtt', 'mqtts', 'ws', 'wss'] })
          .default('mqtt://localhost:1883'),
        MQTT_CLIENT_ID: Joi.string()
          .min(1)
          .max(128)
          .default('incubadora-backend-dev'),
        MQTT_USERNAME: Joi.string()
          .allow('')
          .default('')
          .when('MQTT_ENABLED', {
            is: true,
            then: Joi.string().min(1).required(),
          }),
        MQTT_PASSWORD: Joi.string()
          .allow('')
          .default('')
          .when('MQTT_ENABLED', {
            is: true,
            then: Joi.string().min(1).required(),
          }),
        MQTT_TELEMETRY_TOPIC: Joi.string()
          .pattern(/^[^#]*\+[^#]*\/telemetry$/)
          .default('incubadora/devices/+/telemetry'),
        MQTT_HEARTBEAT_TOPIC: Joi.string()
          .pattern(/^[^#]*\+[^#]*\/heartbeat$/)
          .default('incubadora/devices/+/heartbeat'),
        MQTT_QOS: Joi.number().valid(0, 1).default(1),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    AuthModule,
    AdmissionsModule,
    DevicesModule,
    SensorsModule,
    MeasurementsModule,
    TelemetryModule,
    MqttModule,
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
