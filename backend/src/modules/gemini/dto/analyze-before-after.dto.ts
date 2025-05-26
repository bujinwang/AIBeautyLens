import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeBeforeAfterDto {
  @IsString()
  @IsNotEmpty()
  beforeImageBase64: string;

  @IsString()
  @IsNotEmpty()
  afterImageBase64: string;
} 