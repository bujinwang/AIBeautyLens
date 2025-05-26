import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeEyeImageDto {
  @IsString()
  @IsNotEmpty()
  imageBase64: string;
} 