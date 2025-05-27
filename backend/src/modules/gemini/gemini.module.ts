import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { PromptTemplateService } from './prompt-template.service';
import { GcsModule } from '../gcs/gcs.module';

@Module({
  imports: [
    HttpModule, 
    ConfigModule,
    GcsModule
  ],
  providers: [GeminiService, PromptTemplateService],
  controllers: [GeminiController],
  exports: [GeminiService, PromptTemplateService],
})
export class GeminiModule {} 