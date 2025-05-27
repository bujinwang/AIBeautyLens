import { Test, TestingModule } from '@nestjs/testing';
import { GeminiController } from '@backend/modules/gemini/gemini.controller';
import { GeminiService } from '@backend/modules/gemini/gemini.service';
import { AnalyzeFacialImageDto } from '@backend/modules/gemini/dto/analyze-facial-image.dto';
import { AnalyzeEyeImageDto } from '@backend/modules/gemini/dto/analyze-eye-image.dto';
import { AnalyzeBeforeAfterDto } from '@backend/modules/gemini/dto/analyze-before-after.dto';
import { AnalyzeHairScalpDto } from '@backend/modules/gemini/dto/analyze-hair-scalp.dto';

describe('GeminiController (Unit)', () => {
  let controller: GeminiController;
  let service: GeminiService;

  const mockGeminiService = {
    analyzeFacialImage: jest.fn().mockResolvedValue({}),
    analyzeEyeImage: jest.fn().mockResolvedValue({}),
    analyzeBeforeAfter: jest.fn().mockResolvedValue({}),
    analyzeHairScalp: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeminiController],
      providers: [
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
      ],
    }).compile();

    controller = module.get<GeminiController>(GeminiController);
    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('analyze', () => {
    it('should call analyzeFacialImage service method with correct data', async () => {
      const body: AnalyzeFacialImageDto = { imageBase64: 'testimage' };
      await controller.analyze(body);
      expect(service.analyzeFacialImage).toHaveBeenCalledWith('testimage');
    });
  });

  describe('analyzeEye', () => {
    it('should call analyzeEyeImage service method with correct data', async () => {
      const body: AnalyzeEyeImageDto = { imageBase64: 'testimage' };
      await controller.analyzeEye(body);
      expect(service.analyzeEyeImage).toHaveBeenCalledWith('testimage');
    });
  });

  describe('analyzeBeforeAfter', () => {
    it('should call analyzeBeforeAfter service method with correct data', async () => {
      const body: AnalyzeBeforeAfterDto = { beforeImageBase64: 'before', afterImageBase64: 'after' };
      await controller.analyzeBeforeAfter(body);
      expect(service.analyzeBeforeAfter).toHaveBeenCalledWith('before', 'after');
    });
  });

  describe('analyzeHairScalp', () => {
    it('should call analyzeHairScalp service method with correct data', async () => {
      const body: AnalyzeHairScalpDto = { imageBase64: 'testimage' };
      await controller.analyzeHairScalp(body);
      expect(service.analyzeHairScalp).toHaveBeenCalledWith('testimage');
    });
  });
}); 