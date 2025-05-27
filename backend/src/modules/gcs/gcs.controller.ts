import { Controller, Post, Body, UseGuards, Req, HttpCode, Get } from '@nestjs/common';
import { GcsService } from './gcs.service';
import { GenerateSignedUrlDto } from './dto/generate-signed-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('gcs')
export class GcsController {
  constructor(private readonly gcsService: GcsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('signed-url')
  @HttpCode(200)
  async generateSignedUrl(@Body() generateSignedUrlDto: GenerateSignedUrlDto, @Req() req: Request) {
    const { filename, fileExtension, expirationMinutes } = generateSignedUrlDto;
    const ip = req.ip || 'unknown';
    
    const url = await this.gcsService.generateSignedUrl(
      filename, 
      fileExtension, 
      expirationMinutes,
      ip
    );
    
    return { url };
  }

  @UseGuards(JwtAuthGuard)
  @Post('log-upload-success')
  @HttpCode(200)
  async logUploadSuccess(@Body() { objectName }: { objectName: string }, @Req() req: Request) {
    await this.gcsService.logSuccessfulUpload(objectName, req.ip || 'unknown');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('log-upload-failure')
  @HttpCode(200)
  async logUploadFailure(
    @Body() { objectName, error }: { objectName: string; error: string }, 
    @Req() req: Request
  ) {
    await this.gcsService.logFailedUpload(objectName, error, req.ip || 'unknown');
    return { success: true };
  }
  
  // Test endpoint - no authentication required
  @Get('test-health')
  @HttpCode(200)
  async testHealth() {
    return { status: 'ok', message: 'GCS service is healthy' };
  }
  
  // Test endpoint for signed URL - no authentication required
  @Post('test-signed-url')
  @HttpCode(200)
  async testSignedUrl(@Body() generateSignedUrlDto: GenerateSignedUrlDto, @Req() req: Request) {
    const { filename, fileExtension, expirationMinutes } = generateSignedUrlDto;
    const ip = req.ip || 'unknown';
    
    try {
      const url = await this.gcsService.generateSignedUrl(
        filename, 
        fileExtension, 
        expirationMinutes,
        ip
      );
      
      return { url };
    } catch (error: any) {
      return { 
        error: error.message || String(error),
        note: 'This is a test endpoint. In production, use the authenticated endpoint.'
      };
    }
  }
}
