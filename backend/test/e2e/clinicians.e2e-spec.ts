import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { Role } from '../../src/modules/auth/enums/role.enum';

// --- Helper functions ---
function uniqueEmail() {
  return `test+${Date.now()}@example.com`;
}

async function registerAndLoginClinician(app: INestApplication, email = uniqueEmail(), password = 'Test123!', fullName = 'Test Clinician', roles: Role[] = [Role.Clinician]) {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, fullName, roles })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return res.body.accessToken;
}

async function createClinician(app: INestApplication, token: string, email = uniqueEmail(), fullName = 'New Clinician', roles: Role[] = [Role.Clinician]) {
  const res = await request(app.getHttpServer())
    .post('/clinicians')
    .set('Authorization', `Bearer ${token}`)
    .send({ email, fullName, roles })
    .expect(201);
  return res.body.clinician_id;
}

// --- E2E Tests ---
describe('Clinicians (e2e, with auth & fixtures)', () => {
  let app: INestApplication;
  let adminToken: string;
  let clinicianToken: string;
  let createdClinicianId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    adminToken = await registerAndLoginClinician(app, uniqueEmail(), 'Admin123!', 'Admin User', [Role.Admin]);
    clinicianToken = await registerAndLoginClinician(app, uniqueEmail(), 'Clinician123!', 'Regular Clinician', [Role.Clinician]);
  });

  it('/clinicians (POST) should create a clinician (Admin only)', async () => {
    const email = uniqueEmail();
    const res = await request(app.getHttpServer())
      .post('/clinicians')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email, fullName: 'New Clinician', roles: [Role.Clinician] })
      .expect(201);
    expect(res.body.email).toBe(email);
    expect(res.body.fullName).toBe('New Clinician');
    createdClinicianId = res.body.clinician_id;

    // Clinician should not be able to create
    await request(app.getHttpServer())
      .post('/clinicians')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ email: uniqueEmail(), fullName: 'Unauthorized Clinician', roles: [Role.Clinician] })
      .expect(403);
  });

  it('/clinicians (GET) should list clinicians (Admin only)', async () => {
    const res = await request(app.getHttpServer())
      .get('/clinicians')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Clinician should not be able to list all
    await request(app.getHttpServer())
      .get('/clinicians')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });

  it('/clinicians/me (GET) should return the authenticated clinician', async () => {
    const res = await request(app.getHttpServer())
      .get('/clinicians/me')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);
    expect(res.body.email).toBeDefined(); // Assuming email is part of the returned clinician object
  });

  it('/clinicians/:id (GET) should return a clinician by ID (Admin only)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/clinicians/${createdClinicianId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.clinician_id).toBe(createdClinicianId);

    // Clinician should not be able to get other clinicians by ID
    await request(app.getHttpServer())
      .get(`/clinicians/${createdClinicianId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });

  it('/clinicians/:id (GET) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .get('/clinicians/xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }))
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('/clinicians/:id (PATCH) should update a clinician (Admin only)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/clinicians/${createdClinicianId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Updated Clinician Name' })
      .expect(200);
    expect(res.body.fullName).toBe('Updated Clinician Name');

    // Clinician should not be able to update other clinicians
    await request(app.getHttpServer())
      .patch(`/clinicians/${createdClinicianId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ fullName: 'Attempted Update' })
      .expect(403);
  });

  it('/clinicians/:id (PATCH) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .patch('/clinicians/xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }))
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Nope' })
      .expect(404);
  });

  it('/clinicians/:id (DELETE) should delete a clinician (Admin only)', async () => {
    const tempClinicianId = await createClinician(app, adminToken, uniqueEmail(), 'Temp Clinician');
    await request(app.getHttpServer())
      .delete(`/clinicians/${tempClinicianId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // Confirm deleted
    await request(app.getHttpServer())
      .get(`/clinicians/${tempClinicianId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    // Clinician should not be able to delete
    const anotherTempClinicianId = await createClinician(app, adminToken, uniqueEmail(), 'Another Temp Clinician');
    await request(app.getHttpServer())
      .delete(`/clinicians/${anotherTempClinicianId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });

  it('/clinicians/:id (DELETE) should return 404 for not found', async () => {
    await request(app.getHttpServer())
      .delete('/clinicians/xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }))
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  afterAll(async () => {
    // Clean up the created clinician if it still exists
    if (createdClinicianId) {
      try {
        await request(app.getHttpServer())
          .delete(`/clinicians/${createdClinicianId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      } catch (error) {
        // Ignore if already deleted or not found
      }
    }
    await app.close();
  });
});
