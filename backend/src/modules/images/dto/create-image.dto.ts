import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'The GCS path/name of the uploaded image.',
    example: 'patient-uploads/image123.jpg',
  })
  @IsString()
  @IsNotEmpty()
  gcsPath: string;

  @ApiProperty({
    description: 'The ID of the patient this image belongs to.',
    example: '07e75f48-2484-46a9-869c-99325e516133',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  // ClinicianId will likely come from the authenticated user (e.g., JWT payload)
  // and not be part of the DTO sent by the client for this specific action.
  // It will be added by the service/controller.

  @ApiPropertyOptional({
    description: 'The type of initial analysis to perform (e.g., "skin_hydration_v1"). If omitted, a default might be applied or no initial analysis triggered.',
    example: 'skin_hydration_v1',
  })
  @IsOptional()
  @IsString()
  initialAnalysisType?: string;

  @ApiPropertyOptional({
    description: 'ID of the prompt configuration to use for the initial analysis. Required if initialAnalysisType is provided and needs a specific prompt.',
    example: 'prompt_config_abc_123',
  })
  @IsOptional()
  @IsString()
  initialPromptConfigurationId?: string;
  
  @ApiPropertyOptional({
    description: 'Original filename of the uploaded image.',
    example: 'photo_01.jpg',
  })
  @IsOptional()
  @IsString()
  originalFileName?: string;

  @ApiPropertyOptional({
    description: 'Content type of the uploaded image.',
    example: 'image/jpeg',
  })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional({
    description: 'Optional notes provided by the clinician for this image.',
    example: 'Image taken pre-treatment, right cheek.',
  })
  @IsOptional()
  @IsString()
  imageNotes?: string;
}