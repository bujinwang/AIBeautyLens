import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePatientByClinicianDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsOptional()
  contact_info?: string;

  @IsString()
  @IsOptional()
  additional_phi_details?: string;
}