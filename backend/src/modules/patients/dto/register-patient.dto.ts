import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class RegisterPatientDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsDateString()
  @IsOptional()
  date_of_birth?: string; // Using string for date to match typical HTML date input or ISO string

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  contact_info?: string;

  @IsString()
  @IsOptional()
  additional_phi_details?: string;
}