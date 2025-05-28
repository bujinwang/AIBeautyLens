import { Role } from '../enums/role.enum';

export interface AuthenticatedUser {
  userId: string; // This will be the clinicianId or patientId
  email: string;
  roles: Role[];
  patientId?: string; // Optional: if the user is a patient, their patient_id
}
