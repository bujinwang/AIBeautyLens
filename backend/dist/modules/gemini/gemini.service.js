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
        this.bucketName = this.configService.get('GCS_BUCKET_NAME');
        this.storage = new storage_1.Storage();
    }
    async analyzeFacialImage(imageBase64) {
        try {
            const prompt = await this.promptTemplateService.getPrompt(prompt_template_dto_1.PromptType.FACIAL);
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeFacialImage');
        }
    }
    async analyzeEyeImage(imageBase64) {
        try {
            const prompt = await this.promptTemplateService.getPrompt(prompt_template_dto_1.PromptType.EYE);
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeEyeImage');
        }
    }
    async analyzeBeforeAfter(beforeImageBase64, afterImageBase64) {
        try {
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
            const prompt = await this.promptTemplateService.getPrompt(prompt_template_dto_1.PromptType.HAIR_SCALP);
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            this.handleGeminiError(error, 'analyzeHairScalp');
        }
    }
    async analyzeGcsImage(gcsObjectName, promptType, customPromptId) {
        try {
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
    async sendGeminiRequest(images, prompt, options = { timeout: 30000, retries: 2 }) {
        let retries = options.retries || 2;
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
                const requestTimeout = options.timeout || 30000;
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
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        prompt_template_service_1.PromptTemplateService])
], GeminiService);
