import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalysisRecordResponseDto {
  @ApiProperty({ description: 'Unique ID of the analysis record', example: 'analysis_789xyz' })
  analysisId: string;

  @ApiProperty({ description: 'ID of the image this analysis pertains to', example: 'image_abc123' })
  imageId: string;

  @ApiProperty({ description: 'Timestamp of when the analysis was performed or completed', example: '2023-10-27T10:30:00.000Z' })
  analysisTimestamp: Date; // Or string if you prefer ISO string format

  @ApiProperty({ description: 'Type of analysis performed', example: 'skin_hydration_v1' })
  analysisType: string;

  @ApiPropertyOptional({ description: 'ID of the prompt configuration used', example: 'prompt_config_abc_123' })
  promptConfigurationId?: string;

  @ApiPropertyOptional({
    description: 'Specific parameters used for this analysis run',
    type: 'object',
    additionalProperties: true,
    example: { sensitivity: 'high' },
  })
  analysisParameters?: Record<string, any>;

  @ApiProperty({ description: 'Current status of the analysis', example: 'completed' })
  analysisStatus: string; // e.g., 'pending', 'processing', 'completed', 'failed'

  @ApiPropertyOptional({
    description: 'The structured result from the AI analysis',
    type: 'object',
    additionalProperties: true, // Allows for flexible result structures
    example: { score: 0.85, feedback: 'Skin is well hydrated.' },
  })
  analysisResult?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Error message if the analysis failed' })
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'ID of the clinician who initiated this specific analysis, if applicable', example: 'clinician_def456' })
  initiatedByClinicianId?: string;
}