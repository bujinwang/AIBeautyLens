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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiController = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("./gemini.service");
const analyze_facial_image_dto_1 = require("./dto/analyze-facial-image.dto");
const analyze_eye_image_dto_1 = require("./dto/analyze-eye-image.dto");
const analyze_before_after_dto_1 = require("./dto/analyze-before-after.dto");
const analyze_hair_scalp_dto_1 = require("./dto/analyze-hair-scalp.dto");
let GeminiController = class GeminiController {
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async analyze(body) {
        return this.geminiService.analyzeFacialImage(body.imageBase64);
    }
    async analyzeEye(body) {
        return this.geminiService.analyzeEyeImage(body.imageBase64);
    }
    async analyzeBeforeAfter(body) {
        return this.geminiService.analyzeBeforeAfter(body.beforeImageBase64, body.afterImageBase64);
    }
    async analyzeHairScalp(body) {
        return this.geminiService.analyzeHairScalp(body.imageBase64);
    }
};
exports.GeminiController = GeminiController;
__decorate([
    (0, common_1.Post)('analyze'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_facial_image_dto_1.AnalyzeFacialImageDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)('analyze-eye'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_eye_image_dto_1.AnalyzeEyeImageDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeEye", null);
__decorate([
    (0, common_1.Post)('analyze-before-after'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_before_after_dto_1.AnalyzeBeforeAfterDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeBeforeAfter", null);
__decorate([
    (0, common_1.Post)('analyze-hair-scalp'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_hair_scalp_dto_1.AnalyzeHairScalpDto]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeHairScalp", null);
exports.GeminiController = GeminiController = __decorate([
    (0, common_1.Controller)('gemini'),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], GeminiController);
