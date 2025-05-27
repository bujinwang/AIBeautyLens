import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AnalysisRecordResponseDto } from './analysis-record-response.dto';

export class ImageResponseDto {
  @ApiProperty({ description: 'Unique ID of the image', example: 'image_abc123' })
  imageId: string;

  @ApiProperty({ description: 'GCS path of the image', example: 'patient-uploads/image123.jpg' })
  gcsPath: string;

  @ApiProperty({ description: 'ID of the patient this image belongs to', example: 'patient_uuid_123' })
  patientId: string;

  @ApiProperty({ description: 'ID of the clinician who uploaded/owns this image', example: 'clinician_uuid_456' })
  clinicianId: string;

  @ApiProperty({ description: 'Timestamp of when the image was uploaded', example: '2023-10-27T10:00:00.000Z' })
  uploadTimestamp: Date; // Or string

  @ApiPropertyOptional({ description: 'Original filename of the uploaded image', example: 'photo_01.jpg' })
  originalFileName?: string;

  @ApiPropertyOptional({ description: 'Content type of the image', example: 'image/jpeg' })
  contentType?: string;

  @ApiPropertyOptional({ description: 'Optional notes provided by the clinician for this image', example: 'Pre-treatment, right cheek.' })
  imageNotes?: string;

  @ApiProperty({
    description: 'List of analysis records associated with this image',
    type: [AnalysisRecordResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => AnalysisRecordResponseDto)
  analyses: AnalysisRecordResponseDto[];
}