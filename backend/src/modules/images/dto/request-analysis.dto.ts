import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class RequestAnalysisDto {
  @ApiProperty({
    description: 'The type of analysis to perform (e.g., "pore_analysis_detailed").',
    example: 'pore_analysis_detailed',
  })
  @IsString()
  @IsNotEmpty()
  analysisType: string;

  @ApiPropertyOptional({
    description: 'ID of the prompt configuration to use for this analysis. If omitted, a default or type-specific prompt might be used.',
    example: 'prompt_config_xyz_456',
  })
  @IsOptional()
  @IsString()
  promptConfigurationId?: string;

  @ApiPropertyOptional({
    description: 'Any specific parameters for this particular analysis run. This is a free-form object.',
    example: { sensitivity: 'high', region: 'T-zone' },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  analysisParameters?: Record<string, any>;

  // initiatedByClinicianId will likely come from the authenticated user (e.g., JWT payload)
  // and not be part of the DTO sent by the client.
  // It will be added by the service/controller when creating the AnalysisRecord.
}