import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeHairScalpDto {
  @IsString()
  @IsNotEmpty()
  imageBase64: string;
} 