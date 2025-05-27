import { Injectable, InternalServerErrorException, Logger, BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PromptTemplateService } from './prompt-template.service';
import { Storage } from '@google-cloud/storage';
import { firstValueFrom } from 'rxjs';
import { PromptType } from './dto/prompt-template.dto';
import { catchError, timeout } from 'rxjs/operators';
import { AxiosError } from 'axios';

interface GeminiError {
  code: number;
  message: string;
  status: string;
}

interface GeminiApiOptions {
  timeout?: number;
  retries?: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private storage: Storage;
  private bucketName: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly promptTemplateService: PromptTemplateService,
  ) {
    this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME')!;
    this.storage = new Storage();
  }

  async analyzeFacialImage(imageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt(PromptType.FACIAL);
      return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
    } catch (error) {
      this.handleGeminiError(error, 'analyzeFacialImage');
    }
  }

  async analyzeEyeImage(imageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt(PromptType.EYE);
      return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
    } catch (error) {
      this.handleGeminiError(error, 'analyzeEyeImage');
    }
  }

  async analyzeBeforeAfter(beforeImageBase64: string, afterImageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt(PromptType.BEFORE_AFTER);
      return await this.sendGeminiRequest([
        { mimeType: 'image/jpeg', data: beforeImageBase64 },
        { mimeType: 'image/jpeg', data: afterImageBase64 },
      ], prompt);
    } catch (error) {
      this.handleGeminiError(error, 'analyzeBeforeAfter');
    }
  }

  async analyzeHairScalp(imageBase64: string): Promise<any> {
    try {
      const prompt = await this.promptTemplateService.getPrompt(PromptType.HAIR_SCALP);
      return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
    } catch (error) {
      this.handleGeminiError(error, 'analyzeHairScalp');
    }
  }

  async analyzeGcsImage(gcsObjectName: string, promptType: PromptType, customPromptId?: string): Promise<any> {
    try {
      // Download image from GCS
      const imageBase64 = await this.downloadImageFromGcs(gcsObjectName);
      
      // Get appropriate prompt
      const prompt = await this.promptTemplateService.getPrompt(
        promptType, 
        customPromptId
      );
      
      // Analyze image
      return await this.sendGeminiRequest([{ mimeType: this.getMimeType(gcsObjectName), data: imageBase64 }], prompt);
    } catch (error) {
      this.handleGeminiError(error, 'analyzeGcsImage');
    }
  }

  async analyzeBeforeAfterGcs(
    beforeImageGcsName: string,
    afterImageGcsName: string,
    promptType: PromptType = PromptType.BEFORE_AFTER,
    customPromptId?: string
  ): Promise<any> {
    try {
      // Download images from GCS
      const beforeImageBase64 = await this.downloadImageFromGcs(beforeImageGcsName);
      const afterImageBase64 = await this.downloadImageFromGcs(afterImageGcsName);
      
      // Get appropriate prompt
      const prompt = await this.promptTemplateService.getPrompt(
        promptType,
        customPromptId
      );
      
      // Analyze images
      return await this.sendGeminiRequest([
        { mimeType: this.getMimeType(beforeImageGcsName), data: beforeImageBase64 },
        { mimeType: this.getMimeType(afterImageGcsName), data: afterImageBase64 },
      ], prompt);
    } catch (error) {
      this.handleGeminiError(error, 'analyzeBeforeAfterGcs');
    }
  }

  private async downloadImageFromGcs(objectName: string): Promise<string> {
    try {
      const file = this.storage.bucket(this.bucketName).file(objectName);
      const exists = await file.exists();
      
      if (!exists[0]) {
        throw new NotFoundException(`File "${objectName}" not found in GCS bucket`);
      }
      
      const fileContents = await file.download();
      return fileContents[0].toString('base64');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error downloading file from GCS: ${objectName}`, error);
      throw new InternalServerErrorException(`Failed to download image from GCS: ${errorMessage}`);
    }
  }

  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'bmp':
        return 'image/bmp';
      default:
        return 'image/jpeg'; // Default fallback
    }
  }

  private handleGeminiError(error: any, methodName: string): never {
    const err = error as any;
    
    // Handle specific error types
    if (error instanceof NotFoundException) {
      throw error;
    }
    
    if (error instanceof BadRequestException) {
      throw error;
    }
    
    // Log the error with stack trace if available
    this.logger.error(`Error in ${methodName}`, err.stack || err.message);
    
    // Check for specific Gemini API errors
    if (err.response?.data?.error) {
      const geminiError = err.response.data.error as GeminiError;
      
      switch (geminiError.code) {
        case 400:
          throw new BadRequestException(`Gemini API error: ${geminiError.message}`);
        case 401:
        case 403:
          throw new BadRequestException(`Authentication error with Gemini API: ${geminiError.message}`);
        case 429:
          throw new ServiceUnavailableException('Rate limit exceeded for Gemini API');
        case 500:
        case 502:
        case 503:
          throw new ServiceUnavailableException(`Gemini API service error: ${geminiError.message}`);
        default:
          throw new InternalServerErrorException(`Gemini API error: ${geminiError.message}`);
      }
    }
    
    // Check for timeout or network errors
    if (err.code === 'ECONNABORTED' || (typeof err.message === 'string' && err.message.includes('timeout'))) {
      throw new ServiceUnavailableException('Request to Gemini API timed out');
    }
    
    // Default error
    const errorMessage = err.message instanceof Error ? err.message.toString() : 
                         typeof err.message === 'string' ? err.message : 'Unknown error';
    throw new InternalServerErrorException(`Failed to analyze image: ${errorMessage}`);
  }

  private async sendGeminiRequest(
    images: { mimeType: string; data: string }[], 
    prompt: string,
    options: GeminiApiOptions = { timeout: 30000, retries: 2 }
  ): Promise<any> {
    let retries = options.retries || 2;
    let lastError: any;
    
    while (retries >= 0) {
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
        
        const requestTimeout = options.timeout || 30000;
        
        const response = await firstValueFrom(
          this.httpService.post(`${apiUrl}?key=${apiKey}`, body, {
            headers: { 'Content-Type': 'application/json' },
          }).pipe(
            timeout(requestTimeout),
            catchError((error: AxiosError) => {
              throw error;
            })
          )
        );
        
        return response.data;
      } catch (error) {
        lastError = error;
        retries--;
        
        if (retries >= 0) {
          this.logger.warn(`Retrying Gemini API request. Attempts remaining: ${retries}`);
          // Add exponential backoff for retries
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, options.retries! - retries)));
        }
      }
    }
    
    // If we reach here, all retries failed
    throw lastError;
  }
} 