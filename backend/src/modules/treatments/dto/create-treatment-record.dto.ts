import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTreatmentRecordDto {
  @ApiProperty({
    description: 'Date and time the treatment was administered',
    example: '2023-10-28T14:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string; // Will be transformed to Date object by NestJS

  @ApiPropertyOptional({
    description: 'Optional clinician notes about this specific treatment instance',
    example: 'Patient tolerated procedure well. Advised on post-treatment care.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Total price of the treatment',
    example: 150.75,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number) // Ensure transformation from string if data comes as form-data/query
  totalPrice: number; // Prisma will handle as Decimal

  @ApiProperty({
    description: 'Currency code for the total price (ISO 4217)',
    example: 'CAD',
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  currency: string;

  @ApiProperty({
    description: 'ID of the patient who received the treatment',
    example: 'patient-uuid-123',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  // clinicianId will be taken from the authenticated user context in the service/controller
  // It should not be part of the DTO sent by the client for creating a record for themselves or their patient.

  @ApiProperty({
    description: 'ID of the treatment type administered',
    example: 'treatment-type-uuid-456',
  })
  @IsUUID()
  @IsNotEmpty()
  treatmentTypeId: string;

  @ApiPropertyOptional({
    description: 'Optional ID of the Firestore AnalysisRecord this treatment is related to',
    example: 'firestore-analysis-record-uuid-789',
  })
  @IsOptional()
  @IsString() // Assuming Firestore IDs are strings
  firestoreAnalysisRecordId?: string;
}