import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PromptType } from './prompt-template.dto';

export class AnalyzeGcsImageDto {
  @IsString()
  @IsNotEmpty()
  gcsObjectName: string;

  @IsEnum(PromptType)
  @IsNotEmpty()
  promptType: PromptType;

  @IsString()
  @IsOptional()
  customPromptId?: string;
}

export class AnalyzeBeforeAfterGcsDto {
  @IsString()
  @IsNotEmpty()
  beforeImageGcsName: string;

  @IsString()
  @IsNotEmpty()
  afterImageGcsName: string;

  @IsEnum(PromptType)
  @IsNotEmpty()
  promptType: PromptType = PromptType.BEFORE_AFTER;

  @IsString()
  @IsOptional()
  customPromptId?: string;
} 