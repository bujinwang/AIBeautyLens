import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum PromptType {
  FACIAL = 'facial',
  EYE = 'eye',
  BEFORE_AFTER = 'beforeAfter',
  HAIR_SCALP = 'hairScalp',
  CUSTOM = 'custom',
}

export class CreatePromptTemplateDto {
  @IsEnum(PromptType)
  @IsNotEmpty()
  type: PromptType;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePromptTemplateDto {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class GetPromptTemplateDto {
  @IsEnum(PromptType)
  @IsNotEmpty()
  type: PromptType;
} 