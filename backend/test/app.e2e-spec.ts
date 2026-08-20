import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { JwtVerificationService } from './../src/auth/services/jwt-verification.service';
import { ProfilesService } from './../src/profiles/profiles.service';
import { UsersService } from './../src/users/users.service';
import { PatientsService } from './../src/patients/patients.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const adminId = '00000000-0000-4000-8000-000000000001';
  const userId = '00000000-0000-4000-8000-000000000002';
  const createdId = '00000000-0000-4000-8000-000000000003';
  const technicianId = '00000000-0000-4000-8000-000000000004';
  const doctorId = '00000000-0000-4000-8000-000000000005';
  const nurseId = '00000000-0000-4000-8000-000000000006';
  const patientId = '00000000-0000-4000-8000-000000000007';
  const patient = {
    id: patientId,
    medicalRecordNumber: 'RN-2026-000001',
    firstName: 'Mateo',
    lastName: 'Perez',
    birthDate: '2026-08-20',
    birthTime: '03:15',
    sex: 'MALE',
    birthWeightGrams: 2450,
    gestationalAgeWeeks: 36,
    gestationalAgeDays: 4,
    bloodType: 'O_POSITIVE',
    status: 'ACTIVE',
  };
  const createdUser = {
    id: createdId,
    email: 'doctor@example.com',
    firstName: 'Ana',
    lastName: 'Pérez',
    status: 'ACTIVE',
    roles: ['DOCTOR'],
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        checkConnection: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(JwtVerificationService)
      .useValue({
        verify: jest.fn((token: string) => {
          if (token === 'admin-token') {
            return Promise.resolve({ id: adminId, email: 'admin@example.com' });
          }
          if (token === 'user-token') {
            return Promise.resolve({ id: userId, email: 'user@example.com' });
          }
          if (token === 'technician-token')
            return Promise.resolve({
              id: technicianId,
              email: 'tech@example.com',
            });
          if (token === 'doctor-token')
            return Promise.resolve({
              id: doctorId,
              email: 'doctor@example.com',
            });
          if (token === 'nurse-token')
            return Promise.resolve({ id: nurseId, email: 'nurse@example.com' });
          return Promise.reject(new UnauthorizedException('Unauthorized'));
        }),
      })
      .overrideProvider(ProfilesService)
      .useValue({
        findByUserId: jest.fn((id: string) =>
          Promise.resolve(
            id === adminId
              ? {
                  id: adminId,
                  firstName: 'Admin',
                  lastName: 'Test',
                  status: 'ACTIVE',
                  roles: ['ADMIN'],
                }
              : null,
          ),
        ),
        findRoleCodes: jest.fn((id: string) =>
          Promise.resolve(
            id === adminId
              ? ['ADMIN']
              : id === technicianId
                ? ['TECHNICIAN']
                : id === doctorId
                  ? ['DOCTOR']
                  : id === nurseId
                    ? ['NURSE']
                    : [],
          ),
        ),
      })
      .overrideProvider(UsersService)
      .useValue({
        create: jest.fn().mockResolvedValue({
          ...createdUser,
          temporaryPassword: 'Aa1!temporary-password',
        }),
        findAll: jest.fn().mockResolvedValue([createdUser]),
        findOne: jest.fn((id: string) =>
          id === createdId
            ? Promise.resolve(createdUser)
            : Promise.reject(new NotFoundException('User not found')),
        ),
      })
      .overrideProvider(PatientsService)
      .useValue({
        create: jest.fn().mockResolvedValue(patient),
        findAll: jest.fn().mockResolvedValue([patient]),
        findOne: jest.fn((id: string) =>
          id === patientId
            ? Promise.resolve(patient)
            : Promise.reject(new NotFoundException('Patient not found')),
        ),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({
      status: 'ok',
      database: 'connected',
    });
  });

  it('/auth/me rejects a missing token', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('/auth/me rejects a malformed Bearer header', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Basic token')
      .expect(401);
  });

  it('/auth/me rejects an invalid JWT', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('/auth/me returns only safe identity data', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer user-token')
      .expect(200)
      .expect({
        id: userId,
        email: 'user@example.com',
        profile: null,
        roles: [],
      });
  });

  it('/auth/admin-test rejects a user without ADMIN', () => {
    return request(app.getHttpServer())
      .get('/auth/admin-test')
      .set('Authorization', 'Bearer user-token')
      .expect(403);
  });

  it('/auth/admin-test allows an ADMIN from the database', () => {
    return request(app.getHttpServer())
      .get('/auth/admin-test')
      .set('Authorization', 'Bearer admin-token')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('POST /users rejects a missing JWT', () => {
    return request(app.getHttpServer()).post('/users').send({}).expect(401);
  });

  it('POST /users rejects a non-admin', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer user-token')
      .send({
        email: 'doctor@example.com',
        firstName: 'Ana',
        lastName: 'Pérez',
        roles: ['DOCTOR'],
      })
      .expect(403);
  });

  it('POST /users rejects an invalid DTO and extra properties', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer admin-token')
      .send({ email: 'invalid', roles: ['UNKNOWN'], unexpected: true })
      .expect(400);
  });

  it('POST /users allows an ADMIN', () => {
    return request(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Bearer admin-token')
      .send({
        email: ' doctor@example.com ',
        firstName: ' Ana ',
        lastName: ' Pérez ',
        roles: ['DOCTOR'],
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            id: createdId,
            roles: ['DOCTOR'],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            temporaryPassword: expect.any(String),
          }),
        );
      });
  });

  it('GET /users rejects a non-admin', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer user-token')
      .expect(403);
  });

  it('GET /users returns users to an ADMIN', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer admin-token')
      .expect(200)
      .expect([createdUser]);
  });

  it('GET /users/:id rejects an invalid UUID', () => {
    return request(app.getHttpServer())
      .get('/users/not-a-uuid')
      .set('Authorization', 'Bearer admin-token')
      .expect(400);
  });

  it('GET /users/:id returns 404 for a missing user', () => {
    return request(app.getHttpServer())
      .get('/users/00000000-0000-4000-8000-000000000099')
      .set('Authorization', 'Bearer admin-token')
      .expect(404);
  });

  it('GET /users/:id returns an existing user', () => {
    return request(app.getHttpServer())
      .get(`/users/${createdId}`)
      .set('Authorization', 'Bearer admin-token')
      .expect(200)
      .expect(createdUser);
  });

  it('POST /patients requires JWT', () =>
    request(app.getHttpServer()).post('/patients').expect(401));
  it('POST /patients rejects TECHNICIAN', () =>
    request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', 'Bearer technician-token')
      .send(patient)
      .expect(403));
  it.each(['admin-token', 'doctor-token', 'nurse-token'])(
    'POST /patients allows clinical role %s',
    (token) =>
      request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          medicalRecordNumber: 'RN-2026-000001',
          firstName: 'Mateo',
          lastName: 'Perez',
          birthDate: '2026-08-20',
          birthTime: '03:15',
          sex: 'MALE',
          birthWeightGrams: 2450,
          gestationalAgeWeeks: 36,
          gestationalAgeDays: 4,
          bloodType: 'O_POSITIVE',
        })
        .expect(201),
  );
  it('POST /patients rejects invalid DTO', () =>
    request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', 'Bearer admin-token')
      .send({ gestationalAgeDays: 7 })
      .expect(400));
  it('GET /patients rejects TECHNICIAN', () =>
    request(app.getHttpServer())
      .get('/patients')
      .set('Authorization', 'Bearer technician-token')
      .expect(403));
  it('GET /patients returns list', () =>
    request(app.getHttpServer())
      .get('/patients')
      .set('Authorization', 'Bearer doctor-token')
      .expect(200)
      .expect([patient]));
  it('GET /patients/:id rejects invalid UUID', () =>
    request(app.getHttpServer())
      .get('/patients/bad')
      .set('Authorization', 'Bearer admin-token')
      .expect(400));
  it('GET /patients/:id returns 404', () =>
    request(app.getHttpServer())
      .get('/patients/00000000-0000-4000-8000-000000000099')
      .set('Authorization', 'Bearer nurse-token')
      .expect(404));
  it('GET /patients/:id returns patient', () =>
    request(app.getHttpServer())
      .get(`/patients/${patientId}`)
      .set('Authorization', 'Bearer nurse-token')
      .expect(200)
      .expect(patient));

  afterEach(async () => {
    await app.close();
  });
});
