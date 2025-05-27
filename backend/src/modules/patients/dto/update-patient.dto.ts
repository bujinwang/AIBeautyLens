import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
 
export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  // Define additional properties or override if necessary for updating
  // Example: @IsOptional() @IsString() address?: string;
} 