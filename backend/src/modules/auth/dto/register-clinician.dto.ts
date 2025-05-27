import { IsString, IsNotEmpty, MinLength, IsEmail, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class RegisterClinicianDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  // Roles might be assigned by an admin later, or a default role is set during registration.
  // For now, we won't expect it from the DTO directly during self-registration.
  // If admins can register clinicians, this DTO might need to be different or extended.
  // @IsArray()
  // @IsEnum(Role, { each: true })
  // @IsOptional()
  // roles?: Role[];
}