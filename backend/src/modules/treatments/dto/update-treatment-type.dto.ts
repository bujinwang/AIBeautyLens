import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateTreatmentTypeDto {
  @ApiPropertyOptional({
    description: 'New name of the treatment type',
    example: 'Advanced Microdermabrasion',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'New description for the treatment type',
    example: 'An advanced minimally invasive procedure to renew overall skin tone and texture, with added serum infusion.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Set whether the treatment type is active and available for use',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}