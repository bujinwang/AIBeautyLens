import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { Role } from '../../src/modules/auth/enums/role.enum';
import { CreateClinicianPatientAssignmentDto } from '../../src/modules/clinician-patient-assignments/dto/create-clinician-patient-assignment.dto';

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

async function createPatient(app: INestApplication, token: string, fullName = 'Test Patient') {
  const res = await request(app.getHttpServer())
    .post('/patients')
    .set('Authorization', `Bearer ${token}`)
    .send({ full_name: fullName, dateOfBirth: '1990-01-01', gender: 'other' })
    .expect(201);
  return res.body.id;
}

async function createAssignment(app: INestApplication, token: string, clinicianId: string, patientId: string) {
  const createAssignmentDto: CreateClinicianPatientAssignmentDto = {
    clinician_id: clinicianId,
    patient_id: patientId,
    assignment_date: new Date().toISOString(),
    status: 'active',
  };
  const res = await request(app.getHttpServer())
    .post('/clinician-patient-assignments')
    .set('Authorization', `Bearer ${token}`)
    .send(createAssignmentDto)
    .expect(201);
  return res.body.assignment_id;
}

// --- E2E Tests ---
describe('ClinicianPatientAssignmentsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminId: string;
  let clinicianToken: string;
  let clinicianId: string;
  let otherClinicianToken: string;
  let otherClinicianId: string;
  let patientId: string;
  let otherPatientId: string;
  let createdAssignmentId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const adminAuth = await registerAndLogin(app, uniqueEmail(), 'Admin123!', 'Admin User', [Role.Admin]);
    adminToken = adminAuth.accessToken;
    adminId = adminAuth.userId;

    const clinicianAuth = await registerAndLogin(app, uniqueEmail(), 'Clinician123!', 'Regular Clinician', [Role.Clinician]);
    clinicianToken = clinicianAuth.accessToken;
    clinicianId = clinicianAuth.userId;

    const otherClinicianAuth = await registerAndLogin(app, uniqueEmail(), 'OtherClinician123!', 'Other Clinician', [Role.Clinician]);
    otherClinicianToken = otherClinicianAuth.accessToken;
    otherClinicianId = otherClinicianAuth.userId;

    patientId = await createPatient(app, clinicianToken);
    otherPatientId = await createPatient(app, otherClinicianToken);
  });

  afterAll(async () => {
    // Clean up created assignment if it exists
    if (createdAssignmentId) {
      await request(app.getHttpServer())
        .delete(`/clinician-patient-assignments/${createdAssignmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    }
    // Clean up patients (assuming admin can delete any patient)
    if (patientId) {
      await request(app.getHttpServer())
        .delete(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    }
    if (otherPatientId) {
      await request(app.getHttpServer())
        .delete(`/patients/${otherPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    }
    await app.close();
  });

  it('POST /clinician-patient-assignments - should create a new assignment (Admin or self-clinician)', async () => {
    // Admin creates an assignment for any clinician
    const resAdmin = await request(app.getHttpServer())
      .post('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clinician_id: clinicianId, patient_id: patientId, assignment_date: new Date().toISOString(), status: 'active' })
      .expect(201);
    expect(resAdmin.body.clinician_id).toBe(clinicianId);
    expect(resAdmin.body.patient_id).toBe(patientId);
    createdAssignmentId = resAdmin.body.assignment_id;

    // Clinician creates an assignment for themselves
    const resClinician = await request(app.getHttpServer())
      .post('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ clinician_id: clinicianId, patient_id: otherPatientId, assignment_date: new Date().toISOString(), status: 'active' })
      .expect(201);
    expect(resClinician.body.clinician_id).toBe(clinicianId);
    expect(resClinician.body.patient_id).toBe(otherPatientId);

    // Clinician tries to create an assignment for another clinician (should fail)
    await request(app.getHttpServer())
      .post('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ clinician_id: otherClinicianId, patient_id: patientId, assignment_date: new Date().toISOString(), status: 'active' })
      .expect(403);
  });

  it('GET /clinician-patient-assignments - should list assignments (Admin sees all, Clinician sees own)', async () => {
    // Admin sees all assignments
    const resAdmin = await request(app.getHttpServer())
      .get('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(resAdmin.body)).toBe(true);
    expect(resAdmin.body.length).toBeGreaterThanOrEqual(2); // At least the two created above

    // Clinician sees only their own assignments
    const resClinician = await request(app.getHttpServer())
      .get('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);
    expect(Array.isArray(resClinician.body)).toBe(true);
    resClinician.body.forEach((assignment: any) => {
      expect(assignment.clinician_id).toBe(clinicianId);
    });
  });

  it('GET /clinician-patient-assignments/clinician/:clinicianId - should list assignments for a specific clinician', async () => {
    // Admin can view any clinician's assignments
    const resAdmin = await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/clinician/${clinicianId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(resAdmin.body)).toBe(true);
    resAdmin.body.forEach((assignment: any) => {
      expect(assignment.clinician_id).toBe(clinicianId);
    });

    // Clinician can view their own assignments
    const resClinician = await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/clinician/${clinicianId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);
    expect(Array.isArray(resClinician.body)).toBe(true);
    resClinician.body.forEach((assignment: any) => {
      expect(assignment.clinician_id).toBe(clinicianId);
    });

    // Clinician cannot view another clinician's assignments
    await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/clinician/${otherClinicianId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });

  it('GET /clinician-patient-assignments/patient/:patientId - should list assignments for a specific patient', async () => {
    // Admin can view any patient's assignments
    const resAdmin = await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/patient/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(resAdmin.body)).toBe(true);
    resAdmin.body.forEach((assignment: any) => {
      expect(assignment.patient_id).toBe(patientId);
    });

    // Clinician can view assignments for a patient they are assigned to
    const resClinician = await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/patient/${patientId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);
    expect(Array.isArray(resClinician.body)).toBe(true);
    expect(resClinician.body.some((a: any) => a.clinician_id === clinicianId)).toBe(true);

    // Clinician cannot view assignments for a patient they are NOT assigned to
    await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/patient/${otherPatientId}`)
      .set('Authorization', `Bearer ${otherClinicianToken}`) // otherClinician is assigned to otherPatientId
      .expect(200); // This should pass as otherClinician is assigned to otherPatientId

    await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/patient/${patientId}`) // patientId is assigned to clinicianId
      .set('Authorization', `Bearer ${otherClinicianToken}`) // otherClinician is NOT assigned to patientId
      .expect(403);
  });

  it('GET /clinician-patient-assignments/:assignmentId - should return a specific assignment', async () => {
    // Admin can view any assignment
    const resAdmin = await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/${createdAssignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(resAdmin.body.assignment_id).toBe(createdAssignmentId);

    // Clinician can view their own assignment
    const clinicianAssignmentId = await createAssignment(app, clinicianToken, clinicianId, uniqueEmail()); // Create one for clinician
    const resClinician = await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/${clinicianAssignmentId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(200);
    expect(resClinician.body.assignment_id).toBe(clinicianAssignmentId);

    // Clinician cannot view another clinician's assignment
    await request(app.getHttpServer())
      .get(`/clinician-patient-assignments/${createdAssignmentId}`) // created by admin for clinicianId
      .set('Authorization', `Bearer ${otherClinicianToken}`)
      .expect(403);
  });

  it('PATCH /clinician-patient-assignments/:assignmentId - should update an assignment (Admin or self-clinician)', async () => {
    // Admin updates any assignment
    const updateData = { status: 'inactive' };
    const resAdmin = await request(app.getHttpServer())
      .patch(`/clinician-patient-assignments/${createdAssignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);
    expect(resAdmin.body.status).toBe('inactive');

    // Clinician updates their own assignment
    const clinicianAssignmentId = await createAssignment(app, clinicianToken, clinicianId, uniqueEmail());
    const updateDataClinician = { notes: 'Updated by clinician' };
    const resClinician = await request(app.getHttpServer())
      .patch(`/clinician-patient-assignments/${clinicianAssignmentId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send(updateDataClinician)
      .expect(200);
    expect(resClinician.body.notes).toBe('Updated by clinician');

    // Clinician tries to update another clinician's assignment (should fail)
    await request(app.getHttpServer())
      .patch(`/clinician-patient-assignments/${createdAssignmentId}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ status: 'pending' })
      .expect(403);
  });

  it('DELETE /clinician-patient-assignments/:assignmentId - should delete an assignment (Admin or self-clinician)', async () => {
    // Admin deletes any assignment
    const tempAssignmentIdAdmin = await createAssignment(app, adminToken, clinicianId, uniqueEmail());
    await request(app.getHttpServer())
      .delete(`/clinician-patient-assignments/${tempAssignmentIdAdmin}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // Clinician deletes their own assignment
    const tempAssignmentIdClinician = await createAssignment(app, clinicianToken, clinicianId, uniqueEmail());
    await request(app.getHttpServer())
      .delete(`/clinician-patient-assignments/${tempAssignmentIdClinician}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(204);

    // Clinician tries to delete another clinician's assignment (should fail)
    const tempAssignmentIdOther = await createAssignment(app, adminToken, otherClinicianId, uniqueEmail());
    await request(app.getHttpServer())
      .delete(`/clinician-patient-assignments/${tempAssignmentIdOther}`)
      .set('Authorization', `Bearer ${clinicianToken}`)
      .expect(403);
  });

  it('POST /clinician-patient-assignments - should not allow duplicate assignment', async () => {
    // Create assignment
    const tempAssignmentId = await createAssignment(app, clinicianToken, clinicianId, patientId);
    // Try to create duplicate
    await request(app.getHttpServer())
      .post('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${clinicianToken}`)
      .send({ clinician_id: clinicianId, patient_id: patientId, assignment_date: new Date().toISOString(), status: 'active' })
      .expect(409);
    // Cleanup
    await request(app.getHttpServer())
      .delete(`/clinician-patient-assignments/${tempAssignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });

  it('POST /clinician-patient-assignments - should fail with invalid patient/clinician', async () => {
    await request(app.getHttpServer())
      .post('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clinician_id: 'nonexistent', patient_id: patientId, assignment_date: new Date().toISOString(), status: 'active' })
      .expect(404);
    await request(app.getHttpServer())
      .post('/clinician-patient-assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clinician_id: clinicianId, patient_id: 'nonexistent', assignment_date: new Date().toISOString(), status: 'active' })
      .expect(404);
  });

  it('PATCH /clinician-patient-assignments/:assignmentId - should fail for non-existent assignment', async () => {
    await request(app.getHttpServer())
      .patch('/clinician-patient-assignments/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' })
      .expect(404);
  });

  it('DELETE /clinician-patient-assignments/:assignmentId - should fail for non-existent assignment', async () => {
    await request(app.getHttpServer())
      .delete('/clinician-patient-assignments/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('GET /clinician-patient-assignments/:assignmentId - should fail for non-existent assignment', async () => {
    await request(app.getHttpServer())
      .get('/clinician-patient-assignments/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('POST /clinician-patient-assignments - should fail without authentication', async () => {
    await request(app.getHttpServer())
      .post('/clinician-patient-assignments')
      .send({ clinician_id: clinicianId, patient_id: patientId, assignment_date: new Date().toISOString(), status: 'active' })
      .expect(401);
  });

  it('PATCH /clinician-patient-assignments/:assignmentId - should fail without permission', async () => {
    // otherClinician tries to update an assignment not their own
    await request(app.getHttpServer())
      .patch(`/clinician-patient-assignments/${createdAssignmentId}`)
      .set('Authorization', `Bearer ${otherClinicianToken}`)
      .send({ status: 'inactive' })
      .expect(403);
  });

  it('DELETE /clinician-patient-assignments/:assignmentId - should fail without permission', async () => {
    // otherClinician tries to delete an assignment not their own
    await request(app.getHttpServer())
      .delete(`/clinician-patient-assignments/${createdAssignmentId}`)
      .set('Authorization', `Bearer ${otherClinicianToken}`)
      .expect(403);
  });
});
