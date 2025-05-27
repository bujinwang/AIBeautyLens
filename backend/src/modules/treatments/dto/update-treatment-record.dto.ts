import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

// We can also use PartialType(OmitType(CreateTreatmentRecordDto, ['patientId']))
// if we don't want patientId to be updatable, for example.
// For now, defining explicitly for clarity.

export class UpdateTreatmentRecordDto {
  @ApiPropertyOptional({
    description: 'Date and time the treatment was administered',
    example: '2023-10-28T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Clinician notes about this specific treatment instance',
    example: 'Patient tolerated procedure well. Advised on post-treatment care. Follow up in 2 weeks.',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Total price of the treatment',
    example: 155.00,
    type: Number,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  totalPrice?: number;

  @ApiPropertyOptional({
    description: 'Currency code for the total price (ISO 4217)',
    example: 'CAD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  // patientId is typically not updatable for an existing record.
  // clinicianId might be updatable if a record was entered by mistake by another clinician,
  // but this depends on business rules. For now, assume not directly updatable via this DTO.

  @ApiPropertyOptional({
    description: 'ID of the treatment type administered',
    example: 'new-treatment-type-uuid-789',
  })
  @IsOptional()
  @IsUUID()
  treatmentTypeId?: string;

  @ApiPropertyOptional({
    description: 'Optional ID of the Firestore AnalysisRecord this treatment is related to. Can be null to remove link.',
    example: 'firestore-analysis-record-uuid-789',
    nullable: true,
  })
  @IsOptional()
  @IsString() // Assuming Firestore IDs are strings
  firestoreAnalysisRecordId?: string | null;
}