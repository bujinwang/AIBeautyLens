import { IsString, IsNotEmpty, IsOptional, IsDateString, MinLength, MaxLength, IsEnum, IsUUID } from 'class-validator';
// Assuming you have a Gender enum defined elsewhere if needed, or use string validation
// import { Gender } from '../../common/enums/gender.enum'; 

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  full_name: string;

  // Assuming 'name' was intended as a duplicate of full_name or a different concept; 
  // based on Prisma schema, full_name seems primary. Keeping 'name' but making optional or clarifying.
  // If 'name' is distinct (e.g., preferred name), add validation accordingly.
  // For now, assuming full_name is the primary required name field.
  @IsString()
  @IsOptional() // Making optional based on Prisma schema having full_name as required string
  @MinLength(2)
  @MaxLength(255)
  name?: string; // Keeping based on original DTO, but role is unclear vs full_name

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string; // Consider using Date type later if needed

  @IsString()
  @IsOptional()
  // @IsEnum(Gender) // Use IsEnum if you define a Gender enum
  gender?: string; // Assuming gender is a string for now

  // Add other relevant fields based on your Patient schema in Prisma
  // Example: @IsString() @IsOptional() contact_info?: string;
  // Example: @IsString() @IsOptional() additional_phi_details?: string;
} 