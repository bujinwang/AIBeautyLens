"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const prompt_template_service_1 = require("./prompt-template.service");
const storage_1 = require("@google-cloud/storage");
const rxjs_1 = require("rxjs");
const prompt_template_dto_1 = require("./dto/prompt-template.dto");
const operators_1 = require("rxjs/operators");
let GeminiService = GeminiService_1 = class GeminiService {
    constructor(httpService, configService, promptTemplateService) {
        this.httpService = httpService;
        this.configService = configService;
        this.promptTemplateService = promptTemplateService;
        this.logger = new common_1.Logger(GeminiService_1.name);
        this.useMockData = true;
        this.bucketName = this.configService.get('GCS_BUCKET_NAME');
        this.storage = new storage_1.Storage();
        this.useMockData = this.configService.get('USE_MOCK_DATA') !== 'false';
        this.logger.log(`GeminiService initialized with useMockData: ${this.useMockData}`);
    }
    async analyzeFacialImage(imageBase64) {
        try {
            if (this.useMockData) {
                return this.getMockFacialAnalysisResult();
            }
            const prompt = await this.promptTemplateService.getPrompt(prompt_template_dto_1.PromptType.FACIAL);
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeFacialImage');
        }
    }
    async analyzeEyeImage(imageBase64) {
        try {
            if (this.useMockData) {
                return this.getMockEyeAnalysisResult();
            }
            const prompt = await this.promptTemplateService.getPrompt(prompt_template_dto_1.PromptType.EYE);
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeEyeImage');
        }
    }
    async analyzeBeforeAfter(beforeImageBase64, afterImageBase64) {
        try {
            if (this.useMockData) {
                return this.getMockBeforeAfterAnalysisResult();
            }
            const prompt = await this.promptTemplateService.getPrompt(prompt_template_dto_1.PromptType.BEFORE_AFTER);
            return await this.sendGeminiRequest([
                { mimeType: 'image/jpeg', data: beforeImageBase64 },
                { mimeType: 'image/jpeg', data: afterImageBase64 },
            ], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeBeforeAfter');
        }
    }
    async analyzeHairScalp(imageBase64) {
        try {
            if (this.useMockData) {
                return this.getMockHairScalpAnalysisResult();
            }
            const prompt = await this.promptTemplateService.getPrompt(prompt_template_dto_1.PromptType.HAIR_SCALP);
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeHairScalp');
        }
    }
    async analyzeGcsImage(gcsObjectName, promptType, customPromptId) {
        try {
            if (this.useMockData) {
                return this.getMockDataForPromptType(promptType);
            }
            const imageBase64 = await this.downloadImageFromGcs(gcsObjectName);
            const prompt = await this.promptTemplateService.getPrompt(promptType, customPromptId);
            return await this.sendGeminiRequest([{ mimeType: this.getMimeType(gcsObjectName), data: imageBase64 }], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeGcsImage');
        }
    }
    async analyzeBeforeAfterGcs(beforeImageGcsName, afterImageGcsName, promptType = prompt_template_dto_1.PromptType.BEFORE_AFTER, customPromptId) {
        try {
            if (this.useMockData) {
                return this.getMockBeforeAfterAnalysisResult();
            }
            const beforeImageBase64 = await this.downloadImageFromGcs(beforeImageGcsName);
            const afterImageBase64 = await this.downloadImageFromGcs(afterImageGcsName);
            const prompt = await this.promptTemplateService.getPrompt(promptType, customPromptId);
            return await this.sendGeminiRequest([
                { mimeType: this.getMimeType(beforeImageGcsName), data: beforeImageBase64 },
                { mimeType: this.getMimeType(afterImageGcsName), data: afterImageBase64 },
            ], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeBeforeAfterGcs');
        }
    }
    async downloadImageFromGcs(objectName) {
        try {
            const file = this.storage.bucket(this.bucketName).file(objectName);
            const exists = await file.exists();
            if (!exists[0]) {
                throw new common_1.NotFoundException(`File "${objectName}" not found in GCS bucket`);
            }
            const fileContents = await file.download();
            return fileContents[0].toString('base64');
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error downloading file from GCS: ${objectName}`, error);
            throw new common_1.InternalServerErrorException(`Failed to download image from GCS: ${errorMessage}`);
        }
    }
    getMimeType(filename) {
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
                return 'image/jpeg';
        }
    }
    handleGeminiError(error, methodName) {
        const err = error;
        if (error instanceof common_1.NotFoundException) {
            throw error;
        }
        if (error instanceof common_1.BadRequestException) {
            throw error;
        }
        this.logger.error(`Error in ${methodName}`, err.stack || err.message);
        if (err.response?.data?.error) {
            const geminiError = err.response.data.error;
            switch (geminiError.code) {
                case 400:
                    throw new common_1.BadRequestException(`Gemini API error: ${geminiError.message}`);
                case 401:
                case 403:
                    throw new common_1.BadRequestException(`Authentication error with Gemini API: ${geminiError.message}`);
                case 429:
                    throw new common_1.ServiceUnavailableException('Rate limit exceeded for Gemini API');
                case 500:
                case 502:
                case 503:
                    throw new common_1.ServiceUnavailableException(`Gemini API service error: ${geminiError.message}`);
                default:
                    throw new common_1.InternalServerErrorException(`Gemini API error: ${geminiError.message}`);
            }
        }
        if (err.code === 'ECONNABORTED' || (typeof err.message === 'string' && err.message.includes('timeout'))) {
            throw new common_1.ServiceUnavailableException('Request to Gemini API timed out');
        }
        const errorMessage = err.message instanceof Error ? err.message.toString() :
            typeof err.message === 'string' ? err.message : 'Unknown error';
        throw new common_1.InternalServerErrorException(`Failed to analyze image: ${errorMessage}`);
    }
    async sendGeminiRequest(images, prompt, options = { timeout: 90000, retries: 3 }) {
        let retries = options.retries || 3;
        let lastError;
        while (retries >= 0) {
            try {
                const apiKey = this.configService.get('GEMINI_API_KEY');
                const apiUrl = this.configService.get('GEMINI_VISION_API');
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
                const requestTimeout = options.timeout || 90000;
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${apiUrl}?key=${apiKey}`, body, {
                    headers: { 'Content-Type': 'application/json' },
                }).pipe((0, operators_1.timeout)(requestTimeout), (0, operators_1.catchError)((error) => {
                    throw error;
                })));
                return response.data;
            }
            catch (error) {
                lastError = error;
                retries--;
                if (retries >= 0) {
                    this.logger.warn(`Retrying Gemini API request. Attempts remaining: ${retries}`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, options.retries - retries)));
                }
            }
        }
        throw lastError;
    }
    getMockFacialAnalysisResult() {
        return {
            estimatedAge: "30-35",
            gender: "Female",
            genderConfidence: 0.95,
            skinType: "Combination",
            features: [
                { description: "Fine lines around eyes", severity: 2 },
                { description: "Mild hyperpigmentation on cheeks", severity: 3 },
                { description: "Slight uneven skin tone", severity: 2 }
            ],
            recommendations: [
                { treatmentId: "hydrafacial", reason: "To improve skin texture and tone" },
                { treatmentId: "chemical-peel", reason: "To address hyperpigmentation" },
                { treatmentId: "botox", reason: "To minimize fine lines around eyes" }
            ],
            skinConcerns: ["dryness", "fine_lines", "uneven_tone"],
            analysisNotes: "The skin shows signs of early aging and sun damage. Hydration and sun protection would be beneficial."
        };
    }
    getMockEyeAnalysisResult() {
        return {
            concerns: [
                { name: "Fine lines", severity: 2, location: "Outer corners" },
                { name: "Mild puffiness", severity: 2, location: "Under eyes" },
                { name: "Slight dark circles", severity: 2, location: "Under eyes" }
            ],
            recommendations: [
                { name: "Eye-specific retinol", reason: "To address fine lines" },
                { name: "Caffeine eye serum", reason: "To reduce puffiness and dark circles" },
                { name: "Regular hydration", reason: "To maintain skin elasticity" }
            ],
            generalAdvice: "Maintain a consistent skincare routine and ensure adequate sleep to reduce puffiness. Consider using sunglasses in bright conditions to prevent squinting which contributes to fine lines."
        };
    }
    getMockBeforeAfterAnalysisResult() {
        return {
            improvement: "Significant improvement observed",
            skinToneChange: "More even and brighter skin tone",
            textureChange: "Smoother texture with reduced roughness",
            wrinkleReduction: "Approximately 30% reduction in fine lines",
            moistureLevel: "Improved hydration visible in skin plumpness",
            recommendations: [
                "Continue with current regimen focusing on hydration",
                "Add a weekly exfoliation treatment for enhanced results",
                "Maintain consistent sunscreen application"
            ]
        };
    }
    getMockHairScalpAnalysisResult() {
        return {
            scalpCondition: {
                dryness: "Moderate",
                inflammation: "Minimal",
                scaliness: "Slight",
                oiliness: "Normal"
            },
            hairCondition: {
                density: "Medium",
                breakage: "Minimal",
                thinning: "Slight at temples",
                texture: "Medium"
            },
            diagnosis: "Mild androgenetic alopecia with some dryness",
            recommendations: [
                "Ketoconazole-based shampoo twice weekly",
                "Daily scalp massage to improve circulation",
                "Topical minoxidil 5% for thinning areas",
                "Biotin supplement"
            ]
        };
    }
    getMockDataForPromptType(promptType) {
        switch (promptType) {
            case prompt_template_dto_1.PromptType.FACIAL:
                return this.getMockFacialAnalysisResult();
            case prompt_template_dto_1.PromptType.EYE:
                return this.getMockEyeAnalysisResult();
            case prompt_template_dto_1.PromptType.BEFORE_AFTER:
                return this.getMockBeforeAfterAnalysisResult();
            case prompt_template_dto_1.PromptType.HAIR_SCALP:
                return this.getMockHairScalpAnalysisResult();
            default:
                return this.getMockFacialAnalysisResult();
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        prompt_template_service_1.PromptTemplateService])
], GeminiService);
