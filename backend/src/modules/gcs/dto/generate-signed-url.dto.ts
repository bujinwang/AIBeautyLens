import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class GenerateSignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  fileExtension: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  expirationMinutes?: number;
}
