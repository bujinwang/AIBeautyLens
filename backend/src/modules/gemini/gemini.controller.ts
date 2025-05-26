import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AnalyzeFacialImageDto } from './dto/analyze-facial-image.dto';
import { AnalyzeEyeImageDto } from './dto/analyze-eye-image.dto';
import { AnalyzeBeforeAfterDto } from './dto/analyze-before-after.dto';
import { AnalyzeHairScalpDto } from './dto/analyze-hair-scalp.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('analyze')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async analyze(@Body() body: AnalyzeFacialImageDto) {
    return this.geminiService.analyzeFacialImage(body.imageBase64);
  }

  @Post('analyze-eye')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async analyzeEye(@Body() body: AnalyzeEyeImageDto) {
    return this.geminiService.analyzeEyeImage(body.imageBase64);
  }

  @Post('analyze-before-after')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async analyzeBeforeAfter(@Body() body: AnalyzeBeforeAfterDto) {
    return this.geminiService.analyzeBeforeAfter(body.beforeImageBase64, body.afterImageBase64);
  }

  @Post('analyze-hair-scalp')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async analyzeHairScalp(@Body() body: AnalyzeHairScalpDto) {
    return this.geminiService.analyzeHairScalp(body.imageBase64);
  }
} 