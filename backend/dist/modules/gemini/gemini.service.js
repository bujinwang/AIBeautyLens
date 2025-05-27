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
let GeminiService = GeminiService_1 = class GeminiService {
    constructor(httpService, configService, promptTemplateService) {
        this.httpService = httpService;
        this.configService = configService;
        this.promptTemplateService = promptTemplateService;
        this.logger = new common_1.Logger(GeminiService_1.name);
    }
    async analyzeFacialImage(imageBase64) {
        try {
            const prompt = await this.promptTemplateService.getPrompt('facial');
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            const err = error;
            this.logger.error('Error in analyzeFacialImage', err.stack || err.message);
            throw new common_1.InternalServerErrorException('Failed to analyze facial image');
        }
    }
    async analyzeEyeImage(imageBase64) {
        try {
            const prompt = await this.promptTemplateService.getPrompt('eye');
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            const err = error;
            this.logger.error('Error in analyzeEyeImage', err.stack || err.message);
            throw new common_1.InternalServerErrorException('Failed to analyze eye image');
        }
    }
    async analyzeBeforeAfter(beforeImageBase64, afterImageBase64) {
        try {
            const prompt = await this.promptTemplateService.getPrompt('beforeAfter');
            return await this.sendGeminiRequest([
                { mimeType: 'image/jpeg', data: beforeImageBase64 },
                { mimeType: 'image/jpeg', data: afterImageBase64 },
            ], prompt);
        }
        catch (error) {
            const err = error;
            this.logger.error('Error in analyzeBeforeAfter', err.stack || err.message);
            throw new common_1.InternalServerErrorException('Failed to analyze before/after images');
        }
    }
    async analyzeHairScalp(imageBase64) {
        try {
            const prompt = await this.promptTemplateService.getPrompt('hairScalp');
            return await this.sendGeminiRequest([{ mimeType: 'image/jpeg', data: imageBase64 }], prompt);
        }
        catch (error) {
            const err = error;
            this.logger.error('Error in analyzeHairScalp', err.stack || err.message);
            throw new common_1.InternalServerErrorException('Failed to analyze hair/scalp image');
        }
    }
    async sendGeminiRequest(images, prompt) {
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
            const response = await this.httpService.post(`${apiUrl}?key=${apiKey}`, body, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            }).toPromise();
            return response.data;
        }
        catch (error) {
            const err = error;
            this.logger.error('Error in sendGeminiRequest', err.stack || err.message);
            throw new common_1.InternalServerErrorException('Failed to call Gemini API');
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
