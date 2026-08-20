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
import { GuardiansService } from './../src/guardians/guardians.service';
import { IncubatorsService } from './../src/incubators/incubators.service';
import { AdmissionsService } from './../src/admissions/admissions.service';
import { DevicesService } from './../src/devices/devices.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const adminId = '00000000-0000-4000-8000-000000000001';
  const userId = '00000000-0000-4000-8000-000000000002';
  const createdId = '00000000-0000-4000-8000-000000000003';
  const technicianId = '00000000-0000-4000-8000-000000000004';
  const doctorId = '00000000-0000-4000-8000-000000000005';
  const nurseId = '00000000-0000-4000-8000-000000000006';
  const patientId = '00000000-0000-4000-8000-000000000007';
  const guardianId = '00000000-0000-4000-8000-000000000008';
  const incubatorId = '00000000-0000-4000-8000-000000000009';
  const incubator = {
    id: incubatorId,
    code: 'INC-001',
    name: 'Incubadora Neonatal 1',
    location: 'UCIN - Sala 1',
    serialNumber: 'SN-001',
    manufacturer: 'Prototype Lab',
    model: 'V2',
    status: 'AVAILABLE',
    notes: null,
  };
  const guardian = {
    id: guardianId,
    firstName: 'Maria',
    lastName: 'Perez',
    documentNumber: null,
    phone: '+59170000000',
    email: 'maria@example.com',
    address: null,
  };
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
  const admissionId = '00000000-0000-4000-8000-000000000010';
  const deviceId = '00000000-0000-4000-8000-000000000011';
  const device = {
    id: deviceId,
    hardwareUid: 'A4-C1-38-01',
    code: 'ESP32-001',
    deviceType: 'ESP32',
    incubatorId,
    status: 'ACTIVE',
    firmwareVersion: '1.0.0',
    lastSeenAt: null,
    notes: null,
    incubator: {
      id: incubatorId,
      code: incubator.code,
      name: incubator.name,
      location: incubator.location,
      status: incubator.status,
    },
  };
  const admission = {
    id: admissionId,
    patientId,
    incubatorId,
    admittedAt: '2026-08-20T18:30:00.000Z',
    dischargedAt: null,
    status: 'ACTIVE',
    notes: null,
    patient: {
      id: patientId,
      medicalRecordNumber: patient.medicalRecordNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
    },
    incubator: {
      id: incubatorId,
      code: incubator.code,
      name: incubator.name,
      location: incubator.location,
      status: 'IN_USE',
    },
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
      .overrideProvider(GuardiansService)
      .useValue({
        create: jest.fn().mockResolvedValue(guardian),
        findAll: jest.fn().mockResolvedValue([guardian]),
        findOne: jest.fn((id: string) =>
          id === guardianId
            ? Promise.resolve(guardian)
            : Promise.reject(new NotFoundException('Guardian not found')),
        ),
        findForPatient: jest
          .fn()
          .mockResolvedValue([
            { ...guardian, relationship: 'MOTHER', isPrimaryContact: true },
          ]),
        link: jest.fn().mockResolvedValue({
          patientId,
          guardianId,
          relationship: 'MOTHER',
          isPrimaryContact: true,
          guardian,
        }),
        createAndLink: jest.fn().mockResolvedValue({
          ...guardian,
          relationship: 'MOTHER',
          isPrimaryContact: true,
        }),
        unlink: jest.fn((_: string, id: string) =>
          id === guardianId
            ? Promise.resolve({ status: 'ok' })
            : Promise.reject(new NotFoundException('Relationship not found')),
        ),
      })
      .overrideProvider(IncubatorsService)
      .useValue({
        create: jest.fn().mockResolvedValue(incubator),
        findAll: jest.fn().mockResolvedValue([incubator]),
        findOne: jest.fn((id: string) =>
          id === incubatorId
            ? Promise.resolve(incubator)
            : Promise.reject(new NotFoundException('Incubator not found')),
        ),
      })
      .overrideProvider(AdmissionsService)
      .useValue({
        create: jest.fn().mockResolvedValue(admission),
        findAll: jest.fn().mockResolvedValue([admission]),
        findOne: jest.fn((id: string) =>
          id === admissionId
            ? Promise.resolve(admission)
            : Promise.reject(new NotFoundException('Admission not found')),
        ),
        findForPatient: jest.fn().mockResolvedValue([admission]),
        findForIncubator: jest.fn().mockResolvedValue([admission]),
        activeForPatient: jest.fn().mockResolvedValue(admission),
        activeForIncubator: jest.fn().mockResolvedValue(admission),
        discharge: jest.fn().mockResolvedValue({
          ...admission,
          status: 'DISCHARGED',
          dischargedAt: '2026-08-20T22:15:00.000Z',
        }),
      })
      .overrideProvider(DevicesService)
      .useValue({
        create: jest.fn().mockResolvedValue(device),
        findAll: jest.fn().mockResolvedValue([device]),
        findOne: jest.fn((id: string) =>
          id === deviceId
            ? Promise.resolve(device)
            : Promise.reject(new NotFoundException('Device not found')),
        ),
        findForIncubator: jest.fn().mockResolvedValue([device]),
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

  it('POST /guardians requires JWT', () =>
    request(app.getHttpServer()).post('/guardians').expect(401));
  it('GET /guardians rejects TECHNICIAN', () =>
    request(app.getHttpServer())
      .get('/guardians')
      .set('Authorization', 'Bearer technician-token')
      .expect(403));
  it('POST /guardians validates DTO', () =>
    request(app.getHttpServer())
      .post('/guardians')
      .set('Authorization', 'Bearer admin-token')
      .send({ email: 'bad' })
      .expect(400));
  it('POST /guardians creates guardian', () =>
    request(app.getHttpServer())
      .post('/guardians')
      .set('Authorization', 'Bearer nurse-token')
      .send({
        firstName: 'Maria',
        lastName: 'Perez',
        email: 'MARIA@example.com',
      })
      .expect(201)
      .expect(guardian));
  it('GET /guardians lists guardians', () =>
    request(app.getHttpServer())
      .get('/guardians')
      .set('Authorization', 'Bearer doctor-token')
      .expect(200)
      .expect([guardian]));
  it('GET /guardians/:id returns 404', () =>
    request(app.getHttpServer())
      .get('/guardians/00000000-0000-4000-8000-000000000099')
      .set('Authorization', 'Bearer admin-token')
      .expect(404));
  it('POST relation validates relationship', () =>
    request(app.getHttpServer())
      .post(`/patients/${patientId}/guardians`)
      .set('Authorization', 'Bearer admin-token')
      .send({ guardianId, relationship: 'INVALID', isPrimaryContact: true })
      .expect(400));
  it('POST relation links guardian', () =>
    request(app.getHttpServer())
      .post(`/patients/${patientId}/guardians`)
      .set('Authorization', 'Bearer doctor-token')
      .send({ guardianId, relationship: 'MOTHER', isPrimaryContact: true })
      .expect(201));
  it('GET patient guardians lists links', () =>
    request(app.getHttpServer())
      .get(`/patients/${patientId}/guardians`)
      .set('Authorization', 'Bearer nurse-token')
      .expect(200));
  it('DELETE relation unlinks only relationship', () =>
    request(app.getHttpServer())
      .delete(`/patients/${patientId}/guardians/${guardianId}`)
      .set('Authorization', 'Bearer admin-token')
      .expect(200)
      .expect({ status: 'ok' }));

  const incubatorInput = {
    code: ' inc-001 ',
    name: 'Incubadora Neonatal 1',
    location: 'UCIN - Sala 1',
    serialNumber: 'SN-001',
    manufacturer: 'Prototype Lab',
    model: 'V2',
    notes: 'Pruebas',
  };
  it('POST /incubators requires JWT', () =>
    request(app.getHttpServer())
      .post('/incubators')
      .send(incubatorInput)
      .expect(401));
  it.each(['doctor-token', 'nurse-token'])(
    'POST /incubators rejects %s',
    (token) =>
      request(app.getHttpServer())
        .post('/incubators')
        .set('Authorization', `Bearer ${token}`)
        .send(incubatorInput)
        .expect(403),
  );
  it.each(['admin-token', 'technician-token'])(
    'POST /incubators allows %s',
    (token) =>
      request(app.getHttpServer())
        .post('/incubators')
        .set('Authorization', `Bearer ${token}`)
        .send(incubatorInput)
        .expect(201)
        .expect(incubator),
  );
  it('POST /incubators rejects invalid DTO', () =>
    request(app.getHttpServer())
      .post('/incubators')
      .set('Authorization', 'Bearer admin-token')
      .send({ code: '', name: '', location: '' })
      .expect(400));
  it('POST /incubators rejects client status', () =>
    request(app.getHttpServer())
      .post('/incubators')
      .set('Authorization', 'Bearer admin-token')
      .send({ ...incubatorInput, status: 'IN_USE' })
      .expect(400));
  it.each(['admin-token', 'doctor-token', 'nurse-token', 'technician-token'])(
    'GET /incubators allows %s',
    (token) =>
      request(app.getHttpServer())
        .get('/incubators')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect([incubator]),
  );
  it('GET /incubators/:id rejects invalid UUID', () =>
    request(app.getHttpServer())
      .get('/incubators/bad')
      .set('Authorization', 'Bearer technician-token')
      .expect(400));
  it('GET /incubators/:id returns 404', () =>
    request(app.getHttpServer())
      .get('/incubators/00000000-0000-4000-8000-000000000099')
      .set('Authorization', 'Bearer doctor-token')
      .expect(404));
  it('GET /incubators/:id returns incubator', () =>
    request(app.getHttpServer())
      .get(`/incubators/${incubatorId}`)
      .set('Authorization', 'Bearer nurse-token')
      .expect(200)
      .expect(incubator));

  const admissionInput = {
    patientId,
    incubatorId,
    admittedAt: '2026-08-20T14:30:00-04:00',
    notes: 'Ingreso inicial',
  };
  it('POST /admissions requires JWT', () =>
    request(app.getHttpServer())
      .post('/admissions')
      .send(admissionInput)
      .expect(401));
  it('POST /admissions rejects TECHNICIAN', () =>
    request(app.getHttpServer())
      .post('/admissions')
      .set('Authorization', 'Bearer technician-token')
      .send(admissionInput)
      .expect(403));
  it.each(['admin-token', 'doctor-token', 'nurse-token'])(
    'POST /admissions allows %s',
    (token) =>
      request(app.getHttpServer())
        .post('/admissions')
        .set('Authorization', `Bearer ${token}`)
        .send(admissionInput)
        .expect(201),
  );
  it('POST /admissions validates DTO and forbids status', () =>
    request(app.getHttpServer())
      .post('/admissions')
      .set('Authorization', 'Bearer admin-token')
      .send({ ...admissionInput, status: 'ACTIVE' })
      .expect(400));
  it('GET /admissions lists history', () =>
    request(app.getHttpServer())
      .get('/admissions?status=ACTIVE')
      .set('Authorization', 'Bearer doctor-token')
      .expect(200)
      .expect([admission]));
  it('GET /admissions rejects TECHNICIAN', () =>
    request(app.getHttpServer())
      .get('/admissions')
      .set('Authorization', 'Bearer technician-token')
      .expect(403));
  it('GET /admissions/:id validates UUID', () =>
    request(app.getHttpServer())
      .get('/admissions/bad')
      .set('Authorization', 'Bearer nurse-token')
      .expect(400));
  it('GET /admissions/:id returns 404', () =>
    request(app.getHttpServer())
      .get('/admissions/00000000-0000-4000-8000-000000000099')
      .set('Authorization', 'Bearer nurse-token')
      .expect(404));
  it('GET patient admission history', () =>
    request(app.getHttpServer())
      .get(`/patients/${patientId}/admissions`)
      .set('Authorization', 'Bearer admin-token')
      .expect(200)
      .expect([admission]));
  it('GET incubator admission history', () =>
    request(app.getHttpServer())
      .get(`/incubators/${incubatorId}/admissions`)
      .set('Authorization', 'Bearer doctor-token')
      .expect(200)
      .expect([admission]));
  it('GET patient active admission', () =>
    request(app.getHttpServer())
      .get(`/patients/${patientId}/active-admission`)
      .set('Authorization', 'Bearer nurse-token')
      .expect(200)
      .expect(admission));
  it('GET incubator active admission', () =>
    request(app.getHttpServer())
      .get(`/incubators/${incubatorId}/active-admission`)
      .set('Authorization', 'Bearer admin-token')
      .expect(200)
      .expect(admission));
  it('POST discharge rejects ACTIVE final status', () =>
    request(app.getHttpServer())
      .post(`/admissions/${admissionId}/discharge`)
      .set('Authorization', 'Bearer admin-token')
      .send({ dischargedAt: '2026-08-20T18:15:00-04:00', status: 'ACTIVE' })
      .expect(400));
  it('POST discharge closes admission', () =>
    request(app.getHttpServer())
      .post(`/admissions/${admissionId}/discharge`)
      .set('Authorization', 'Bearer doctor-token')
      .send({ dischargedAt: '2026-08-20T18:15:00-04:00', status: 'DISCHARGED' })
      .expect(201));

  const deviceInput = {
    hardwareUid: 'A4-C1-38-01',
    code: 'ESP32-001',
    deviceType: 'ESP32',
    incubatorId,
    firmwareVersion: '1.0.0',
  };
  it('POST /devices requires JWT', () =>
    request(app.getHttpServer())
      .post('/devices')
      .send(deviceInput)
      .expect(401));
  it.each(['doctor-token', 'nurse-token'])(
    'POST /devices rejects %s',
    (token) =>
      request(app.getHttpServer())
        .post('/devices')
        .set('Authorization', `Bearer ${token}`)
        .send(deviceInput)
        .expect(403),
  );
  it.each(['admin-token', 'technician-token'])(
    'POST /devices allows %s',
    (token) =>
      request(app.getHttpServer())
        .post('/devices')
        .set('Authorization', `Bearer ${token}`)
        .send(deviceInput)
        .expect(201)
        .expect(device),
  );
  it('POST /devices rejects status', () =>
    request(app.getHttpServer())
      .post('/devices')
      .set('Authorization', 'Bearer admin-token')
      .send({ ...deviceInput, status: 'ACTIVE' })
      .expect(400));
  it('POST /devices rejects lastSeenAt', () =>
    request(app.getHttpServer())
      .post('/devices')
      .set('Authorization', 'Bearer technician-token')
      .send({ ...deviceInput, lastSeenAt: new Date().toISOString() })
      .expect(400));
  it.each(['admin-token', 'doctor-token', 'nurse-token', 'technician-token'])(
    'GET /devices allows %s',
    (token) =>
      request(app.getHttpServer())
        .get('/devices?deviceType=ESP32')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect([device]),
  );
  it('GET /devices validates UUID', () =>
    request(app.getHttpServer())
      .get('/devices/bad')
      .set('Authorization', 'Bearer admin-token')
      .expect(400));
  it('GET /devices returns 404', () =>
    request(app.getHttpServer())
      .get('/devices/00000000-0000-4000-8000-000000000099')
      .set('Authorization', 'Bearer nurse-token')
      .expect(404));
  it('GET /devices detail', () =>
    request(app.getHttpServer())
      .get(`/devices/${deviceId}`)
      .set('Authorization', 'Bearer doctor-token')
      .expect(200)
      .expect(device));
  it('GET incubator devices', () =>
    request(app.getHttpServer())
      .get(`/incubators/${incubatorId}/devices`)
      .set('Authorization', 'Bearer technician-token')
      .expect(200)
      .expect([device]));

  afterEach(async () => {
    await app.close();
  });
});
