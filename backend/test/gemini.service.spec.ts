import { Test, TestingModule } from '@nestjs/testing';
import { HttpService, HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { GeminiService } from '../src/modules/gemini/gemini.service';
import { PromptTemplateService } from '../src/modules/gemini/prompt-template.service';
import { throwError } from 'rxjs';

describe('GeminiService (Unit)', () => {
  let service: GeminiService;
  let httpService: HttpService;
  let configService: ConfigService;
  let promptTemplateService: PromptTemplateService;

  const mockApiKey = 'mockApiKey';
  const mockApiUrl = 'mockApiUrl';
  const mockFacialPrompt = 'Facial Analysis Prompt';
  const mockEyePrompt = 'Eye Analysis Prompt';
  const mockBeforeAfterPrompt = 'Before After Analysis Prompt';
  const mockHairScalpPrompt = 'Hair Scalp Analysis Prompt';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        GeminiService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(() => of({ data: { result: 'mock response' } })), // Mock HttpService post method
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return mockApiKey;
              if (key === 'GEMINI_VISION_API') return mockApiUrl;
              return undefined;
            }),
          },
        },
        {
          provide: PromptTemplateService,
          useValue: {
            getPrompt: jest.fn((type: string) => {
              if (type === 'facial') return Promise.resolve(mockFacialPrompt);
              if (type === 'eye') return Promise.resolve(mockEyePrompt);
              if (type === 'beforeAfter') return Promise.resolve(mockBeforeAfterPrompt);
              if (type === 'hairScalp') return Promise.resolve(mockHairScalpPrompt);
              return Promise.resolve('');
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    promptTemplateService = module.get<PromptTemplateService>(PromptTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeFacialImage', () => {
    it('should fetch facial prompt and call Gemini API with correct payload', async () => {
      const base64Image = 'base64facialimage';
      const expectedPayload = {
        contents: [
          { parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: mockFacialPrompt },
          ] },
        ],
      };

      await service.analyzeFacialImage(base64Image);

      expect(promptTemplateService.getPrompt).toHaveBeenCalledWith('facial');
      expect(configService.get).toHaveBeenCalledWith('GEMINI_API_KEY');
      expect(configService.get).toHaveBeenCalledWith('GEMINI_VISION_API');
      expect(httpService.post).toHaveBeenCalledWith(
        `${mockApiUrl}?key=${mockApiKey}`,
        expectedPayload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
      );
    });

    it('should throw InternalServerErrorException on API call failure', async () => {
      jest.spyOn(httpService, 'post').mockImplementationOnce(() => {
        return throwError(() => new Error('API error'));
      });

      const base64Image = 'base64facialimage';

      await expect(service.analyzeFacialImage(base64Image)).rejects.toThrow(
        'Failed to analyze facial image',
      );
    });

    it('should throw InternalServerErrorException on prompt fetch failure', async () => {
      jest.spyOn(promptTemplateService, 'getPrompt').mockRejectedValueOnce(new Error('Prompt error'));

      const base64Image = 'base64facialimage';

      await expect(service.analyzeFacialImage(base64Image)).rejects.toThrow(
        'Failed to analyze facial image',
      );
    });
  });

  describe('analyzeEyeImage', () => {
    it('should fetch eye prompt and call Gemini API with correct payload', async () => {
      const base64Image = 'base64eyeimage';
      const expectedPayload = {
        contents: [
          { parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: mockEyePrompt },
          ] },
        ],
      };

      await service.analyzeEyeImage(base64Image);

      expect(promptTemplateService.getPrompt).toHaveBeenCalledWith('eye');
      expect(httpService.post).toHaveBeenCalledWith(
        `${mockApiUrl}?key=${mockApiKey}`,
        expectedPayload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
      );
    });
  });

  describe('analyzeBeforeAfter', () => {
    it('should fetch beforeAfter prompt and call Gemini API with correct payload', async () => {
      const beforeImage = 'base64before';
      const afterImage = 'base64after';
      const expectedPayload = {
        contents: [
          { parts: [
            { inlineData: { mimeType: 'image/jpeg', data: beforeImage } },
            { inlineData: { mimeType: 'image/jpeg', data: afterImage } },
            { text: mockBeforeAfterPrompt },
          ] },
        ],
      };

      await service.analyzeBeforeAfter(beforeImage, afterImage);

      expect(promptTemplateService.getPrompt).toHaveBeenCalledWith('beforeAfter');
      expect(httpService.post).toHaveBeenCalledWith(
        `${mockApiUrl}?key=${mockApiKey}`,
        expectedPayload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
      );
    });
  });

  describe('analyzeHairScalp', () => {
    it('should fetch hairScalp prompt and call Gemini API with correct payload', async () => {
      const base64Image = 'base64hairscalpimage';
      const expectedPayload = {
        contents: [
          { parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: mockHairScalpPrompt },
          ] },
        ],
      };

      await service.analyzeHairScalp(base64Image);

      expect(promptTemplateService.getPrompt).toHaveBeenCalledWith('hairScalp');
      expect(httpService.post).toHaveBeenCalledWith(
        `${mockApiUrl}?key=${mockApiKey}`,
        expectedPayload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 },
      );
    });
  });

  describe('sendGeminiRequest', () => {
    it('should throw error if API key or URL is not configured', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return undefined;
        if (key === 'GEMINI_VISION_API') return mockApiUrl;
        return undefined;
      });

      await expect((service as any).sendGeminiRequest([], '')).rejects.toThrow(
        'Failed to call Gemini API',
      );

      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return mockApiKey;
        if (key === 'GEMINI_VISION_API') return undefined;
        return undefined;
      });

      await expect((service as any).sendGeminiRequest([], '')).rejects.toThrow(
        'Failed to call Gemini API',
      );
    });
  });
}); 