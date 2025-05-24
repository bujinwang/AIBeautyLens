import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateSignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  fileExtension: string;
}
