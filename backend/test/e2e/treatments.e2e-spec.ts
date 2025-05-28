import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

// --- Helper functions ---
function uniqueEmail() {
  return `test+${Date.now()}@example.com`;
}

async function registerAndLoginClinician(app: INestApplication, email = uniqueEmail(), password = 'Test123!') {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, fullName: 'Test Clinician' })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return res.body.accessToken;
}

async function createPatient(app: INestApplication, token: string) {
  const res = await request(app.getHttpServer())
    .post('/patients')
    .set('Authorization', `Bearer ${token}`)
    .send({ fullName: 'Test Patient', dateOfBirth: '1990-01-01', gender: 'other' })
    .expect(201);
  return res.body.patient_id || res.body.id;
}

async function createTreatmentType(app: INestApplication, token: string) {
  const res = await request(app.getHttpServer())
    .post('/treatment-types')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'E2EType', description: 'desc' })
    .expect(201);
  return res.body.id;
}

// --- E2E Tests ---
describe('Treatments (e2e, with auth & fixtures)', () => {
  let app: INestApplication;
  let token: string;
  let patientId: string;
  let treatmentTypeId: string;
  let createdRecordId: string;
  let anotherRecordId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    token = await registerAndLoginClinician(app);
    patientId = await createPatient(app, token);
    treatmentTypeId = await createTreatmentType(app, token);
  });

  it('/treatment-records (POST) should create a treatment record', async () => {
    const res = await request(app.getHttpServer())
      .post('/treatment-records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: new Date().toISOString(),
        notes: 'Test record',
        totalPrice: 100,
        currency: 'USD',
        patientId,
        treatmentTypeId,
      })
      .expect(201);
    expect(res.body.notes).toBe('Test record');
    expect(res.body.patientId).toBe(patientId);
    expect(res.body.treatmentTypeId).toBe(treatmentTypeId);
    createdRecordId = res.body.id;
  });

  it('/treatment-types/:id (GET) should return a treatment type by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/treatment-types/${treatmentTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.id).toBe(treatmentTypeId);
  });

  it('/treatment-types/:id (GET) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .get('/treatment-types/doesnotexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/treatment-types/:id (PATCH) should update a treatment type', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/treatment-types/${treatmentTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2ETypeUpdated' })
      .expect(200);
    expect(res.body.name).toBe('E2ETypeUpdated');
  });

  it('/treatment-types/:id (PATCH) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .patch('/treatment-types/doesnotexist')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nope' })
      .expect(404);
  });

  it('/treatment-types/:id (DELETE) should deactivate a treatment type', async () => {
    // Create a new type to delete
    const tempTypeId = await createTreatmentType(app, token);
    await request(app.getHttpServer())
      .delete(`/treatment-types/${tempTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    // Confirm deactivated
    await request(app.getHttpServer())
      .get(`/treatment-types/${tempTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/treatment-types/:id (DELETE) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .delete('/treatment-types/doesnotexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/treatment-records (GET) should list treatment records', async () => {
    const res = await request(app.getHttpServer())
      .get('/treatment-records')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/treatment-records (GET) with filter should return filtered records', async () => {
    const res = await request(app.getHttpServer())
      .get(`/treatment-records?patientId=${patientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((rec: any) => expect(rec.patientId).toBe(patientId));
  });

  it('/treatment-records/:id (GET) should return a treatment record by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/treatment-records/${createdRecordId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.id).toBe(createdRecordId);
  });

  it('/treatment-records/:id (GET) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .get('/treatment-records/doesnotexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/treatment-records/:id (PATCH) should update a treatment record', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/treatment-records/${createdRecordId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'Updated note' })
      .expect(200);
    expect(res.body.notes).toBe('Updated note');
  });

  it('/treatment-records/:id (PATCH) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .patch('/treatment-records/doesnotexist')
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'Nope' })
      .expect(404);
  });

  it('/treatment-records/:id (DELETE) should delete a treatment record', async () => {
    // Create another record to delete
    const res = await request(app.getHttpServer())
      .post('/treatment-records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: new Date().toISOString(),
        notes: 'To be deleted',
        totalPrice: 50,
        currency: 'USD',
        patientId,
        treatmentTypeId,
      })
      .expect(201);
    anotherRecordId = res.body.id;
    await request(app.getHttpServer())
      .delete(`/treatment-records/${anotherRecordId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    // Confirm deleted
    await request(app.getHttpServer())
      .get(`/treatment-records/${anotherRecordId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/treatment-records/:id (DELETE) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .delete('/treatment-records/doesnotexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  afterAll(async () => {
    // Optionally clean up test data here using DELETE endpoints if available
    if (createdRecordId) {
      await request(app.getHttpServer())
        .delete(`/treatment-records/${createdRecordId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    }
    if (anotherRecordId) {
      await request(app.getHttpServer())
        .delete(`/treatment-records/${anotherRecordId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    }
    await app.close();
  });
}); 