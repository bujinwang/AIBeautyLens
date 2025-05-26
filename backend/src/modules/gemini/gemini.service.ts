import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PromptTemplateService } from './prompt-template.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly promptTemplateService: PromptTemplateService,
  ) {}

  async analyzeFacialImage(imageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt('facial');
      return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
    } catch (error) {
      const err = error as any;
      this.logger.error('Error in analyzeFacialImage', err.stack || err.message);
      throw new InternalServerErrorException('Failed to analyze facial image');
    }
  }

  async analyzeEyeImage(imageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt('eye');
      return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
    } catch (error) {
      const err = error as any;
      this.logger.error('Error in analyzeEyeImage', err.stack || err.message);
      throw new InternalServerErrorException('Failed to analyze eye image');
    }
  }

  async analyzeBeforeAfter(beforeImageBase64: string, afterImageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt('beforeAfter');
      return await this.sendGeminiRequest([
        { mimeType: 'image/jpeg', data: beforeImageBase64 },
        { mimeType: 'image/jpeg', data: afterImageBase64 },
      ], prompt);
    } catch (error) {
      const err = error as any;
      this.logger.error('Error in analyzeBeforeAfter', err.stack || err.message);
      throw new InternalServerErrorException('Failed to analyze before/after images');
    }
  }

  async analyzeHairScalp(imageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt('hairScalp');
      return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
    } catch (error) {
      const err = error as any;
      this.logger.error('Error in analyzeHairScalp', err.stack || err.message);
      throw new InternalServerErrorException('Failed to analyze hair/scalp image');
    }
  }

  private async sendGeminiRequest(images: { mimeType: string; data: string }[], prompt: string): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      const apiUrl = this.configService.get<string>('GEMINI_VISION_API');
      if (!apiKey || !apiUrl) {
        throw new Error('Gemini API key or URL not configured');
      }
      const body = {
        contents: [
          { parts: [
            ...images.map(img => ({ inlineData: img })),
            { text: prompt },
          ] },
        ],
      };
      const response = await this.httpService.post(`${apiUrl}?key=${apiKey}`, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }).toPromise();
      return response.data;
    } catch (error) {
      const err = error as any;
      this.logger.error('Error in sendGeminiRequest', err.stack || err.message);
      throw new InternalServerErrorException('Failed to call Gemini API');
    }
  }
} 