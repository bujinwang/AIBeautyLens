import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Param, Patch, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PromptTemplateService } from './prompt-template.service';
import { AnalyzeFacialImageDto } from './dto/analyze-facial-image.dto';
import { AnalyzeEyeImageDto } from './dto/analyze-eye-image.dto';
import { AnalyzeBeforeAfterDto } from './dto/analyze-before-after.dto';
import { AnalyzeHairScalpDto } from './dto/analyze-hair-scalp.dto';
import { AnalyzeGcsImageDto, AnalyzeBeforeAfterGcsDto } from './dto/analyze-gcs-image.dto';
import { CreatePromptTemplateDto, UpdatePromptTemplateDto, GetPromptTemplateDto, PromptType } from './dto/prompt-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('gemini')
export class GeminiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly promptTemplateService: PromptTemplateService,
  ) {}

  // Image analysis endpoints using Base64
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

  // Image analysis endpoints using GCS
  @UseGuards(JwtAuthGuard)
  @Post('analyze-gcs')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async analyzeGcsImage(@Body() body: AnalyzeGcsImageDto) {
    return this.geminiService.analyzeGcsImage(
      body.gcsObjectName,
      body.promptType,
      body.customPromptId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('analyze-before-after-gcs')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async analyzeBeforeAfterGcs(@Body() body: AnalyzeBeforeAfterGcsDto) {
    return this.geminiService.analyzeBeforeAfterGcs(
      body.beforeImageGcsName,
      body.afterImageGcsName,
      body.promptType,
      body.customPromptId
    );
  }

  // Prompt template management endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('prompts')
  async getAllPromptTemplates() {
    return this.promptTemplateService.getAllPromptTemplates();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Clinician)
  @Post('prompts/by-type')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async getPromptTemplatesByType(@Body() body: GetPromptTemplateDto) {
    return this.promptTemplateService.getPromptTemplatesByType(body.type);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Clinician)
  @Get('prompts/:id')
  async getPromptTemplateById(@Param('id') id: string) {
    return this.promptTemplateService.getPromptTemplateById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('prompts')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createPromptTemplate(@Body() body: CreatePromptTemplateDto) {
    // Additional validation for CUSTOM type prompts
    if (body.type === PromptType.CUSTOM && (!body.name || !body.description)) {
      throw new BadRequestException('CUSTOM prompt templates require a name and description');
    }
    return this.promptTemplateService.createPromptTemplate(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch('prompts/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updatePromptTemplate(
    @Param('id') id: string,
    @Body() body: UpdatePromptTemplateDto,
  ) {
    return this.promptTemplateService.updatePromptTemplate(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete('prompts/:id')
  async deletePromptTemplate(@Param('id') id: string) {
    await this.promptTemplateService.deletePromptTemplate(id);
    return { success: true, message: 'Prompt template deleted successfully' };
  }
} 