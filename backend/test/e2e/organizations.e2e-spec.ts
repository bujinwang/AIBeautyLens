import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { Role } from '../../src/modules/auth/enums/role.enum';
import { CreateOrganizationDto } from '../../src/modules/organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../../src/modules/organizations/dto/update-organization.dto';

// --- Helper functions ---
function uniqueEmail() {
  return `test+${Date.now()}@example.com`;
}

async function registerAndLogin(app: INestApplication, email = uniqueEmail(), password = 'Test123!', fullName = 'Test User', roles: Role[] = [Role.Clinician]) {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, fullName, roles })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return { accessToken: res.body.accessToken, userId: res.body.userId };
}

async function createOrganization(app: INestApplication, token: string, name: string) {
  const res = await request(app.getHttpServer())
    .post('/organizations')
    .set('Authorization', `Bearer ${token}`)
    .send({ name })
    .expect(201);
  return res.body.id;
}

// --- E2E Tests ---
describe('OrganizationsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let clinicianToken: string;
  let createdOrganizationId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const adminAuth = await registerAndLogin(app, uniqueEmail(), 'Admin123!', 'Admin User', [Role.Admin]);
    adminToken = adminAuth.accessToken;

    const clinicianAuth = await registerAndLogin(app, uniqueEmail(), 'Clinician123!', 'Regular Clinician', [Role.Clinician]);
    clinicianToken = clinicianAuth.accessToken;
  });

  afterAll(async () => {
    // Clean up created organization if it exists
    if (createdOrganizationId) {
      await request(app.getHttpServer())
        .delete(`/organizations/${createdOrganizationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    }
    await app.close();
  });

  it('POST /organizations - should create a new organization (Admin only)', async () => {
    const createOrganizationDto: CreateOrganizationDto = {
      name: `Test Org ${Date.now()}`,
    };
    const res = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createOrganizationDto)
      .expect(201);

    expect(res.body).toBeDefined();
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toEqual(createOrganizationDto.name);
    createdOrganizationId = res.body.id;

    // Clinician should not be able to create an organization
    await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ name: 'Unauthorized Org' })
      .expect(403);
  });

  it('GET /organizations - should retrieve a list of organizations (Admin only)', async () => {
    const res = await request(app.getHttpServer())
      .get('/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some((org: any) => org.id === createdOrganizationId)).toBe(true);

    // Clinician should not be able to retrieve organizations
    await request(app.getHttpServer())
      .get('/organizations')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });
  
  it('GET /organizations/:id - should retrieve a specific organization by ID (Admin only)', async () => {
    expect(createdOrganizationId).toBeDefined();

    const res = await request(app.getHttpServer())
      .get(`/organizations/${createdOrganizationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body.id).toEqual(createdOrganizationId);
    expect(res.body.name).toEqual(`Test Org ${createdOrganizationId.split('-')[0]}`); // Assuming name is derived from initial creation

    // Clinician should not be able to retrieve a specific organization
    await request(app.getHttpServer())
      .get(`/organizations/${createdOrganizationId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });

  it('PATCH /organizations/:id - should update an existing organization (Admin only)', async () => {
    expect(createdOrganizationId).toBeDefined();
    const updateOrganizationDto: UpdateOrganizationDto = {
      name: `Updated Org ${Date.now()}`,
    };

    const res = await request(app.getHttpServer())
      .patch(`/organizations/${createdOrganizationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateOrganizationDto)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body.id).toEqual(createdOrganizationId);
    expect(res.body.name).toEqual(updateOrganizationDto.name);

    // Clinician should not be able to update an organization
    await request(app.getHttpServer())
      .patch(`/organizations/${createdOrganizationId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ name: 'Unauthorized Update' })
      .expect(403);
  });

  it('DELETE /organizations/:id - should delete an organization (Admin only)', async () => {
    const tempOrgId = await createOrganization(app, adminToken, `Temp Org ${Date.now()}`);
    await request(app.getHttpServer())
      .delete(`/organizations/${tempOrgId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // Confirm deletion
    await request(app.getHttpServer())
      .get(`/organizations/${tempOrgId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    // Clinician should not be able to delete an organization
    const anotherTempOrgId = await createOrganization(app, adminToken, `Another Temp Org ${Date.now()}`);
    await request(app.getHttpServer())
      .delete(`/organizations/${anotherTempOrgId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });
});
