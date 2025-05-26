import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeFacialImageDto {
  @IsString()
  @IsNotEmpty()
  imageBase64: string;
} 