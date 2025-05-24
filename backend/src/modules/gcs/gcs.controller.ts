import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { GcsService } from './gcs.service';
import { GenerateSignedUrlDto } from './dto/generate-signed-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('gcs')
export class GcsController {
  constructor(private readonly gcsService: GcsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('signed-url')
  async generateSignedUrl(@Body() generateSignedUrlDto: GenerateSignedUrlDto) {
    const { filename, fileExtension } = generateSignedUrlDto;
    const url = await this.gcsService.generateSignedUrl(filename, fileExtension);
    return { url };
  }
}
