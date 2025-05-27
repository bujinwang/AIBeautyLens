import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TreatmentTypeResponseDto {
  @ApiProperty({ description: 'Unique ID of the treatment type', example: 'uuid-for-treatment-type' })
  id: string;

  @ApiProperty({ description: 'Name of the treatment type', example: 'Microdermabrasion' })
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description for the treatment type',
    example: 'A minimally invasive procedure to renew overall skin tone and texture.',
  })
  description?: string;

  @ApiProperty({ description: 'Indicates if the treatment type is active and available for use', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp of when the treatment type was created', example: '2023-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of when the treatment type was last updated', example: '2023-10-27T10:00:00.000Z' })
  updatedAt: Date;
}