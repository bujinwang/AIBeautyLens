import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTreatmentTypeDto {
  @ApiProperty({
    description: 'Name of the treatment type',
    example: 'Microdermabrasion',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description for the treatment type',
    example: 'A minimally invasive procedure to renew overall skin tone and texture.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // isActive will be true by default in the Prisma model
}