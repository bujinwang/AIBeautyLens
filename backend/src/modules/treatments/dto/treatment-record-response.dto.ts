import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreatmentTypeResponseDto } from './treatment-type-response.dto';
// Import minimal Patient/Clinician DTOs if you want to nest their basic info
// For now, keeping it simple with IDs, full objects can be fetched separately if needed.

export class TreatmentRecordResponseDto {
  @ApiProperty({ description: 'Unique ID of the treatment record', example: 'uuid-for-treatment-record' })
  id: string;

  @ApiProperty({ description: 'Date and time the treatment was administered', example: '2023-10-28T14:30:00.000Z' })
  date: Date; // Or string

  @ApiPropertyOptional({
    description: 'Clinician notes about this specific treatment instance',
    example: 'Patient tolerated procedure well.',
  })
  notes?: string;

  @ApiProperty({ description: 'Total price of the treatment', example: 150.75, type: Number })
  totalPrice: number; // Prisma Decimal will be serialized to number or string based on setup

  @ApiProperty({ description: 'Currency code for the total price (ISO 4217)', example: 'CAD' })
  currency: string;

  @ApiProperty({ description: 'ID of the patient who received the treatment', example: 'patient-uuid-123' })
  patientId: string;

  // @ApiProperty({ type: () => MinimalPatientResponseDto }) // Example if nesting patient info
  // patient: MinimalPatientResponseDto;

  @ApiProperty({ description: 'ID of the clinician who administered/recorded the treatment', example: 'clinician-uuid-456' })
  clinicianId: string;

  // @ApiProperty({ type: () => MinimalClinicianResponseDto }) // Example if nesting clinician info
  // clinician: MinimalClinicianResponseDto;

  @ApiProperty({ description: 'ID of the treatment type administered', example: 'treatment-type-uuid-789' })
  treatmentTypeId: string;

  @ApiProperty({ type: () => TreatmentTypeResponseDto, description: 'Details of the treatment type administered' })
  treatmentType: TreatmentTypeResponseDto; // Embed the treatment type details

  @ApiPropertyOptional({
    description: 'Optional ID of the Firestore AnalysisRecord this treatment is related to',
    example: 'firestore-analysis-record-uuid-789',
  })
  firestoreAnalysisRecordId?: string;

  @ApiProperty({ description: 'Timestamp of when the record was created', example: '2023-10-28T14:35:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of when the record was last updated', example: '2023-10-28T14:35:00.000Z' })
  updatedAt: Date;
}