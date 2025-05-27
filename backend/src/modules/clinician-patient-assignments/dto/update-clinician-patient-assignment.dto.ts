import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicianPatientAssignmentDto } from './create-clinician-patient-assignment.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateClinicianPatientAssignmentDto extends PartialType(CreateClinicianPatientAssignmentDto) {
  @IsDateString()
  @IsOptional()
  assignment_date?: string;

  @IsString()
  @IsOptional()
  status?: string;
}