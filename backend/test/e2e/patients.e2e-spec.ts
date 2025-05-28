import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module'; // Adjust path as necessary
import { CreatePatientDto } from '../../src/modules/patients/dto/create-patient.dto';
import { UpdatePatientDto } from '../../src/modules/patients/dto/update-patient.dto';
import { Role } from '../../src/modules/auth/enums/role.enum';

// --- Helper functions (can be moved to a shared test utility file) ---
function uniqueEmail() {
  return `test.clinician.${Date.now()}@example.com`;
}

async function registerAndLogin(app: INestApplication, role: Role = Role.Clinician) {
  const email = uniqueEmail();
  const password = 'Password123!';
  let registrationPayload: any = {
    email,
    password,
    fullName: 'Test User',
  };

  if (role === Role.Clinician) {
    registrationPayload = { ...registrationPayload, roles: [Role.Clinician] }; // Assuming registration DTO takes roles
  }
  // Add other role registrations if needed

  // Register Clinician
  await request(app.getHttpServer())
    .post('/auth/register') // Assuming a general register endpoint or a specific clinician one
    .send(registrationPayload)
    .expect(201);

  // Login
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(201);

  return loginResponse.body.accessToken;
}


describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let clinicianToken: string;
  let createdPatientId: string;

  const patientData: CreatePatientDto = {
    full_name: 'John Doe E2E', // Corrected field name
    dateOfBirth: '1990-01-15', // Optional in DTO, but good to test with
    gender: 'male',            // Optional in DTO, but good to test with
    // contactNumber: '1234567890', // Not in CreatePatientDto
    // email: `john.doe.e2e.${Date.now()}@example.com`, // Not in CreatePatientDto
    // organizationId: 'some-org-id', // This might be needed if your setup requires it
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register and login a clinician to perform patient operations
    clinicianToken = await registerAndLogin(app, Role.Clinician);
  });

  afterAll(async () => {
    // Clean up any created resources if necessary, e.g., delete the test patient
    // For now, just close the app
    await app.close();
  });

  // --- Test Cases ---

  it('POST /patients - should create a new patient', async () => {
    const response = await request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send(patientData)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.full_name).toEqual(patientData.full_name);
    expect(response.body.dateOfBirth).toEqual(patientData.dateOfBirth);
    expect(response.body.gender).toEqual(patientData.gender);
    // Add more assertions as needed based on the PatientResponseDto

    createdPatientId = response.body.id;
  });

  it('GET /patients - should retrieve a list of patients', async () => {
    const response = await request(app.getHttpServer())
      .get('/patients')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    // If you expect the created patient to be in the list:
    if (createdPatientId) {
      expect(response.body.some((patient: any) => patient.id === createdPatientId)).toBe(true);
    }
    // If pagination is implemented, you might expect an object like:
    // expect(response.body.data).toBeInstanceOf(Array);
    // expect(response.body.meta).toBeDefined();
    // expect(response.body.meta.itemCount).toBeGreaterThanOrEqual(1);
  });
  
  it('GET /patients/:id - should retrieve a specific patient by ID', async () => {
    expect(createdPatientId).toBeDefined(); // Ensure patient was created

    const response = await request(app.getHttpServer())
      .get(`/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toEqual(createdPatientId);
    expect(response.body.full_name).toEqual(patientData.full_name);
    // Add more assertions as needed
  });

  it('PATCH /patients/:id - should update an existing patient', async () => {
    expect(createdPatientId).toBeDefined();

    const updatePayload: UpdatePatientDto = {
      full_name: 'Jane Doe E2E Updated',
      gender: 'female',
    };

    const response = await request(app.getHttpServer())
      .patch(`/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send(updatePayload)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toEqual(createdPatientId);
    expect(response.body.full_name).toEqual(updatePayload.full_name);
    expect(response.body.gender).toEqual(updatePayload.gender);
    // Verify other fields remain unchanged or are updated as expected
  });

  it('DELETE /patients/:id - should delete a patient', async () => {
    expect(createdPatientId).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(204); // Or 200 if your API returns the deleted object

    // Optionally, verify it's gone
    await request(app.getHttpServer())
      .get(`/patients/${createdPatientId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(404);
  });

});
