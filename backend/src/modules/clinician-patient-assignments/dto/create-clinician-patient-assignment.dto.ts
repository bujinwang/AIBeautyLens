import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID } from 'class-validator';
// Consider adding an enum for status if you have predefined statuses
// import { AssignmentStatus } from '../../common/enums/assignment-status.enum';

export class CreateClinicianPatientAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  clinician_id: string;

  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsDateString()
  @IsOptional()
  assignment_date?: string; // Consider using Date type later if needed

  @IsString()
  @IsOptional()
  // @IsEnum(AssignmentStatus) // Use IsEnum if you define an AssignmentStatus enum
  status?: string; // e.g., active, inactive - consider an enum later
} 