import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  contact_info?: string;
} 