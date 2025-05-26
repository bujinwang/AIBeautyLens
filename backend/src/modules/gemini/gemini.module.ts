import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { PromptTemplateService } from './prompt-template.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [GeminiService, PromptTemplateService],
  controllers: [GeminiController],
  exports: [GeminiService],
})
export class GeminiModule {} 